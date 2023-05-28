import { TileLoader } from "./TileLoader";

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
export class Tile {
    public x: number;
    public z: number;
    public onLoad?: (tile: Tile) => void;
    public onUnload?: (tile: Tile) => void;
    public model?: THREE.Mesh;
    public unloaded: boolean;
    public loading: boolean;

    constructor(
        x: number,
        z: number,
        onLoad?: (tile: Tile) => void,
        onUnload?: (tile: Tile) => void
    ) {
        Object.defineProperty(this, "isTile", { value: true });

        this.onLoad = onLoad;
        this.onUnload = onUnload;

        this.x = x;
        this.z = z;

        this.unloaded = true;
        this.loading = false;
    }

    public load(tileLoader: TileLoader) {
        if (this.loading) return Promise.reject("tile is already loading!");
        this.loading = true;

        this.unload();

        this.unloaded = false;
        return tileLoader
            .load(this.x, this.z, () => this.unloaded)
            .then((model: any) => {
                if (this.unloaded) {
                    Tile.disposeModel(model);
                    return;
                }

                this.model = model;
                this.onLoad?.(this);
            })
            .finally(() => {
                this.loading = false;
            });
    }

    public unload() {
        this.unloaded = true;
        if (this.model) {
            this.onUnload?.(this);

            Tile.disposeModel(this.model);

            this.model = undefined;
        }
    }

    public static disposeModel(model: THREE.Mesh) {
        if (model.userData?.tileType === "hires") {
            model.geometry.dispose();
        } else if (model.userData?.tileType === "lowres") {
            (model.material as any).uniforms.textureImage.value.dispose();
            (model.material as any).dispose();
        }
    }

    public get loaded() {
        return !!this.model;
    }
}
