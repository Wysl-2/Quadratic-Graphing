import type { Vector2, Range } from '#lib/viewport/types.ts';
import { decompose } from "#lib/viewport/math.ts";

export interface GridConfig {
    gridSpacing?: number;
    gridOffset?: number;
}

export class Grid {
    
    private _gridSpacing: number = $state(2);
    private _gridOffset: number = $state(0);
    
    get gridSpacing(): number {
        return this._gridSpacing;
    }
    set gridSpacing(spacing: number) {
        if (!Number.isFinite(spacing) || spacing <= 0) {
            throw new RangeError("Grid spacing must be finite and greater than zero.");
        }

        this._gridSpacing = spacing;
    }

    get gridOffset(): number {
        return this._gridOffset;
    }
    set gridOffset(offset: number) {
        if (!Number.isFinite(offset)) {
            throw new RangeError("Grid offset must be finite.");
        }

        this._gridOffset = offset;
    }
    
    constructor(config: GridConfig = {}) {
        this.gridSpacing = config.gridSpacing ?? this.gridSpacing;
        this.gridOffset = config.gridOffset ?? this.gridOffset;
    }
    
    calculateGridIndexRange(range: Range): Range {
        return {
            min: Math.ceil((range.min - this._gridOffset) / this._gridSpacing),
            max: Math.floor((range.max - this._gridOffset) / this._gridSpacing)
        };
    }

    worldToGrid(position: Vector2): Vector2 {
        return {
            x: this.coordinateToIndex(
                position.x,
                this._gridSpacing,
                this._gridOffset
            ),
            y: this.coordinateToIndex(
                position.y,
                this._gridSpacing,
                this._gridOffset
            )
        };
    }

    gridIndexToCellCenter(index: Vector2): Vector2 {
        return this.gridIndexToWorld(index, {
            x: 0.5,
            y: 0.5
        });
    }

    gridIndexToWorld(
        index: Vector2,
        t: Vector2
    ): Vector2 {
        return {
            x: this.dequantise(
                index.x,
                t.x,
                this._gridSpacing,
                this._gridOffset
            ),
            y: this.dequantise(
                index.y,
                t.y,
                this._gridSpacing,
                this._gridOffset
            )
        };
    }

    worldToGridLocal(position: Vector2): {
        index: Vector2;
        local: Vector2;
    } {
        const x = decompose(
            (position.x - this._gridOffset) / this._gridSpacing
        );

        const y = decompose(
            (position.y - this._gridOffset) / this._gridSpacing
        );

        return {
            index: {
                x: x.integer,
                y: y.integer
            },
            local: {
                x: x.fraction,
                y: y.fraction
            }
        };
    }

    private coordinateToIndex(
        position: number,
        cellSize: number,
        offset: number
    ): number {
        return Math.floor((position - offset) / cellSize);
    }

    private dequantise(
        index: number,
        t: number,
        cellSize: number,
        offset: number
    ): number {
        return offset + (index + t) * cellSize;
    }

}