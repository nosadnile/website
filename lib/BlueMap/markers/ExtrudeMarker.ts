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
import {
    Color,
    DoubleSide,
    ExtrudeGeometry,
    Mesh,
    ShaderMaterial,
    Shape,
    UniformsUtils,
    Vector2,
    WebGLRenderer,
} from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { MARKER_FILL_VERTEX_SHADER } from "./MarkerFillVertexShader";
import { MARKER_FILL_FRAGMENT_SHADER } from "./MarkerFillFragmentShader";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { deepEquals } from "../util/Utils";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry";
import { ObjectMarker } from "./ObjectMarker";
import { lineShader } from "../util/LineShader";
import { MarkerData } from "./Marker";
import { WithOnClick } from "../BlueMap";

export interface ColorLike {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface OurMarkerData {
    position: { x: number; y: number; z: number };
    label: string;
    detail: string;
    shape: { x: number; z: number }[];
    shapeMinY: number;
    shapeMaxY: number;
    holes: { x: number; z: number }[][];
    link: string;
    newTab: boolean;
    depthTest: boolean;
    lineWidth: number;
    lineColor: ColorLike;
    fillColor: ColorLike;
    minDistance: number;
    maxDistance: number;
}

export class ExtrudeMarker extends ObjectMarker {
    public fill: ExtrudeMarkerFill;
    public border: ExtrudeMarkerBorder;
    public _markerData: any;

    public constructor(markerId: string) {
        super(markerId);

        Object.defineProperty(this, "isExtrudeMarker", { value: true });

        this.data.type = "extrude";

        let zero = new Vector2();
        let shape = new Shape([zero, zero, zero]);

        this.fill = new ExtrudeMarkerFill(shape);
        this.border = new ExtrudeMarkerBorder(shape);
        this.border.renderOrder = -1; // render border before fill

        this.add(this.border, this.fill);

        this._markerData = {};
    }

    public setShapeY(minY: number, maxY: number) {
        let relativeY = maxY - this.position.y;
        let height = maxY - minY;
        this.fill.position.y = relativeY;
        this.border.position.y = relativeY;
        this.fill.scale.y = height;
        this.border.scale.y = height;
    }

    public setShape(shape: Shape) {
        this.fill.updateGeometry(shape);
        this.border.updateGeometry(shape);
    }

    public updateFromData(markerData: MarkerData & OurMarkerData) {
        super.updateFromData(markerData);

        // update shape only if needed, based on last update-data
        if (
            !this._markerData.shape ||
            !deepEquals(markerData.shape, this._markerData.shape) ||
            !this._markerData.holes ||
            !deepEquals(markerData.holes, this._markerData.holes) ||
            !this._markerData.position ||
            !deepEquals(markerData.position, this._markerData.position)
        ) {
            this.setShape(
                this.createShapeWithHolesFromData(markerData.shape, markerData.holes) as Shape
            );
        }

        // update shapeY
        this.setShapeY((markerData.shapeMinY || 0) - 0.01, (markerData.shapeMaxY || 0) + 0.01); // offset by 0.01 to avoid z-fighting

        // update depthTest
        this.border.depthTest = !!markerData.depthTest;
        this.fill.depthTest = !!markerData.depthTest;

        // update border-width
        this.border.linewidth = markerData.lineWidth !== undefined ? markerData.lineWidth : 2;

        // update border-color
        let bc = markerData.lineColor || {};
        this.border.color.setRGB((bc.r || 0) / 255, (bc.g || 0) / 255, (bc.b || 0) / 255);
        this.border.opacity = bc.a || 0;

        // update fill-color
        let fc = markerData.fillColor || {};
        this.fill.color.setRGB((fc.r || 0) / 255, (fc.g || 0) / 255, (fc.b || 0) / 255);
        this.fill.opacity = fc.a || 0;

        // update min/max distances
        let minDist = markerData.minDistance || 0;
        let maxDist =
            markerData.maxDistance !== undefined ? markerData.maxDistance : Number.MAX_VALUE;
        this.border.fadeDistanceMin = minDist;
        this.border.fadeDistanceMax = maxDist;
        this.fill.fadeDistanceMin = minDist;
        this.fill.fadeDistanceMax = maxDist;

        // save used marker data for next update
        this._markerData = markerData;
    }

    dispose() {
        super.dispose();

        this.fill.dispose();
        this.border.dispose();
    }

    /**
     * Creates a shape from a data object, usually parsed json from a markers.json
     */
    private createShapeFromData(shapeData: { x: number; z: number }[]) {
        let points: Vector2[] = [];

        if (Array.isArray(shapeData)) {
            shapeData.forEach((point) => {
                let x = (point.x || 0) - this.position.x + 0.01; // offset by 0.01 to avoid z-fighting
                let z = (point.z || 0) - this.position.z + 0.01;

                points.push(new Vector2(x, z));
            });

            return new Shape(points);
        }

        return false;
    }

    /**
     * Creates a shape with holes from a data object, usually parsed json from a markers.json
     */
    private createShapeWithHolesFromData(
        shapeData: { x: number; z: number }[],
        holes: { x: number; z: number }[][]
    ) {
        const shape = this.createShapeFromData(shapeData);

        if (shape && Array.isArray(holes)) {
            holes.forEach((hole) => {
                const holeShape = this.createShapeFromData(hole);
                if (holeShape) {
                    shape.holes.push(holeShape);
                }
            });
        }

        return shape;
    }
}

export class ExtrudeMarkerFill extends Mesh {
    public constructor(shape: Shape) {
        let geometry = ExtrudeMarkerFill.createGeometry(shape);

        let material = new ShaderMaterial({
            vertexShader: MARKER_FILL_VERTEX_SHADER,
            fragmentShader: MARKER_FILL_FRAGMENT_SHADER,
            side: DoubleSide,
            depthTest: true,
            transparent: true,
            uniforms: {
                markerColor: { value: new Color() },
                markerOpacity: { value: 0 },
                fadeDistanceMin: { value: 0 },
                fadeDistanceMax: { value: Number.MAX_VALUE },
            },
        });

        super(geometry, material);
    }

