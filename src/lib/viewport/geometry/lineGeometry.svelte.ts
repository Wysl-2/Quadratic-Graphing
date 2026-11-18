import type { Line2D, Vector2 } from "#lib/viewport/types.ts";

export function pointAlongLine(
    point: Vector2,
    slope: number,
    t: number
): Vector2 {
    return {
        x: point.x + t,
        y: point.y + slope * t
    };
}