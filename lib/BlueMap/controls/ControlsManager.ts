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

import { MathUtils, Vector3 } from "three";
import { dispatchEvent } from "../util/Utils";
import { Map } from "../map/Map";
import { reactive } from "vue";
import { CombinedCamera, MapViewer } from "../BlueMap";

export interface ControlsManagerData {
    mapViewer: MapViewer | null;
    camera: CombinedCamera | null;
    controls: any | null;
    position: Vector3;
    rotation: number;
    angle: number;
    tilt: number;
}

export interface ControlsLike {
    start: (controls: ControlsManager) => void;
    stop: () => void;
    update: (deltaTime: number, map: Map) => void;

    [key: string]: any;
}

export class ControlsManager {
    public data: ControlsManagerData;

    public lastPosition: Vector3;
    public lastRotation: number;
    public lastAngle: number;
    public lastDistance: number;
    public lastOrtho: number;
    public lastTilt: number;
    public lastMapUpdatePosition: Vector3;
    public lastMapUpdateDistance: number;
    public averageDeltaTime: number;
    public _controls: ControlsLike | null;
    public _mapViewer: MapViewer;
    public _camera: CombinedCamera;

    public constructor(mapViewer: MapViewer, camera: CombinedCamera) {
        Object.defineProperty(this, "isControlsManager", { value: true });

        this.data = reactive({
            mapViewer: null,
            camera: null,
            controls: null,
            position: new Vector3(0, 0, 0),
            rotation: 0,
            angle: 0,
            tilt: 0,
        });

        this._mapViewer = mapViewer;
        this._camera = camera;

        this.lastPosition = this.position.clone();
        this.lastRotation = this.rotation;
        this.lastAngle = this.angle;
        this.lastDistance = this.distance;
        this.lastOrtho = this.ortho;
        this.lastTilt = this.tilt;

        this.lastMapUpdatePosition = this.position.clone();
        this.lastMapUpdateDistance = this.distance;

        this.averageDeltaTime = 16;

        this._controls = null;

        // start
        this.distance = 300;
        this.position.set(0, 0, 0);
        this.rotation = 0;
        this.angle = 0;
        this.tilt = 0;
        this.ortho = 0;

        this.updateCamera();
    }

    public update(deltaTime: number, map: Map) {
        if (deltaTime > 50) deltaTime = 50; // assume min 20 UPS
        this.averageDeltaTime = this.averageDeltaTime * 0.9 + deltaTime * 0.1; // average delta-time to avoid choppy controls on lag-spikes

        if (this._controls) this._controls.update(this.averageDeltaTime, map);

        this.updateCamera();
    }

