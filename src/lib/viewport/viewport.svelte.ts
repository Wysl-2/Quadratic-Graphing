import type { Vector2, Range } from '#lib/viewport/types.ts';

export interface ViewportConfig {
    width?: number;
    height?: number;
    viewCenter?: Vector2;
    scale?: number;
}

export class Viewport {
    private _width: number = $state(600);
    private _height: number = $state(600);

    private _viewCenter: Vector2 = $state({ x: 0, y: 0 });
    private _scale: number = $state(40);
    
    enableViewportAxes = $state(false);

    get width(): number {
        return this._width;
    }
    set width(width: number) {
        if (!Number.isFinite(width) || width <= 0) {
            throw new RangeError("Width must be finite and greater than zero.");
        }

        this._width = width;
    }

    get height(): number {
        return this._height;
    }
    set height(height: number) {
        if (!Number.isFinite(height) || height <= 0) {
            throw new RangeError("Height must be finite and greater than zero.");
        }

        this._height = height;
    }

    get scale(): number {
        return this._scale;
    }
    set scale(scale: number) {
        if (!Number.isFinite(scale) || scale <= 0) {
            throw new RangeError("Scale must be finite and greater than zero.");
        }

        this._scale = scale;
    }

    get viewCenter(): Readonly<Vector2> {
        return { ...this._viewCenter };
    }
    set viewCenter(center: Vector2) {
        if (
            !Number.isFinite(center.x) ||
            !Number.isFinite(center.y)
        ) {
            throw new RangeError("View center coordinates must be finite.");
        }

        this._viewCenter = { ...center };
    }

    constructor(config: ViewportConfig = {}) {
        this.width = config.width ?? this.width;
        this.height = config.height ?? this.height;
        this.scale = config.scale ?? this.scale;
        this.viewCenter = config.viewCenter ?? this.viewCenter;
    }

    readonly center: Vector2 = $derived({
        x: this._width / 2,
        y: this._height / 2
    });

    readonly visibleOrigin: Vector2 = $derived({
        x: this.center.x - this._viewCenter.x * this._scale,
        y: this.center.y + this._viewCenter.y * this._scale
    });

    readonly xRange: Range = $derived({
        min: this._viewCenter.x - this._width/(2 * this._scale),
        max: this._viewCenter.x + this._width/(2 * this._scale)
    })

    readonly yRange: Range = $derived({
        min: this._viewCenter.y - this._height / (2 * this._scale),
        max: this._viewCenter.y + this._height / (2 * this._scale)
    })
    
    
    worldToViewport(point: Vector2): Vector2 {
        const x = this.center.x + (point.x - this._viewCenter.x) * this._scale;
        const y = this.center.y - (point.y - this._viewCenter.y) * this._scale;
        return { x, y };
    }

    viewportToWorld(svgPoint: Vector2): Vector2 {
        const x = ((svgPoint.x - this.center.x) / this._scale) + this._viewCenter.x;
        const y = ((this.center.y - svgPoint.y) / this._scale) + this._viewCenter.y;
        return { x, y };
    }
    
    
    pan(delta: Vector2): void {
        this.viewCenter = {
            x: this._viewCenter.x + delta.x,
            y: this._viewCenter.y + delta.y
        };
    }

    panByPixels(delta: Vector2): void {
        this.pan({
            x: -delta.x / this._scale,
            y: delta.y / this._scale
        });
    }

    resetView(): void {
        this.viewCenter = { x: 0, y: 0 };
        this.scale = 20;
    }

    zoom(factor: number): void {
        if (!Number.isFinite(factor) || factor <= 0) {
            throw new RangeError("Zoom factor must be finite and positive.");
        }

        this.scale = this._scale * factor;
    }

    zoomAt(factor: number, point: Vector2): void {
        if (!Number.isFinite(factor) || factor <= 0) {
            throw new RangeError("Zoom factor must be finite and positive.");
        }

        const newScale = this._scale * factor;

        if (!Number.isFinite(newScale) || newScale <= 0) {
            throw new RangeError("Resulting scale must be finite and positive.");
        }

        const newCenter: Vector2 = {
            x: point.x + (this._viewCenter.x - point.x) / factor,
            y: point.y + (this._viewCenter.y - point.y) / factor
        };

        if (!Number.isFinite(newCenter.x) || !Number.isFinite(newCenter.y)) {
            throw new RangeError("Resulting view center must be finite.");
        }

        this.scale = newScale;
        this.viewCenter = newCenter;
    }
}