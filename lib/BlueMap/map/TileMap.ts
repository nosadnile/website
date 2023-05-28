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
import { ClampToEdgeWrapping, LinearFilter, NearestFilter, Texture } from "three";

export class TileMap {
    public static EMPTY = "#000";
    public static LOADED = "#fff";

    public canvas: HTMLCanvasElement;
    public tileMapContext: CanvasRenderingContext2D;
    public texture: Texture;

    public constructor(width: number, height: number) {
        this.canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas") as any;
        this.canvas.width = width;
        this.canvas.height = height;

        this.tileMapContext = this.canvas.getContext("2d", {
            alpha: false,
            willReadFrequently: true,
        })!;

        this.texture = new Texture(this.canvas);
        this.texture.generateMipmaps = false;
        this.texture.magFilter = LinearFilter;
        this.texture.minFilter = LinearFilter;
        this.texture.wrapS = ClampToEdgeWrapping;
        this.texture.wrapT = ClampToEdgeWrapping;
        this.texture.flipY = false;
        this.texture.needsUpdate = true;
    }

    public setAll(state: string) {
        this.tileMapContext.fillStyle = state;
        this.tileMapContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.texture.needsUpdate = true;
    }

    public setTile(x: number, z: number, state: string) {
        this.tileMapContext.fillStyle = state;
        this.tileMapContext.fillRect(x, z, 1, 1);

        this.texture.needsUpdate = true;
    }
}
