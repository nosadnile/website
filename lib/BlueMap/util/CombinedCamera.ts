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

import { MathUtils, Matrix4, PerspectiveCamera } from "three";
import { reactive } from "vue";

export interface CombinedCameraData {
    fov: number;
    aspect: number;
    near: number;
    far: number;
    zoom: number;
    ortho: number;
    distance: number;
}

export class CombinedCamera extends PerspectiveCamera {
    public needsUpdate: boolean;
    public data: CombinedCameraData;

    private ortographicProjection?: Matrix4;
    private perspectiveProjection?: Matrix4;

    public constructor(fov: number, aspect: number, near: number, far: number, ortho: number) {
        super(fov, aspect, near, far);

        this.needsUpdate = true;

        this.data = reactive({
            fov: this.fov,
            aspect: this.aspect,
            near: this.near,
            far: this.far,
            zoom: this.zoom,
            ortho: ortho,
            distance: 1,
        });

        // redirect parent properties
        Object.defineProperty(this, "fov", {
            get() {
                return this.data.fov;
            },
            set(value) {
                if (value !== this.data.fov) {
                    this.data.fov = value;
                    this.needsUpdate = true;
                }
            },
        });
        Object.defineProperty(this, "aspect", {
            get() {
                return this.data.aspect;
            },
            set(value) {
                if (value !== this.data.aspect) {
                    this.data.aspect = value;
                    this.needsUpdate = true;
                }
            },
        });
        Object.defineProperty(this, "near", {
            get() {
                return this.data.near;
            },
            set(value) {
                if (value !== this.data.near) {
                    this.data.near = value;
                    this.needsUpdate = true;
                }
            },
        });
        Object.defineProperty(this, "far", {
            get() {
                return this.data.far;
            },
            set(value) {
                if (value !== this.data.far) {
                    this.data.far = value;
                    this.needsUpdate = true;
                }
            },
        });
        Object.defineProperty(this, "zoom", {
            get() {
                return this.data.zoom;
            },
            set(value) {
                if (value !== this.data.zoom) {
                    this.data.zoom = value;
                    this.needsUpdate = true;
                }
            },
        });

        this.updateProjectionMatrix();
    }

    public updateProjectionMatrix() {
        if (!this.needsUpdate) return;

        if (!this.ortographicProjection) this.ortographicProjection = new Matrix4();

        if (!this.perspectiveProjection) this.perspectiveProjection = new Matrix4();

        //if (!this.data)
        //    this.data = {};

        //copied from PerspectiveCamera
        const near = this.near;
        let top = (near * Math.tan(MathUtils.DEG2RAD * 0.5 * this.fov)) / this.zoom;
        let height = 2 * top;
        let width = this.aspect * height;
        let left = -0.5 * width;
        const view = this.view!;

        if (this.view !== null && this.view.enabled) {
            const fullWidth = view.fullWidth,
                fullHeight = view.fullHeight;

            left += (view.offsetX * width) / fullWidth;
            top -= (view.offsetY * height) / fullHeight;
            width *= view.width / fullWidth;
            height *= view.height / fullHeight;
        }

        const skew = this.filmOffset;
        if (skew !== 0) left += (near * skew) / this.getFilmWidth();

        // this part different to PerspectiveCamera
        let normalizedOrtho = -Math.pow(this.ortho - 1, 6) + 1;
        let orthoTop =
            (Math.max(this.distance, 0.0001) * Math.tan(MathUtils.DEG2RAD * 0.5 * this.fov)) /
            this.zoom;
        let orthoHeight = 2 * orthoTop;
        let orthoWidth = this.aspect * orthoHeight;
        let orthoLeft = -0.5 * orthoWidth;

        this.perspectiveProjection.makePerspective(
            left,
            left + width,
            top,
            top - height,
            near,
            this.far
        );
        this.ortographicProjection.makeOrthographic(
            orthoLeft,
            orthoLeft + orthoWidth,
            orthoTop,
            orthoTop - orthoHeight,
            near,
            this.far
        );

        for (let i = 0; i < 16; i++) {
            this.projectionMatrix.elements[i] =
                this.perspectiveProjection.elements[i] * (1 - normalizedOrtho) +
                this.ortographicProjection.elements[i] * normalizedOrtho;
        }
        // to here

        this.projectionMatrixInverse.copy(this.projectionMatrix).invert();

        this.needsUpdate = false;
    }

    public get _isPerspectiveCamera() {
        return this.ortho < 1;
    }

    public set _isPerspectiveCamera(value) {}

    public get isOrthographicCamera() {
        return !this._isPerspectiveCamera;
    }

    public set isOrthographicCamera(value) {}

    public get cameraType() {
        return this._isPerspectiveCamera ? "PerspectiveCamera" : "OrthographicCamera";
    }

    public set cameraType(type) {
        //ignore
    }

    public get ortho() {
        return this.data.ortho;
    }

    public set ortho(value) {
        if (value !== this.data.ortho) {
            this.data.ortho = value;
            this.needsUpdate = true;
        }
    }

    public get distance() {
        return this.data.distance;
    }

    public set distance(value) {
        if (value !== this.data.distance) {
            this.data.distance = value;
            this.needsUpdate = true;
        }
    }
}
