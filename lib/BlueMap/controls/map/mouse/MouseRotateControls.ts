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

import { MathUtils } from "three";
import { ControlsManager } from "../../ControlsManager";
import { Map } from "~/lib/BlueMap/BlueMap";

export class MouseRotateControls {
    public target: EventTarget;
    public manager: any;

    public moving: boolean;
    public lastX: number;
    public deltaRotation: number;

    public speed: number;
    public stiffness: number;

    public pixelToSpeedMultiplierX: number;

    public constructor(target: EventTarget, speed: number, stiffness: number) {
        this.target = target;
        this.manager = null;

        this.moving = false;
        this.lastX = 0;
        this.deltaRotation = 0;

        this.speed = speed;
        this.stiffness = stiffness;

        this.pixelToSpeedMultiplierX = 0;

        this.updatePixelToSpeedMultiplier();
    }

    public start(manager: ControlsManager) {
        this.manager = manager;

        this.target.addEventListener("mousedown", this.onMouseDown as any);

        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);

        window.addEventListener("resize", this.updatePixelToSpeedMultiplier);
    }

    public stop() {
        this.target.removeEventListener("mousedown", this.onMouseDown as any);

        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);

        window.removeEventListener("resize", this.updatePixelToSpeedMultiplier);
    }

    public update(delta: number, map: Map) {
        if (this.deltaRotation === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);

        smoothing = MathUtils.clamp(smoothing, 0, 1);

        this.manager.rotation +=
            this.deltaRotation * smoothing * this.speed * this.pixelToSpeedMultiplierX;

        this.deltaRotation *= 1 - smoothing;

        if (Math.abs(this.deltaRotation) < 0.0001) {
            this.deltaRotation = 0;
        }
    }

    public reset() {
        this.deltaRotation = 0;
    }

    private onMouseDown = (evt: MouseEvent) => {
        if (
            (evt.buttons !== undefined ? evt.buttons === 2 : evt.button === 2) ||
            ((evt.altKey || evt.ctrlKey) &&
                (evt.buttons !== undefined ? evt.buttons === 1 : evt.button === 0))
        ) {
            this.moving = true;
            this.deltaRotation = 0;
            this.lastX = evt.x;
        }
    };

    private onMouseMove = (evt: MouseEvent) => {
        if (this.moving) {
            this.deltaRotation += evt.x - this.lastX;
        }

        this.lastX = evt.x;
    };

    private onMouseUp = (evt: MouseEvent) => {
        this.moving = false;
    };

    public updatePixelToSpeedMultiplier = () => {
        this.pixelToSpeedMultiplierX = 1 / (this.target as any).clientWidth; //* (this.target.clientWidth / this.target.clientHeight);
    };
}