    public get color() {
        return (this.material as any).uniforms.markerColor.value;
    }

    public get opacity() {
        return (this.material as any).uniforms.markerOpacity.value;
    }

    public set opacity(opacity) {
        (this.material as any).uniforms.markerOpacity.value = opacity;
        this.visible = opacity > 0;
    }

    public get depthTest() {
        return (this.material as any).depthTest;
    }

    public set depthTest(test) {
        (this.material as any).depthTest = test;
    }

    public get fadeDistanceMin() {
        return (this.material as any).uniforms.fadeDistanceMin.value;
    }

    public set fadeDistanceMin(min) {
        (this.material as any).uniforms.fadeDistanceMin.value = min;
    }

    public get fadeDistanceMax() {
        return (this.material as any).uniforms.fadeDistanceMax.value;
    }

    public set fadeDistanceMax(max) {
        (this.material as any).uniforms.fadeDistanceMax.value = max;
    }

    public onClick(event: any) {
        if (event.intersection) {
            if (event.intersection.distance > this.fadeDistanceMax) return false;
            if (event.intersection.distance < this.fadeDistanceMin) return false;
        }

        // @ts-ignore
        return super.onClick(event);
    }

    public updateGeometry(shape: Shape) {
        this.geometry.dispose();
        this.geometry = ExtrudeMarkerFill.createGeometry(shape);
    }

    public dispose() {
        this.geometry.dispose();
        (this.material as any).dispose();
    }

    public static createGeometry(shape: Shape) {
        let geometry = new ExtrudeGeometry(shape, {
            depth: 1,
            steps: 5,
            bevelEnabled: false,
        });
        geometry.rotateX(Math.PI / 2); //make y to z

        return geometry;
    }
}

export class ExtrudeMarkerBorder extends Line2 {
    /**
     * @param shape {Shape}
     */
    public constructor(shape: Shape) {
        let geometry = new LineSegmentsGeometry();
        geometry.setPositions(ExtrudeMarkerBorder.createLinePoints(shape));

        let material = new LineMaterial({
            color: new Color() as any,
            opacity: 0,
            transparent: true,
            linewidth: 1,
            depthTest: true,
            vertexColors: false,
            dashed: false,
            uniforms: UniformsUtils.clone(lineShader.uniforms),
            vertexShader: lineShader.vertexShader,
            fragmentShader: lineShader.fragmentShader,
        } as any);

        material.uniforms.fadeDistanceMin = { value: 0 };
        material.uniforms.fadeDistanceMax = { value: Number.MAX_VALUE };

        material.resolution.set(window.innerWidth, window.innerHeight);

        super(geometry as any, material);

        this.computeLineDistances();
    }

    public get color() {
        return this.material.color;
    }

    public get opacity() {
        return this.material.opacity;
    }

    public set opacity(opacity) {
        this.material.opacity = opacity;
        this.visible = opacity > 0;
    }

    public get linewidth() {
        return this.material.linewidth;
    }

    public set linewidth(width) {
        this.material.linewidth = width;
    }

    public get depthTest() {
        return this.material.depthTest;
    }

    public set depthTest(test) {
        this.material.depthTest = test;
    }

    public get fadeDistanceMin() {
        return this.material.uniforms.fadeDistanceMin.value;
    }

    public set fadeDistanceMin(min) {
        this.material.uniforms.fadeDistanceMin.value = min;
    }

    public get fadeDistanceMax() {
        return this.material.uniforms.fadeDistanceMax.value;
    }

    public set fadeDistanceMax(max) {
        this.material.uniforms.fadeDistanceMax.value = max;
    }

    public onClick(event: any) {
        if (event.intersection) {
            if (event.intersection.distance > this.fadeDistanceMax) return false;
            if (event.intersection.distance < this.fadeDistanceMin) return false;
        }

        // @ts-ignore
        return super.onClick(event);
    }

    public updateGeometry(shape: Shape) {
        this.geometry = new LineSegmentsGeometry() as any;
        this.geometry.setPositions(ExtrudeMarkerBorder.createLinePoints(shape));
        this.computeLineDistances();
    }

    public onBeforeRender = (renderer: WebGLRenderer) => {
        renderer.getSize(this.material.resolution);
    };

    public dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }

    public static createLinePoints(shape: Shape) {
        let points3d = [];

        points3d.push(...this.convertPoints(shape.getPoints(5)));
        shape.getPointsHoles(5).forEach((hole) => points3d.push(...this.convertPoints(hole)));

        return points3d;
    }

    private static convertPoints(points: { x: number; y: number }[]) {
        let points3d: number[] = [];
        points.push(points[0]);

        let prevPoint: { x: number; y: number } | null = null;
        points.forEach((point) => {
            // vertical line
            points3d.push(point.x, 0, point.y);
            points3d.push(point.x, -1, point.y);

            if (prevPoint) {
                // line to previous point top
                points3d.push(prevPoint.x, 0, prevPoint.y);
                points3d.push(point.x, 0, point.y);

                // line to previous point bottom
                points3d.push(prevPoint.x, -1, prevPoint.y);
                points3d.push(point.x, -1, point.y);
            }

            prevPoint = point;
        });

        return points3d;
    }
}
