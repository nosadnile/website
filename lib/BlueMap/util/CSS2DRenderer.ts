/**
 * @author mrdoob / http://mrdoob.com/
 *
 * adapted for bluemap's purposes
 */

import { Camera, Matrix4, Object3D, Scene, Vector2, Vector3 } from "three";
import { dispatchEvent } from "./Utils";
import { WithOnClick } from "../BlueMap";

export class CSS2DObject extends Object3D {
    public element: HTMLDivElement;
    public anchor: Vector2;
    public events?: EventTarget;

    public constructor(element: HTMLElement) {
        super();

        this.element = document.createElement("div");

        let parent = element.parentNode;

        parent?.replaceChild(this.element, element);

        this.element.appendChild(element);

        this.element.style.position = "absolute";

        this.anchor = new Vector2();

        this.addEventListener(
            "removed",
            function (this: CSS2DObject) {
                this.traverse(function (object) {
                    if (
                        object instanceof CSS2DObject &&
                        object.element instanceof Element &&
                        object.element.parentNode !== null
                    ) {
                        object.element.parentNode.removeChild(object.element);
                    }
                });
            }.bind(this)
        );

        let lastClick = -1;

        let handleClick = (event: Event) => {
            let doubleTap = false;

            let now = Date.now();
            if (now - lastClick < 500) {
                doubleTap = true;
            }

            lastClick = now;

            let data = { doubleTap: doubleTap };

            if ((this as unknown as Object3D & WithOnClick).onClick({ event, data } as any)) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                // fire event
                dispatchEvent(this.events!, "bluemapMapInteraction", {
                    data: data,
                    object: this,
                });
            }
        };

        this.element.addEventListener("click", handleClick);
        this.element.addEventListener("touch", handleClick);
    }
}

export interface Cache {
    objects: WeakMap<CSS2DObject, { distanceToCameraSquared: number }>;
}

export class CSS2DRenderer {
    public vector: Vector3;
    public viewMatrix: Matrix4;
    public viewProjectionMatrix: Matrix4;
    public cache: Cache;
    public domElement: HTMLDivElement;
    public events?: EventTarget;

    public width: number;
    public height: number;

    public widthHalf: number;
    public heightHalf: number;

    public constructor(events?: EventTarget) {
        this.vector = new Vector3();
        this.viewMatrix = new Matrix4();
        this.viewProjectionMatrix = new Matrix4();

        this.cache = {
            objects: new WeakMap(),
        };

        var domElement = document.createElement("div");
        domElement.style.overflow = "hidden";

        this.domElement = domElement;

        this.events = events;

        this.width = 0;
        this.height = 0;

        this.widthHalf = 0;
        this.heightHalf = 0;
    }

    public getSize() {
        return {
            width: this.width,
            height: this.height,
        };
    }

    public setSize(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.widthHalf = this.width / 2;
        this.heightHalf = this.height / 2;

        this.domElement.style.width = width + "px";
        this.domElement.style.height = height + "px";
    }

    public renderObject(object: object, scene: Scene, camera: Camera, parentVisible?: boolean) {
        if (object instanceof CSS2DObject) {
            object.events = this.events;

            object.onBeforeRender(
                this as any,
                scene,
                camera,
                null as any,
                null as any,
                null as any
            );

            this.vector.setFromMatrixPosition(object.matrixWorld);
            this.vector.applyMatrix4(this.viewProjectionMatrix);

            var element = object.element;
            var style =
                "translate(" +
                (this.vector.x * this.widthHalf + this.widthHalf - object.anchor.x) +
                "px," +
                (-this.vector.y * this.heightHalf + this.heightHalf - object.anchor.y) +
                "px)";

            (element.style as any).WebkitTransform = style;
            (element.style as any).MozTransform = style;
            (element.style as any).oTransform = style;

            element.style.transform = style;

            element.style.display =
                parentVisible &&
                object.visible &&
                this.vector.z >= -1 &&
                this.vector.z <= 1 &&
                element.style.opacity !== "0"
                    ? ""
                    : "none";

            const objectData = {
                distanceToCameraSquared: this.getDistanceToSquared(camera, object),
            };

            this.cache.objects.set(object, objectData);

            if (element.parentNode !== this.domElement) {
                this.domElement.appendChild(element);
            }

            object.onAfterRender(this as any, scene, camera, null as any, null as any, null as any);
        }

        for (let i = 0, l = (object as CSS2DObject).children.length; i < l; i++) {
            this.renderObject(
                (object as CSS2DObject).children[i],
                scene,
                camera,
                parentVisible && (object as CSS2DObject).visible
            );
        }
    }

    public getDistanceToSquared = (function () {
        var a = new Vector3();
        var b = new Vector3();

        return function (object1: Camera, object2: CSS2DObject) {
            a.setFromMatrixPosition(object1.matrixWorld);
            b.setFromMatrixPosition(object2.matrixWorld);

            return a.distanceToSquared(b);
        };
    })();

    public filterAndFlatten(scene: Scene) {
        const result: CSS2DObject[] = [];

        scene.traverse(function (object: CSS2DObject | object) {
            if (object instanceof CSS2DObject) result.push(object);
        });

        return result;
    }

    public zOrder(scene: Scene) {
        const sorted = this.filterAndFlatten(scene).sort(
            function (this: CSS2DRenderer, a: CSS2DObject, b: CSS2DObject) {
                const distanceA = this.cache.objects.get(a)!.distanceToCameraSquared;
                const distanceB = this.cache.objects.get(b)!.distanceToCameraSquared;

                return distanceA - distanceB;
            }.bind(this)
        );

        var zMax = sorted.length;

        for (var i = 0, l = sorted.length; i < l; i++) {
            sorted[i].element.style.zIndex = (zMax - i).toString();
        }
    }

    public render(scene: Scene, camera: Camera) {
        if (scene.matrixWorldAutoUpdate === true) scene.updateMatrixWorld();
        if (camera.parent === null) camera.updateMatrixWorld();

        this.viewMatrix.copy(camera.matrixWorldInverse);
        this.viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, this.viewMatrix);

        this.renderObject(scene, scene, camera, true);
        this.zOrder(scene);
    }
}
