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
import { FileLoader } from "three";
import { MarkerSet } from "./MarkerSet";
import { alert, generateCacheHash } from "../util/Utils";
import { MarkerData } from "./Marker";

/**
 * A manager for loading and updating markers from a file
 */
export class MarkerManager {
    public root: MarkerSet;
    public fileUrl: string;
    public events?: EventTarget;
    public disposed: boolean;
    public _updateInterval?: NodeJS.Timeout;

    public constructor(root: MarkerSet, fileUrl: string, events?: EventTarget) {
        Object.defineProperty(this, "isMarkerManager", { value: true });

        this.root = root;
        this.fileUrl = fileUrl;
        this.events = events;
        this.disposed = false;
    }

    /**
     * Sets the automatic-update frequency, setting this to 0 or negative disables automatic updates (default).
     * This is better than using setInterval() on update() because this will wait for the update to finish before requesting the next update.
     */
    public setAutoUpdateInterval(ms: number) {
        if (this._updateInterval) clearTimeout(this._updateInterval);
        if (ms > 0) {
            let autoUpdate = () => {
                if (this.disposed) return;
                this.update()
                    .then((success: any) => {
                        if (success) {
                            this._updateInterval = setTimeout(autoUpdate, ms);
                        } else {
                            this._updateInterval = setTimeout(autoUpdate, Math.max(ms, 1000 * 15));
                        }
                    })
                    .catch((e) => {
                        alert(this.events!, e, "warning");
                        this._updateInterval = setTimeout(autoUpdate, Math.max(ms, 1000 * 15));
                    });
            };

            this._updateInterval = setTimeout(autoUpdate, ms);
        }
    }

    /**
     * Loads the marker-file and updates all managed markers.
     */
    public update() {
        return this.loadMarkerFile().then((markerFileData) => this.updateFromData(markerFileData));
    }

    protected updateFromData(markerData: MarkerData) {}

    /**
     * Stops automatic-updates and disposes all markersets and markers managed by this manager
     */
    public dispose() {
        this.disposed = true;
        this.setAutoUpdateInterval(0);
        this.clear();
    }

    /**
     * Removes all markers managed by this marker-manager
     */
    public clear() {
        this.root.clear();
    }

    /**
     * Loads the marker file
     */
    private loadMarkerFile() {
        return new Promise<MarkerData>((resolve, reject) => {
            let loader = new FileLoader();
            loader.setResponseType("json");
            loader.load(
                this.fileUrl + "?" + generateCacheHash(),
                (markerFileData) => {
                    if (!markerFileData) reject(`Failed to parse '${this.fileUrl}'!`);
                    else resolve(markerFileData as any);
                },
                () => {},
                () => reject(`Failed to load '${this.fileUrl}'!`)
            );
        });
    }
}
