import type { Viewport } from "#lib/viewport/viewport.svelte.ts"
import type { Grid } from "#lib/viewport/grid.svelte.ts"
import type {Line2D, Axis, Range} from "#lib/viewport/types.ts";

export class GridGeometry {

    private readonly _viewport: Viewport;
    private readonly _grid: Grid;

    constructor(viewport: Viewport, grid: Grid) {
        this._viewport = viewport;
        this._grid = grid;
    }

    readonly pixelSpacing: number = $derived.by(
        () => this._grid.gridSpacing * this._viewport.scale
    );

    readonly xGridIndexRange: Range = $derived.by(
        () => this._grid.calculateGridIndexRange(this._viewport.xRange)
    );

    readonly yGridIndexRange: Range = $derived.by(
        () => this._grid.calculateGridIndexRange(this._viewport.yRange)
    );

    readonly xGridLines: Line2D[] = $derived(this.calculateGridLines("x"));
    readonly yGridLines: Line2D[] = $derived(this.calculateGridLines("y"));
    
    private calculateGridLines(axis: Axis) : Line2D[] {
        const minPixelSpacing = 5;
        const maxGridLines = 500;

        const range = axis === "x"
            ? this.xGridIndexRange
            : this.yGridIndexRange;

        if (this.pixelSpacing < minPixelSpacing) {
            return [];
        }

        const count = range.max - range.min + 1;

        if (!Number.isFinite(count) || count > maxGridLines) {
            return [];
        }

        const lines: Line2D[] = []

        for(let index = range.min; index <= range.max; index++){
            const position = this._grid.gridOffset + index * this._grid.gridSpacing;

            const line: Line2D = axis === "x"
                ? {
                    start: this._viewport.worldToViewport({ x: position, y: this._viewport.yRange.max }),
                    end:   this._viewport.worldToViewport({ x: position, y: this._viewport.yRange.min }),
                }
                : {
                    start: this._viewport.worldToViewport({ x: this._viewport.xRange.max, y: position }),
                    end:   this._viewport.worldToViewport({ x: this._viewport.xRange.min, y: position })
                }
            lines.push(line)
        }
        return lines;
    }
}