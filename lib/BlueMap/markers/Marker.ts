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
import { Camera, MathUtils, Object3D, Vector3 } from "three";
import { reactive } from "vue";

export interface MarkerData {
    id: string;
    type: "marker" | "popup" | "line" | "html" | "extrude" | "object" | "player" | "poi" | "shape";
    sorting: number;
    listed: boolean;
    position: Vector3;
    visible: boolean;

    [key: string]: any;
}

export class Marker extends Object3D {
    public data: MarkerData;

    public constructor(markerId: string) {
        super();
        Object.defineProperty(this, "isMarker", { value: true });

        this.data = reactive({
            id: markerId,
            type: "marker",
            sorting: 0,
            listed: true,
            position: this.position,
            visible: this.visible,
        });

        // redirect parent properties
        Object.defineProperty(this, "position", {
            get() {
                return this.data.position;
            },

            set(value) {
                this.data.position = value;
            },
        });

        Object.defineProperty(this, "visible", {
            get() {
                return this.data.visible;
            },

            set(value) {
                this.data.visible = value;
            },
        });
    }

    public dispose() {}

    /**
     * Updates this marker from the provided data object, usually parsed form json from a markers.json
     */
    public updateFromData(markerData: Partial<MarkerData>) {}

    // -- helper methods --

    public static _posRelativeToCamera = new Vector3();
    public static _cameraDirection = new Vector3();

    /**
     * @returns - opacity between 0 and 1
     */
    public static calculateDistanceOpacity(
        position: Vector3,
        camera: Camera,
        fadeDistanceMin: number,
        fadeDistanceMax: number
    ) {
        let distance = Marker.calculateDistanceToCameraPlane(position, camera);
        let minDelta = (distance - fadeDistanceMin) / fadeDistanceMin;
        let maxDelta = (distance - fadeDistanceMax) / (fadeDistanceMax * 0.5);

        return Math.min(MathUtils.clamp(minDelta, 0, 1), 1 - MathUtils.clamp(maxDelta + 1, 0, 1));
    }

    public static calculateDistanceToCameraPlane(position: Vector3, camera: Camera) {
        Marker._posRelativeToCamera.subVectors(position, camera.position);
        camera.getWorldDirection(Marker._cameraDirection);

        return Marker._posRelativeToCamera.dot(Marker._cameraDirection);
    }
}
