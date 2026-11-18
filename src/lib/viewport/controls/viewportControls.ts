import type { Vector2 } from "#lib/viewport/types.ts";
import type { Viewport } from "#lib/viewport/viewport.svelte.ts";
import type { Action } from "svelte/action";

import {
    clientToSvg,
    clientToCanvas
} from "#lib/viewport/renderers/coordinates.ts";


export interface ViewportControlsOptions {
    pan?: boolean;
    zoom?: boolean;
    zoomFactor?: number;

    onViewportChange?: () => void;
    onPointerPosition?: (position: Vector2) => void;
}


function createViewportControls<
    T extends SVGSVGElement | HTMLCanvasElement
>(
    viewport: Viewport,
    convertCoordinates: (point: Vector2, element: T) => Vector2,
    options: ViewportControlsOptions = {}
) {
    const zoomFactor = options.zoomFactor ?? 1.1;

    if (!Number.isFinite(zoomFactor) || zoomFactor <= 1) {
        throw new RangeError("Zoom factor must be finite and greater than 1.");
    }

    let activePointerId: number | null = null;
    let lastPointerPosition: Vector2 | null = null;


    function getPosition(
        event: MouseEvent,
        element: T
    ): Vector2 {
        return convertCoordinates(
            { x: event.clientX, y: event.clientY },
            element
        );
    }


    function notifyPointerPosition(point: Vector2): void {
        options.onPointerPosition?.(
            viewport.viewportToWorld(point)
        );
    }


    function onpointerdown(event: PointerEvent): void {
        if (options.pan === false) return;
        if (event.button !== 0) return;
        if (activePointerId !== null) return;

        const element = event.currentTarget as T;

        activePointerId = event.pointerId;
        lastPointerPosition = getPosition(event, element);

        element.setPointerCapture(event.pointerId);
    }


    function onpointermove(event: PointerEvent): void {
        const element = event.currentTarget as T;
        const point = getPosition(event, element);

        if (
            options.pan !== false &&
            activePointerId === event.pointerId &&
            lastPointerPosition !== null
        ) {
            const delta: Vector2 = {
                x: point.x - lastPointerPosition.x,
                y: point.y - lastPointerPosition.y
            };

            viewport.panByPixels(delta);

            lastPointerPosition = point;

            options.onViewportChange?.();
        }

        notifyPointerPosition(point);
    }


    function finishDrag(event: PointerEvent): void {
        if (activePointerId !== event.pointerId) return;

        const element = event.currentTarget as T;

        activePointerId = null;
        lastPointerPosition = null;

        if (element.hasPointerCapture(event.pointerId)) {
            element.releasePointerCapture(event.pointerId);
        }
    }


    function onlostpointercapture(event: PointerEvent): void {
        if (activePointerId !== event.pointerId) return;

        activePointerId = null;
        lastPointerPosition = null;
    }


    function onwheel(event: WheelEvent): void {
        if (options.zoom === false) return;
        if (event.deltaY === 0) return;

        event.preventDefault();

        const element = event.currentTarget as T;
        const point = getPosition(event, element);

        const worldPoint = viewport.viewportToWorld(point);

        const factor = event.deltaY < 0
            ? zoomFactor
            : 1 / zoomFactor;

        viewport.zoomAt(factor, worldPoint);

        options.onViewportChange?.();
        notifyPointerPosition(point);
    }


    return {
        onpointerdown,
        onpointermove,
        onpointerup: finishDrag,
        onpointercancel: finishDrag,
        onlostpointercapture,
        onwheel
    };
}


// SVG controls
export function createSvgViewportControls(
    viewport: Viewport,
    options: ViewportControlsOptions = {}
) {
    return createViewportControls(
        viewport,
        clientToSvg,
        options
    );
}


// Canvas controls
export function createCanvasViewportControls(
    viewport: Viewport,
    options: ViewportControlsOptions = {}
) {
    return createViewportControls(
        viewport,
        clientToCanvas,
        options
    );
}

export function createSvgViewportAction(
    viewport: Viewport,
    options: ViewportControlsOptions = {}
): Action<SVGSVGElement> {

    return (node: SVGSVGElement) => {

        // Create the existing controls
        const controls = createSvgViewportControls(viewport, options);

        // Register event listeners
        node.addEventListener("pointerdown", controls.onpointerdown);
        node.addEventListener("pointermove", controls.onpointermove);
        node.addEventListener("pointerup", controls.onpointerup);
        node.addEventListener("pointercancel", controls.onpointercancel);
        node.addEventListener("lostpointercapture", controls.onlostpointercapture);
        node.addEventListener("wheel", controls.onwheel, { passive: false });

        // Cleanup when the element is removed
        return {
            destroy() {
                node.removeEventListener("pointerdown", controls.onpointerdown);
                node.removeEventListener("pointermove", controls.onpointermove);
                node.removeEventListener("pointerup", controls.onpointerup);
                node.removeEventListener("pointercancel", controls.onpointercancel);
                node.removeEventListener("lostpointercapture", controls.onlostpointercapture);
                node.removeEventListener("wheel", controls.onwheel);
            }
        };
    };
}


export function createCanvasViewportAction(
    viewport: Viewport,
    options: ViewportControlsOptions = {}
): Action<HTMLCanvasElement> {

    return (node: HTMLCanvasElement) => {

        const controls = createCanvasViewportControls(viewport, options);

        node.addEventListener("pointerdown", controls.onpointerdown);
        node.addEventListener("pointermove", controls.onpointermove);
        node.addEventListener("pointerup", controls.onpointerup);
        node.addEventListener("pointercancel", controls.onpointercancel);
        node.addEventListener("lostpointercapture", controls.onlostpointercapture);
        node.addEventListener("wheel", controls.onwheel, { passive: false });

        return {
            destroy() {
                node.removeEventListener("pointerdown", controls.onpointerdown);
                node.removeEventListener("pointermove", controls.onpointermove);
                node.removeEventListener("pointerup", controls.onpointerup);
                node.removeEventListener("pointercancel", controls.onpointercancel);
                node.removeEventListener("lostpointercapture", controls.onlostpointercapture);
                node.removeEventListener("wheel", controls.onwheel);
            }
        };
    };
}