    public updateCamera() {
        let valueChanged = this.isValueChanged();

        if (valueChanged) {
            this.resetValueChanged();

            // wrap rotation
            while (this.rotation >= Math.PI) this.rotation -= Math.PI * 2;
            while (this.rotation <= -Math.PI) this.rotation += Math.PI * 2;

            // prevent problems with the rotation when the angle is 0 (top-down) or distance is 0 (first-person)
            let rotatableAngle = this.angle;
            if (Math.abs(rotatableAngle) <= 0.0001) rotatableAngle = 0.0001;
            else if (Math.abs(rotatableAngle) - Math.PI <= 0.0001)
                rotatableAngle = rotatableAngle - 0.0001;
            let rotatableDistance = this.distance;
            if (Math.abs(rotatableDistance) <= 0.0001) rotatableDistance = 0.0001;

            // fix distance for orthogonal-camera
            if (this.ortho > 0) {
                rotatableDistance = MathUtils.lerp(
                    rotatableDistance,
                    Math.max(rotatableDistance, 300),
                    Math.pow(this.ortho, 8)
                );
            }

            // calculate rotationVector
            let rotationVector = new Vector3(Math.sin(this.rotation), 0, -Math.cos(this.rotation)); // 0 is towards north
            let angleRotationAxis = new Vector3(0, 1, 0).cross(rotationVector);
            rotationVector.applyAxisAngle(angleRotationAxis, Math.PI / 2 - rotatableAngle);
            rotationVector.multiplyScalar(rotatableDistance);

            // position camera
            this.camera.rotation.set(0, 0, 0);
            this.camera.position.copy(this.position).sub(rotationVector);
            this.camera.lookAt(this.position);
            this.camera.rotateZ(this.tilt + rotatableAngle < 0 ? Math.PI : 0);

            // optimize far/near planes
            if (this.ortho <= 0) {
                let near = MathUtils.clamp(rotatableDistance / 1000, 0.01, 1);
                let far = MathUtils.clamp(
                    rotatableDistance * 2,
                    Math.max(near + 1, 2000),
                    rotatableDistance + 5000
                );
                if (far - near > 10000) near = far - 10000;
                this.camera.near = near;
                this.camera.far = far;
            } else if (this.angle === 0) {
                this.camera.near = 1;
                this.camera.far = rotatableDistance + 300;
            } else {
                this.camera.near = 1;
                this.camera.far = 100000;
            }

            // event
            dispatchEvent(this.mapViewer.events, "bluemapCameraMoved", {
                controlsManager: this,
                camera: this.camera,
            });
        }

        // if the position changed, update map to show new position
        if (this.mapViewer.map) {
            let triggerDistance = 1;
            if (valueChanged) {
                if (this.distance > 300) {
                    triggerDistance = this.mapViewer.data.loadedLowresViewDistance * 0.5;
                } else {
                    triggerDistance = this.mapViewer.data.loadedHiresViewDistance * 0.5;
                }
            }

            if (
                Math.abs(this.lastMapUpdatePosition.x - this.position.x) >= triggerDistance ||
                Math.abs(this.lastMapUpdatePosition.z - this.position.z) >= triggerDistance ||
                (this.distance < 1000 && this.lastMapUpdateDistance > 1000)
            ) {
                this.lastMapUpdatePosition = this.position.clone();
                this.lastMapUpdateDistance = this.distance;
                this.mapViewer.loadMapArea(this.position.x, this.position.z);
            }
        }
    }

    /**
     * Triggers an interaction on the screen (map), e.g. a mouse-click
     * @param screenPosition - Clicked position on the screen (usually event.x, event.y)
     * @param data - Custom event data that will be added to the interaction-event
     */
    public handleMapInteraction(screenPosition: THREE.Vector2, data: object = {}) {
        this.mapViewer.handleMapInteraction(screenPosition, data);
    }

    public isValueChanged() {
        return !(
            this.data.position.equals(this.lastPosition) &&
            this.data.rotation === this.lastRotation &&
            this.data.angle === this.lastAngle &&
            this.distance === this.lastDistance &&
            this.ortho === this.lastOrtho &&
            this.data.tilt === this.lastTilt
        );
    }

    public resetValueChanged() {
        this.lastPosition.copy(this.data.position);
        this.lastRotation = this.data.rotation;
        this.lastAngle = this.data.angle;
        this.lastDistance = this.distance;
        this.lastOrtho = this.ortho;
        this.lastTilt = this.data.tilt;
    }

    public get ortho() {
        return this.camera.ortho;
    }

    public set ortho(ortho) {
        this.camera.ortho = ortho;
    }

    public get distance() {
        return this.camera.distance;
    }

    public set distance(distance) {
        this.camera.distance = distance;
    }

    public set controls(controls: ControlsLike) {
        if (this._controls && this._controls.stop) this._controls.stop();

        this._controls = controls;
        if (controls) this.data.controls = (controls as any).data || null;

        if (this._controls && this._controls.start) this._controls.start(this);
    }

    public get controls() {
        return this._controls!;
    }

    public get mapViewer() {
        return this._mapViewer;
    }

    public set mapViewer(value) {
        this._mapViewer = value;
        this.data.mapViewer = value.data as any;
    }

    public get camera() {
        return this._camera;
    }

    public set camera(value) {
        this._camera = value;
        this.data.camera = value.data as any;
    }

    public get position() {
        return this.data.position;
    }

    public set position(value) {
        this.data.position = value;
    }

    public get rotation() {
        return this.data.rotation;
    }

    public set rotation(value) {
        this.data.rotation = value;
    }

    public get angle() {
        return this.data.angle;
    }

    public set angle(value) {
        this.data.angle = value;
    }

    public get tilt() {
        return this.data.tilt;
    }

    public set tilt(value) {
        this.data.tilt = value;
    }
}
