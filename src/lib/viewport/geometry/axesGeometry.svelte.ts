import type {Axis, Line2D, Range, Vector2} from "#lib/viewport/types.ts";
import type { Viewport } from "#lib/viewport/viewport.svelte.ts";

export class AxesGeometry {

    private readonly _viewport: Viewport;

    private _axisMarkingSize: number = $state(10);

    get axisMarkingSize(): number {
        return this._axisMarkingSize;
    }
    set axisMarkingSize(size: number) {
        if (!Number.isFinite(size) || size < 0) {
            throw new RangeError("Axis marking size must be finite and nonnegative.");
        }

        this._axisMarkingSize = size;
    }

    constructor(viewport: Viewport) {
        this._viewport = viewport;
    }

    readonly xAxisMarkings: Line2D[] = $derived(this.createAxisMarkings("x"));
    readonly yAxisMarkings: Line2D[] = $derived(this.createAxisMarkings("y"));
    
    readonly horizontalAxis: Line2D = $derived.by(() => ({
        start: { x: 0, y: this._viewport.visibleOrigin.y },
        end:   { x: this._viewport.width, y: this._viewport.visibleOrigin.y }
    }));

    readonly verticalAxis: Line2D = $derived.by(() => ({
        start: { x: this._viewport.visibleOrigin.x, y: 0 },
        end:   { x: this._viewport.visibleOrigin.x, y: this._viewport.height }
    }));

    private createAxisMarkings(axis: Axis): Line2D[] {
        const minPixelSpacing = 5;
        const maxAxisMarkings = 500;

        const range: Range = axis === "x"
            ? this._viewport.xRange
            : this._viewport.yRange;

        const count = Math.floor(range.max) - Math.ceil(range.min) + 1;

        if (this._viewport.scale < minPixelSpacing) {
            return [];
        }

        if (!Number.isFinite(count) || count > maxAxisMarkings) {
            return [];
        }

        if (axis === "x" && (this._viewport.yRange.min > 0 || this._viewport.yRange.max < 0)) {
            return [];
        }

        if (axis === "y" && (this._viewport.xRange.min > 0 || this._viewport.xRange.max < 0)) {
            return [];
        }

        const markings: Line2D[] = [];

        const halfSize = this._axisMarkingSize / 2;

        for (let i = Math.ceil(range.min); i <= range.max; i++) {
            if (i === 0)
                continue;

            const point: Vector2 = axis === "x"
                ? { x: i, y: 0 }
                : { x: 0, y: i };

            const position = this._viewport.worldToViewport(point);

            const line: Line2D = axis === "x"
                ? {
                    start: { x: position.x, y: position.y - halfSize },
                    end:   { x: position.x, y: position.y + halfSize }
                }
                : {
                    start: { x: position.x - halfSize, y: position.y },
                    end:   { x: position.x + halfSize, y: position.y }
                };

            markings.push(line);
        }

        return markings;
    }
}