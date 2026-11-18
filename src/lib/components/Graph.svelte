<script lang="ts">
    import { Viewport } from "#lib/viewport/viewport.svelte.ts"
    import { Grid } from "#lib/viewport/grid.svelte.ts"
    import { GridGeometry } from "#lib/viewport/geometry/gridGeometry.svelte.ts";
    import { AxesGeometry } from "#lib/viewport/geometry/axesGeometry.svelte.ts";
    import { createSvgViewportAction } from "#lib/viewport/controls/viewportControls.ts";

    import type { Vector2, Range } from '#lib/viewport/types.ts';
    import type {StandardCoefficients, VertexCoefficients, FactoredCoefficients, EvaluateFunction} from "#lib/math/quadratic/quadratic.ts";
    import {evaluateFactoredCoefficients, evaluateStandardCoefficients, evaluateVertexCoefficients} from "#lib/math/quadratic/quadratic.ts";
    
    
    
    const viewport = new Viewport();
    const grid = new Grid();
    const axes = new AxesGeometry(viewport);
    const gridGeo = new GridGeometry(viewport, grid);
    
    const controls = createSvgViewportAction(viewport, {
        
        onPointerPosition: (position) => {
            pointerCoordinates = position;
        },
        onViewportChange: () => {
            
        }
    })

    let pointerCoordinates: Vector2 = $state({x: 0, y: 0});
    let enableViewportAxis: boolean = $state(false);
    
    
    
    function createPath(evaluator: EvaluateFunction, r: Range, h: number): string
    {
        if(h <= 0 || !Number.isFinite(h))
            return "";
        if(!Number.isFinite(r.min) || 
           !Number.isFinite(r.max) ||
           r.min >= r.max) {
            return "";
        }
        const maxIndex = Math.floor((r.max - r.min) / h);
        const sampleCount = maxIndex + 1;
        if (!Number.isFinite(sampleCount) || sampleCount > MAX_SAMPLES)
            return "";
        let d = "";
        for (let n = 0; n <= maxIndex; n++)
        {
            const x = r.min + (n * h)
            const p = evaluator(x);
            const t = viewport.worldToViewport(p);
            d += `${n === 0 ? "M" : " L"} ${t.x} ${t.y}`
        }
        console.log(`Path Created - SampleCount: ${sampleCount}`);
        return d
    }
    
    const MAX_SAMPLES = 100000
    const h: number = 0.1;
    const standard: StandardCoefficients = {a: 1, b:-3, c:-4}
    const vertex: VertexCoefficients = {a: 1, h: 1, k: -1}
    const factored: FactoredCoefficients = { a: -5, r1: -5, r2: 5 }

    const standardEvaluator: EvaluateFunction =
        (x) => evaluateStandardCoefficients(standard, x);

    const vertexEvaluator: EvaluateFunction =
        (x) => evaluateVertexCoefficients(vertex, x);

    const factoredEvaluator: EvaluateFunction =
        (x) => evaluateFactoredCoefficients(factored, x);
    
    const pathString = $derived(createPath(standardEvaluator, viewport.xRange, h));



    function handlePointerMove(event: PointerEvent)
    {
        const svg = event.currentTarget as SVGSVGElement;
        const rect = svg.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        pointerCoordinates = viewport.viewportToWorld({x: x, y: y});
    }
    
</script>

<div class="graph-container">
    <div>
        x: {pointerCoordinates.x.toFixed(3)}
        y: {pointerCoordinates.y.toFixed(3)}
    </div>
    <svg
            role = "img"
            aria-label="Interactive graph viewport"
            width={viewport.width}
            height={viewport.height}
            viewBox={`0 0 ${viewport.width} ${viewport.height}`}
            use:controls
    >

        {#if enableViewportAxis}
        <!-- Draw viewport x axis -->
        <line
                x1="0"
                y1={viewport.center.y}
                x2={viewport.width}
                y2={viewport.center.y}
                stroke="blue"
                stroke-width="2"
                stroke-dasharray="5,5"
        />
        <!-- Draw viewport y axis -->
        <line
                x1={viewport.center.x}
                y1="0"
                x2={viewport.center.x}
                y2={viewport.height}
                stroke="yellow"
                stroke-width="2"
                stroke-dasharray="5,5"
        />
        {/if}
        
        <!-- Draw Grid -->
        {#each gridGeo.xGridLines as line}
            <line
                    x1={line.start.x}
                    y1={line.start.y}
                    x2={line.end.x}
                    y2={line.end.y}
                    stroke="lightgrey"/>
        {/each}

        {#each gridGeo.yGridLines as line}
            <line
                    x1={line.start.x}
                    y1={line.start.y}
                    x2={line.end.x}
                    y2={line.end.y}
                    stroke="lightgrey"/>
        {/each}
        
        <!-- Draw graph x axis -->
        <line x1="0" y1={viewport.visibleOrigin.y} x2={viewport.width} y2={viewport.visibleOrigin.y} stroke="black" />
        {#each axes.xAxisMarkings as marking}
            <line
                    x1={marking.start.x}
                    y1={marking.start.y}
                    x2={marking.end.x}
                    y2={marking.end.y}
                    stroke="black"
            />
        {/each}

        <!-- Draw graph y axis -->
        <line x1={viewport.visibleOrigin.x} y1="0" x2={viewport.visibleOrigin.x} y2={viewport.height} stroke="black" />
        {#each axes.yAxisMarkings as marking}
            <line
                    x1={marking.start.x}
                    y1={marking.start.y}
                    x2={marking.end.x}
                    y2={marking.end.y}
                    stroke="black"
            />
        {/each}
        <path
                d={pathString}
                stroke="orange"
                stroke-width="2"
                fill="none"
        />
    </svg>
</div>

<style>
    .svg-graph {
        background-color: gray;
    }
</style>