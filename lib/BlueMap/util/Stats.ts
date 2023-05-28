/**
 * Taken from https://github.com/mrdoob/three.js/blob/master/examples/jsm/libs/stats.module.js
 */

export interface Memory {
    memory: {
        usedJSHeapSize: number;
        jsHeapSizeLimit: number;
    };
}

export class Stats {
    public constructor() {
        this.mode = 0;

        this.dom = document.createElement("div");

        this.dom.style.cssText =
            "position:absolute;bottom:5px;right:5px;cursor:pointer;opacity:0.9;z-index:10000";

        this.dom.addEventListener(
            "click",
            function (this: Stats, event: MouseEvent) {
                event.preventDefault();
                this.showPanel(++this.mode % this.dom.children.length);
            }.bind(this),
            false
        );

        this.beginTime = (performance || Date).now();
        this.prevTime = this.beginTime;
        this.frames = 0;
        this.prevFrameTime = this.beginTime;

        this.fpsPanel = this.addPanel(new Panel("FPS", "#0ff", "#002"));
        this.msPanel = this.addPanel(new Panel("MS (render)", "#0f0", "#020"));
        this.lastFrameMsPanel = this.addPanel(new Panel("MS (all)", "#f80", "#210"));

        if (self.performance && (self.performance as Performance & Memory).memory) {
            this.memPanel = this.addPanel(new Panel("MB", "#f08", "#201"));
        }

        this.showPanel(0);
    }

    public beginTime: number;
    public prevTime: number;
    public frames: number;
    public prevFrameTime: number;

    public fpsPanel: Panel;
    public msPanel: Panel;
    public lastFrameMsPanel: Panel;

    public memPanel?: Panel;

    public mode: number;

    public addPanel(panel: Panel) {
        this.dom.appendChild(panel.canvas);
        return panel;
    }

    public showPanel(id: number) {
        for (let i = 0; i < this.dom.children.length; i++) {
            (this.dom.children[i] as HTMLElement).style.display = i === id ? "block" : "none";
        }

        this.mode = id;
    }

    public hide() {
        this.showPanel(-1);
    }

    public REVISION = 16;

    public dom: HTMLDivElement;

    public begin() {
        this.beginTime = (performance || Date).now();
    }

    public end() {
        this.frames++;

        let time = (performance || Date).now();

        this.msPanel.update(time - this.beginTime, 200);
        this.lastFrameMsPanel.update(time - this.prevFrameTime, 200);

        if (time >= this.prevTime + 1000) {
            this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100);

            this.prevTime = time;
            this.frames = 0;

            if (this.memPanel) {
                let memory = (performance as Performance & Memory).memory;

                this.memPanel.update(
                    memory.usedJSHeapSize / 1048576,
                    memory.jsHeapSizeLimit / 1048576
                );
            }
        }

        return time;
    }

    public update() {
        this.beginTime = this.end();
        this.prevFrameTime = this.beginTime;
    }

    // Backwards Compatibility

    public get domElement() {
        return this.dom;
    }

    public get setMode() {
        return this.mode;
    }
}

export class Panel {
    public constructor(name: string, fg: string, bg: string) {
        (this.min = Infinity), (this.max = 0), (this.round = Math.round);
        this.name = name;
        this.fg = fg;
        this.bg = bg;

        this.PR = this.round(window.devicePixelRatio || 1);

        this.WIDTH = 160 * this.PR;
        this.HEIGHT = 96 * this.PR;
        this.TEXT_X = 3 * this.PR;
        this.TEXT_Y = 3 * this.PR;
        this.GRAPH_X = 3 * this.PR;
        this.GRAPH_Y = 15 * this.PR;
        this.GRAPH_WIDTH = 154 * this.PR;
        this.GRAPH_HEIGHT = 77 * this.PR;

        this.canvas = document.createElement("canvas");

        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.canvas.style.cssText = "width:160px;height:96px";

        this.context = this.canvas.getContext("2d")!;

        this.context.font = "bold " + 9 * this.PR + "px Helvetica,Arial,sans-serif";
        this.context.textBaseline = "top";

        this.context.fillStyle = bg;
        this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        this.context.fillStyle = fg;
        this.context.fillText(name, this.TEXT_X, this.TEXT_Y);
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);

        this.context.fillStyle = bg;
        this.context.globalAlpha = 0.9;
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
    }

    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;

    public name: string;
    public fg: string;
    public bg: string;

    public min: number;
    public max: number;

    public WIDTH: number;
    public HEIGHT: number;
    public TEXT_X: number;
    public TEXT_Y: number;
    public GRAPH_X: number;
    public GRAPH_Y: number;
    public GRAPH_WIDTH: number;
    public GRAPH_HEIGHT: number;
    public PR: number;
    public round: (value: number) => number;

    public update(value: number, maxValue: number) {
        this.min = Math.min(this.min, value);
        this.max = Math.max(this.max, value);

        this.context.fillStyle = this.bg;
        this.context.globalAlpha = 1;
        this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y);
        this.context.fillStyle = this.fg;

        this.context.fillText(
            this.round(value) +
                " " +
                name +
                " (" +
                this.round(this.min) +
                "-" +
                this.round(this.max) +
                ")",
            this.TEXT_X,
            this.TEXT_Y
        );

        this.context.drawImage(
            this.canvas,
            this.GRAPH_X + this.PR,
            this.GRAPH_Y,
            this.GRAPH_WIDTH - this.PR,
            this.GRAPH_HEIGHT,
            this.GRAPH_X,
            this.GRAPH_Y,
            this.GRAPH_WIDTH - this.PR,
            this.GRAPH_HEIGHT
        );

        this.context.fillRect(
            this.GRAPH_X + this.GRAPH_WIDTH - this.PR,
            this.GRAPH_Y,
            this.PR,
            this.GRAPH_HEIGHT
        );

        this.context.fillStyle = this.bg;
        this.context.globalAlpha = 0.9;

        this.context.fillRect(
            this.GRAPH_X + this.GRAPH_WIDTH - this.PR,
            this.GRAPH_Y,
            this.PR,
            this.round((1 - value / maxValue) * this.GRAPH_HEIGHT)
        );
    }
}

export default Stats;
