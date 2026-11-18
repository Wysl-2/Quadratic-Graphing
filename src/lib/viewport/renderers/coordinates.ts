import type { Vector2 } from '#lib/viewport/types.ts';

/**
 * Convert browser client coordinates into SVG viewBox coordinates.
 */
export function clientToSvg(
    position: Vector2,
    svg: SVGSVGElement
): Vector2 {
    const matrix = svg.getScreenCTM();

    if (!matrix) {
        throw new Error("Unable to calculate SVG transformation.");
    }

    const point = new DOMPoint(position.x, position.y);
    const result = point.matrixTransform(matrix.inverse());

    return {
        x: result.x,
        y: result.y
    };
}

/**
 * Convert browser client coordinates into HTML Canvas coordinates.
 */
export function clientToCanvas(
    position: Vector2,
    canvas: HTMLCanvasElement
): Vector2 {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (position.x - rect.left) * (canvas.width / rect.width),
        y: (position.y - rect.top) * (canvas.height / rect.height)
    };
}