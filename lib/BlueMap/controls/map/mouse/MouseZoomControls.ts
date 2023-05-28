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

export class MouseZoomControls {
    public target: EventTarget;
    public manager: any;

    public deltaZoom: number;

    public speed: number;
    public stiffness: number;

    public constructor(target: EventTarget, speed: number, stiffness: number) {
        this.target = target;
        this.manager = null;

        this.stiffness = stiffness;
        this.speed = speed;

        this.deltaZoom = 0;
    }

    public start(manager: ControlsManager) {
        this.manager = manager;

        this.target.addEventListener("wheel", this.onMouseWheel as any, { passive: false });
    }

    public stop() {
        this.target.removeEventListener("wheel", this.onMouseWheel as any);
    }

    public update(delta: number, map: Map) {
        if (this.deltaZoom === 0) return;

        let smoothing = this.stiffness / (16.666 / delta);
        smoothing = MathUtils.clamp(smoothing, 0, 1);

        this.manager.distance *= Math.pow(1.5, this.deltaZoom * smoothing * this.speed);

        this.deltaZoom *= 1 - smoothing;
        if (Math.abs(this.deltaZoom) < 0.0001) {
            this.deltaZoom = 0;
        }
    }

    public reset() {
        this.deltaZoom = 0;
    }

    private onMouseWheel = (evt: WheelEvent) => {
        evt.preventDefault();

        let delta = evt.deltaY;
        if (evt.deltaMode === WheelEvent.DOM_DELTA_PIXEL) delta *= 0.01;
        if (evt.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 0.33;

        this.deltaZoom += delta;
    };
}
