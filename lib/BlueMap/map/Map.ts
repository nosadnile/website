/*
 * This file is part of BlueMap, licensed under the MIT License (MIT).
 *
 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
 * Copyright (c) contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import {
    ClampToEdgeWrapping,
    Color,
    FileLoader,
    FrontSide,
    IUniform,
    NearestFilter,
    NearestMipMapLinearFilter,
    Raycaster,
    ShaderMaterial,
    Texture,
    Vector3,
} from "three";
import {
    alert,
    dispatchEvent,
    generateCacheHash,
    getPixel,
    hashTile,
    stringToImage,
    vecArrToObj,
} from "../util/Utils";
import { TileManager } from "./TileManager";
import { TileLoader } from "./TileLoader";
import { LowresTileLoader } from "./LowresTileLoader";
import { reactive } from "vue";
import { Tile } from "./Tile";

export interface Vec3 {
    x: number;
    y?: number;
    z: number;
}

export interface TextureData {
    resourcePath: string;
    color: number[];
    halfTransparent: boolean;
    texture: string;
}

export interface MapData {
    id: string;
    sorting: number;
    dataUrl: string;
    settingsUrl: string;
    texturesUrl: string;
    name: string;
    startPos: Vec3;
    skyColor: Color;
    ambientLight: number;
    hires: {
        tileSize: Vec3;
        scale: Vec3;
        translate: Vec3;
    };
    lowres: {
        tileSize: Vec3;
        lodFactor: number;
        lodCount: number;
    };
}

export class Map {
    public loadBlocker: () => Promise<void>;
    public events?: EventTarget;
    public data: MapData;
    public raycaster: Raycaster;
    public hiresMaterial?: ShaderMaterial[];
    public lowresMaterial?: ShaderMaterial;
    public hiresTileManager?: TileManager;
    public lowresTileManager?: TileManager[];
    public loadedTextures: Texture[];

    public constructor(
        id: string,
        dataUrl: string,
        loadBlocker: () => Promise<void>,
        events?: EventTarget
    ) {
        Object.defineProperty(this, "isMap", { value: true });

        this.loadBlocker = loadBlocker;
        this.events = events;

        this.data = reactive({
            id: id,
            sorting: 1000000,
            dataUrl: dataUrl,
            settingsUrl: dataUrl + "settings.json",
            texturesUrl: dataUrl + "textures.json",
            name: id,
            startPos: { x: 0, z: 0 },
            skyColor: new Color(),
            ambientLight: 0,
            hires: {
                tileSize: { x: 32, z: 32 },
                scale: { x: 1, z: 1 },
                translate: { x: 2, z: 2 },
            },
            lowres: {
                tileSize: { x: 32, z: 32 },
                lodFactor: 5,
                lodCount: 3,
            },
        });

        this.raycaster = new Raycaster();
        this.loadedTextures = [];
    }

    public load(
        hiresVertexShader: string,
        hiresFragmentShader: string,
        lowresVertexShader: string,
        lowresFragmentShader: string,
        uniforms: Record<string, IUniform<any>>,
        tileCacheHash = 0
    ) {
        this.unload();

        let settingsPromise = this.loadSettings();
        let textureFilePromise = this.loadTexturesFile();

        this.lowresMaterial = this.createLowresMaterial(
            lowresVertexShader,
            lowresFragmentShader,
            uniforms
        );

        return Promise.all([settingsPromise, textureFilePromise]).then((values) => {
            let textures = values[1];
            if (textures === null) throw new Error("Failed to parse textures.json!");

            this.hiresMaterial = this.createHiresMaterial(
                hiresVertexShader,
                hiresFragmentShader,
                uniforms,
                textures as TextureData[]
            );

            this.hiresTileManager = new TileManager(
                new TileLoader(
                    `${this.data.dataUrl}tiles/0/`,
                    this.hiresMaterial,
                    this.data.hires,
                    this.loadBlocker,
                    tileCacheHash
                ),

                this.onTileLoad("hires"),
                this.onTileUnload("hires"),
                this.events
            );

            this.hiresTileManager.scene.matrixWorldAutoUpdate = false;

            this.lowresTileManager = [];

            for (let i = 0; i < this.data.lowres.lodCount; i++) {
                this.lowresTileManager[i] = new TileManager(
                    new LowresTileLoader(
                        `${this.data.dataUrl}tiles/`,
                        this.data.lowres,
                        i + 1,
                        lowresVertexShader,
                        lowresFragmentShader,
                        uniforms,
                        async () => {},
                        tileCacheHash
                    ),
                    this.onTileLoad("lowres"),
                    this.onTileUnload("lowres"),
                    this.events
                );

                this.lowresTileManager[i].scene.matrixWorldAutoUpdate = false;
            }

            alert(this.events!, `Map '${this.data.id}' is loaded.`, "fine");
        });
    }

    /**
     * Loads the settings of this map
     */
    public loadSettings() {
        return this.loadSettingsFile().then((worldSettings: any) => {
            this.data.name = worldSettings.name ? worldSettings.name : this.data.name;

            this.data.sorting = Number.isInteger(worldSettings.sorting)
                ? worldSettings.sorting
                : this.data.sorting;

            this.data.startPos = {
                ...this.data.startPos,
                ...vecArrToObj(worldSettings.startPos, true),
            };

            if (worldSettings.skyColor && worldSettings.skyColor.length >= 3) {
                this.data.skyColor.setRGB(
                    worldSettings.skyColor[0],
                    worldSettings.skyColor[1],
                    worldSettings.skyColor[2]
                );
            }

            this.data.ambientLight = worldSettings.ambientLight
                ? worldSettings.ambientLight
                : this.data.ambientLight;

            if (worldSettings.hires === undefined) worldSettings.hires = {};
            if (worldSettings.lowres === undefined) worldSettings.lowres = {};

            this.data.hires = {
                tileSize: {
                    ...this.data.hires.tileSize,
                    ...vecArrToObj(worldSettings.hires.tileSize, true),
                },
                scale: {
                    ...this.data.hires.scale,
                    ...vecArrToObj(worldSettings.hires.scale, true),
                },
                translate: {
                    ...this.data.hires.translate,
                    ...vecArrToObj(worldSettings.hires.translate, true),
                },
            };
            this.data.lowres = {
                tileSize: {
                    ...this.data.lowres.tileSize,
                    ...vecArrToObj(worldSettings.lowres.tileSize, true),
                },
                lodFactor:
                    worldSettings.lowres.lodFactor !== undefined
                        ? worldSettings.lowres.lodFactor
                        : this.data.lowres.lodFactor,
                lodCount:
                    worldSettings.lowres.lodCount !== undefined
                        ? worldSettings.lowres.lodCount
                        : this.data.lowres.lodCount,
            };

            alert(this.events!, `Settings for map '${this.data.id}' loaded.`, "fine");
        });
    }

    public onTileLoad = (layer: any) => (tile: Tile) => {
        dispatchEvent(this.events!, "bluemapMapTileLoaded", {
            tile: tile,
            layer: layer,
        });
    };

    public onTileUnload = (layer: any) => (tile: Tile) => {
        dispatchEvent(this.events!, "bluemapMapTileUnloaded", {
            tile: tile,
            layer: layer,
        });
    };

    /**
     * @param x {number}
     * @param z {number}
     * @param hiresViewDistance {number}
     * @param lowresViewDistance {number}
     */
    public loadMapArea(
        x: number,
        z: number,
        hiresViewDistance: number,
        lowresViewDistance: number
    ) {
        if (!this.isLoaded) return;

        for (let i = this.lowresTileManager!.length - 1; i >= 0; i--) {
            const lod = i + 1;
            const scale = Math.pow(this.data.lowres.lodFactor, lod - 1);
            const lowresX = Math.floor(x / (this.data.lowres.tileSize.x * scale));
            const lowresZ = Math.floor(z / (this.data.lowres.tileSize.z * scale));
            const lowresViewX = Math.floor(lowresViewDistance / this.data.lowres.tileSize.x);
            const lowresViewZ = Math.floor(lowresViewDistance / this.data.lowres.tileSize.z);

            this.lowresTileManager![i].loadAroundTile(lowresX, lowresZ, lowresViewX, lowresViewZ);
        }

        const hiresX = Math.floor((x - this.data.hires.translate.x) / this.data.hires.tileSize.x);
        const hiresZ = Math.floor((z - this.data.hires.translate.z) / this.data.hires.tileSize.z);
        const hiresViewX = Math.floor(hiresViewDistance / this.data.hires.tileSize.x);
        const hiresViewZ = Math.floor(hiresViewDistance / this.data.hires.tileSize.z);

        this.hiresTileManager?.loadAroundTile(hiresX, hiresZ, hiresViewX, hiresViewZ);
    }

    /**
     * Loads the settings.json file for this map
     */
    public loadSettingsFile() {
        return new Promise<Object>((resolve, reject) => {
            alert(this.events!, `Loading settings for map '${this.data.id}'...`, "fine");

            let loader = new FileLoader();

            loader.setResponseType("json");

            loader.load(
                this.data.settingsUrl + "?" + generateCacheHash(),
                resolve,
                () => {},
                () => reject(`Failed to load the settings.json for map: ${this.data.id}`)
            );
        });
    }

    /**
     * Loads the textures.json file for this map
     */
    public loadTexturesFile() {
        return new Promise<Object>((resolve, reject) => {
            alert(this.events!, `Loading textures for map '${this.data.id}'...`, "fine");

            let loader = new FileLoader();
            loader.setResponseType("json");
            loader.load(
                this.data.texturesUrl + "?" + generateCacheHash(),
                resolve,
                () => {},
                () => reject(`Failed to load the textures.json for map: ${this.data.id}`)
            );
        });
    }

    /**
     * Creates a hires Material with the given textures
     * @param textures the textures-data
     * @returns the hires Material (array because its a multi-material)
     */
    public createHiresMaterial(
        vertexShader: string,
        fragmentShader: string,
        uniforms: object,
        textures: TextureData[]
    ) {
        let materials: ShaderMaterial[] = [];
        if (!Array.isArray(textures))
            throw new Error("Invalid texture.json: 'textures' is not an array!");
        for (let i = 0; i < textures.length; i++) {
            let textureSettings = textures[i];

            let color = textureSettings.color;
            if (!Array.isArray(color) || color.length < 4) {
                color = [0, 0, 0, 0];
            }

            let opaque = color[3] === 1;
            let transparent = !!textureSettings.halfTransparent;

            let texture = new Texture();
            texture.image = stringToImage(textureSettings.texture);

            texture.anisotropy = 1;
            texture.generateMipmaps = opaque || transparent;
            texture.magFilter = NearestFilter;
            texture.minFilter = texture.generateMipmaps ? NearestMipMapLinearFilter : NearestFilter;
            texture.wrapS = ClampToEdgeWrapping;
            texture.wrapT = ClampToEdgeWrapping;
            texture.flipY = false;
            (texture as any).flatShading = true;
            texture.image.addEventListener("load", () => (texture.needsUpdate = true));

            this.loadedTextures.push(texture);

            let material = new ShaderMaterial({
                uniforms: {
                    ...uniforms,
                    textureImage: {
                        type: "t",
                        value: texture,
                    } as any,
                    transparent: { value: transparent },
                },

                vertexShader,
                fragmentShader,
                transparent: transparent,
                depthWrite: true,
                depthTest: true,
                vertexColors: true,
                side: FrontSide,
                wireframe: false,
            });

            material.needsUpdate = true;
            materials[i] = material;
        }

        return materials;
    }

    /**
     * Creates a lowres Material
     * @returns the hires Material
     */
    public createLowresMaterial(
        vertexShader: string,
        fragmentShader: string,
        uniforms: Record<string, IUniform<any>>
    ) {
        return new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: false,
            depthWrite: true,
            depthTest: true,
            vertexColors: true,
            side: FrontSide,
            wireframe: false,
        });
    }

    public unload() {
        if (this.hiresTileManager) this.hiresTileManager.unload();

        this.hiresTileManager = undefined;

        if (this.lowresTileManager) {
            for (let i = 0; i < this.lowresTileManager.length; i++) {
                this.lowresTileManager[i].unload();
            }

            this.lowresTileManager = undefined;
        }

        if (this.hiresMaterial) this.hiresMaterial.forEach((material) => material.dispose());

        this.hiresMaterial = undefined;

        if (this.lowresMaterial) this.lowresMaterial.dispose();

        this.lowresMaterial = undefined;

        this.loadedTextures.forEach((texture) => texture.dispose());
        this.loadedTextures = [];
    }

    /**
     * Ray-traces and returns the terrain-height at a specific location, returns <code>false</code> if there is no map-tile loaded at that location
     */
    public terrainHeightAt(x: number, z: number) {
        if (!this.isLoaded) return false;

        this.raycaster.set(
            new Vector3(x, 300, z), // ray-start
            new Vector3(0, -1, 0) // ray-direction
        );
        this.raycaster.near = 1;
        this.raycaster.far = 300;
        this.raycaster.layers.enableAll();

        let hiresTileHash = hashTile(
            Math.floor((x - this.data.hires.translate.x) / this.data.hires.tileSize.x),
            Math.floor((z - this.data.hires.translate.z) / this.data.hires.tileSize.z)
        );

        let tile = this.hiresTileManager?.tiles.get(hiresTileHash);

        if (tile?.model) {
            try {
                let intersects = this.raycaster.intersectObjects([tile.model]);
                if (intersects.length > 0) {
                    return intersects[0].point.y;
                }
            } catch (ignore) {
                //empty
            }
        }

        for (let i = 0; i < this.lowresTileManager!.length; i++) {
            const lod = i + 1;
            const scale = Math.pow(this.data.lowres.lodFactor, lod - 1);
            const scaledTileSize = {
                x: this.data.lowres.tileSize.x * scale,
                z: this.data.lowres.tileSize.z * scale,
            };
            const tileX = Math.floor(x / scaledTileSize.x);
            const tileZ = Math.floor(z / scaledTileSize.z);

            let lowresTileHash = hashTile(tileX, tileZ);

            tile = this.lowresTileManager![i].tiles.get(lowresTileHash);

            if (!tile || !tile.model) continue;

            const texture = (tile.model.material as any).uniforms?.textureImage?.value?.image;

            if (texture == null) continue;

            const color = getPixel(
                texture,
                x - tileX * scaledTileSize.x,
                z - tileZ * scaledTileSize.z + this.data.lowres.tileSize.z + 1
            );

            let heightUnsigned = color[1] * 256.0 + color[2];
            if (heightUnsigned >= 32768.0) {
                return -(65535.0 - heightUnsigned);
            } else {
                return heightUnsigned;
            }
        }

        return false;
    }

    public dispose() {
        this.unload();
    }

    public get isLoaded() {
        return !!(this.hiresMaterial && this.lowresMaterial);
    }
}
