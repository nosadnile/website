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

import { MathUtils, Vector2 } from "three";
import { ControlsManager } from "../../ControlsManager";
import { Map } from "~/lib/BlueMap/BlueMap";

export class TouchPanControls {
    static tempVec2_1 = new Vector2();

    public target: Element;
    public hammer: any;
    public manager: null | ControlsManager;
    public moving: boolean;
    public lastPosition: Vector2;
    public deltaPosition: Vector2;
    public speed: number;
    public stiffness: number;
    public pixelToSpeedMultiplierX: number;
    public pixelToSpeedMultiplierY: number;

    public constructor(target: Element, hammer: any, speed: number, stiffness: number) {
        this.target = target;
        this.hammer = hammer;
        this.manager = null;

        this.moving = false;
        this.lastPosition = new Vector2();
        this.deltaPosition = new Vector2();

        this.speed = speed;
        this.stiffness = stiffness;

        this.pixelToSpeedMultiplierX = 0;
        this.pixelToSpeedMultiplierY = 0;
        this.updatePixelToSpeedMultiplier();
    }

    public start(manager: ControlsManager) {
        this.manager = manager;

        this.hammer.on("movestart", this.onTouchDown);
        this.hammer.on("movemove", this.onTouchMove);
        this.hammer.on("moveend", this.onTouchUp);
        this.hammer.on("movecancel", this.onTouchUp);

        window.addEventListener("resize", this.updatePixelToSpeedMultiplier);
    }

    public stop() {
        this.hammer.off("movestart", this.onTouchDown);
        this.hammer.off("movemove", this.onTouchMove);
        this.hammer.off("moveend", this.onTouchUp);
        this.hammer.off("movecancel", this.onTouchUp);

        window.removeEventListener("resize", this.updatePixelToSpeedMultiplier);
    }

    public update(delta: number, map: Map) {
        if (this.deltaPosition.x === 0 && this.deltaPosition.y === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);
        smoothing = MathUtils.clamp(smoothing, 0, 1);

        this.manager!.rotation +=
            this.deltaPosition.x * this.speed * this.pixelToSpeedMultiplierX * this.stiffness;
        this.manager!.angle -=
            this.deltaPosition.y * this.speed * this.pixelToSpeedMultiplierY * this.stiffness;

        this.deltaPosition.multiplyScalar(1 - smoothing);
        if (this.deltaPosition.lengthSq() < 0.0001) {
            this.deltaPosition.set(0, 0);
        }
    }

    public reset() {
        this.deltaPosition.set(0, 0);
    }

    public onTouchDown = (evt: any) => {
        if (evt.pointerType === "mouse") return;

        this.moving = true;
        this.deltaPosition.set(0, 0);
        this.lastPosition.set(evt.center.x, evt.center.y);
    };

    public onTouchMove = (evt: any) => {
        if (evt.pointerType === "mouse") return;

        let position = TouchPanControls.tempVec2_1.set(evt.center.x, evt.center.y);

        if (this.moving) {
            this.deltaPosition.sub(position).add(this.lastPosition);
        }

        this.lastPosition.copy(position);
    };

    public onTouchUp = (evt: any) => {
        if (evt.pointerType === "mouse") return;

        this.moving = false;
    };

    public updatePixelToSpeedMultiplier = () => {
        this.pixelToSpeedMultiplierX =
            (1 / this.target.clientWidth) * (this.target.clientWidth / this.target.clientHeight);
        this.pixelToSpeedMultiplierY = 1 / this.target.clientHeight;
    };
}
