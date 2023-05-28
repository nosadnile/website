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

export class KeyCombination {
    public static CTRL = 0;
    public static SHIFT = 1;
    public static ALT = 2;

    public code: string;
    public ctrl: boolean;
    public shift: boolean;
    public alt: boolean;

    public constructor(code: string, ...modifiers: number[]) {
        this.code = code;

        this.ctrl =
            modifiers.includes(KeyCombination.CTRL) ||
            this.code === "CtrlLeft" ||
            this.code === "CtrlRight";

        this.shift =
            modifiers.includes(KeyCombination.SHIFT) ||
            this.code === "ShiftLeft" ||
            this.code === "ShiftRight";

        this.alt =
            modifiers.includes(KeyCombination.ALT) ||
            this.code === "AltLeft" ||
            this.code === "AltRight";
    }

    public testDown(evt: KeyboardEvent) {
        return (
            this.code === evt.code &&
            this.ctrl === evt.ctrlKey &&
            this.shift === evt.shiftKey &&
            this.alt === evt.altKey
        );
    }

    public testUp(evt: KeyboardEvent) {
        return this.code === evt.code;
    }

    public static oneDown(evt: KeyboardEvent, ...combinations: KeyCombination[]) {
        for (let combination of combinations) {
            if (combination.testDown(evt)) return true;
        }

        return false;
    }

    public static oneUp(evt: KeyboardEvent, ...combinations: KeyCombination[]) {
        for (let combination of combinations) {
            if (combination.testUp(evt)) return true;
        }

        return false;
    }
}
