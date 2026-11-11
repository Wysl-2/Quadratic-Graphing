<script lang="ts">
    
    type Vector2 = { x: number; y: number };
    type Range = { min: number; max: number };
    type Size2D = { width: number; height: number };
    type Axis = "x" | "y";
    
    type StandardCoefficients = {
        a: number;
        b: number;
        c: number;
    };

    type VertexCoefficients = {
        a: number;
        h: number;
        k: number;
    };

    type FactoredCoefficients = {
        a: number;
        r1: number;
        r2: number;
    };

    type EvaluateFunction = (x: number) => Vector2;
    
    function evaluateStandardCoefficients(q: StandardCoefficients, x: number): Vector2
    {
        const y = (q.a * (x ** 2)) + (q.b * x) + q.c;
        return { x, y };
    }
    
    function evaluateVertexCoefficients(q: VertexCoefficients, x: number): Vector2
    {
        const y = q.a * (x - q.h) ** 2 + q.k;
        return { x, y };
    }
    
    function evaluateFactoredCoefficients(q: FactoredCoefficients, x: number): Vector2
    {
        const y = q.a * (x - q.r1) * (x - q.r2)
        return { x, y }
    }
    
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
            const t = mathToSvg(p);
            d += `${n === 0 ? "M" : " L"} ${t.x} ${t.y}`
        }
        console.log(`Path Created - SampleCount: ${sampleCount}`);
        return d
    }

    function createAxisMarkings(axis: Axis): Vector2[]
    {
        const range: Range = axis == "x" ? xRange : yRange
        const markings: Vector2[] = [];
        for(let i = Math.ceil(range.min); i <= range.max; i++)
        {
            if(i === 0)
                continue;
            const point: Vector2 = axis === "x"
                ? { x: i, y: 0 }
                : { x: 0, y: i };
            markings.push(mathToSvg(point));
        }
        return markings;
    }
    
    
    const viewport: Size2D = {width: 800, height: 800};
    
    const viewportCenter: Vector2 = { 
        x: viewport.width / 2,
        y: viewport.height / 2
    };
    
    const viewcenter: Vector2 = $state({ x: 0, y: 0 });
    
    let scale: number = $state(40);
    
    const xRange: Range = $derived({
        min: viewcenter.x - viewport.width/(2 * scale),
        max: viewcenter.x + viewport.width/(2 * scale)
    })

    const yRange: Range = $derived({
        min: viewcenter.y - viewport.height / (2 * scale),
        max: viewcenter.y + viewport.height / (2 * scale)
    })
    
    const svgOrigin: Vector2 = $derived({
        x: viewportCenter.x - viewcenter.x * scale,
        y: viewportCenter.y + viewcenter.y * scale
    })
    
    function mathToSvg(point: Vector2): Vector2 {
        const x = viewportCenter.x + (point.x - viewcenter.x) * scale;
        const y = viewportCenter.y - (point.y - viewcenter.y) * scale;

        return { x, y };
    }
    
    function svgToMath(svgPoint: Vector2): Vector2 {
        const x = ((svgPoint.x - viewportCenter.x) / scale) + viewcenter.x;
        const y = ((viewportCenter.y - svgPoint.y) / scale) + viewcenter.y;
        
        return { x, y };
    }

    const xAxisMarkings: Vector2[] = $derived(createAxisMarkings("x"));
    const yAxisMarkings: Vector2[] = $derived(createAxisMarkings("y"));
    
    const MAX_SAMPLES = 100000
    const h: number = 0.1;
    const standard: StandardCoefficients = {a: 1, b:0, c:-5}
    const vertex: VertexCoefficients = {a: 1, h: 1, k: -1}
    const factored: FactoredCoefficients = { a: -5, r1: -5, r2: 5 }

    const standardEvaluator: EvaluateFunction =
        (x) => evaluateStandardCoefficients(standard, x);

    const vertexEvaluator: EvaluateFunction =
        (x) => evaluateVertexCoefficients(vertex, x);

    const factoredEvaluator: EvaluateFunction =
        (x) => evaluateFactoredCoefficients(factored, x);
    
    const pathString = $derived(createPath(vertexEvaluator, xRange, h));

    let pointerCoordinates: Vector2 = $state({x: 0, y: 0});
    
    let enableViewportAxis: boolean = $state(false);

    function handlePointerMove(event: PointerEvent)
    {
        const svg = event.currentTarget as SVGSVGElement;
        const rect = svg.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        pointerCoordinates = svgToMath({x: x, y: y});
    }

    let scaleInput: string = $state(String(scale));
    let xInput: string = $state(String(viewcenter.x))
    let yInput: string = $state(String(viewcenter.y))
    
    $effect(() => {
        scaleInput = String(scale);
    });
    function handleScaleInput(event: Event) {
        const input = event.currentTarget as HTMLInputElement;

        scaleInput = input.value;

        const value = Number(scaleInput);

        if (
            scaleInput.trim() === "" ||
            !Number.isFinite(value) ||
            value < 10 ||
            value > 100 ||
            !Number.isInteger(value)
        ) {
            return;
        }

        scale = value;
    }

    $effect(() => {
        xInput = String(viewcenter.x);
    })
    function handleXInput(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        
        xInput = input.value;

        const value = Number(xInput);
        
        if(
            xInput.trim() === "" ||
            !Number.isFinite(value) ||
            value < -20 ||
            value > 20
        ) {
            return;
        }
        
        viewcenter.x = value
    }

    $effect(() => {
        yInput = String(viewcenter.y);
    })
    function handleYInput(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        
        yInput = input.value;
        
        const value = Number(yInput);

        if(
            yInput.trim() === "" ||
            !Number.isFinite(value) ||
            value < -20 ||
            value > 20
        ) {
            return;
        }
        
        viewcenter.y = value
    }
        
</script>

<div class="graph-container">
    <div>
        x: {pointerCoordinates.x.toFixed(3)}
        y: {pointerCoordinates.y.toFixed(3)}
    </div>
    <svg class="svg-graph" role="img" viewBox="0 0 {viewport.width} {viewport.height}" xmlns="http://www.w3.org/2000/svg"
         style:width={`${viewport.width}px`} style:height={`${viewport.height}px`}
         onpointermove={handlePointerMove}>

        {#if enableViewportAxis}
        <!-- Draw viewport x axis -->
        <line
                x1="0"
                y1={viewportCenter.y}
                x2={viewport.width}
                y2={viewportCenter.y}
                stroke="blue"
                stroke-width="2"
                stroke-dasharray="5,5"
        />
        <!-- Draw viewport y axis -->
        <line
                x1={viewportCenter.x}
                y1="0"
                x2={viewportCenter.x}
                y2={viewport.height}
                stroke="yellow"
                stroke-width="2"
                stroke-dasharray="5,5"
        />
        {/if}
        
        <!-- Draw graph x axis -->
        <line x1="0" y1={svgOrigin.y} x2={viewport.width} y2={svgOrigin.y} stroke="black" />
        {#each xAxisMarkings as marking}
            <line 
            x1={marking.x}
            y1={marking.y - 5}
            x2={marking.x}
            y2={marking.y + 5}
            stroke="black"/>
        {/each}

        <!-- Draw graph y axis -->
        <line x1={svgOrigin.x} y1="0" x2={svgOrigin.x} y2={viewport.height} stroke="black" />
        {#each yAxisMarkings as marking}
            <line
                    x1={marking.x - 5}
                    y1={marking.y}
                    x2={marking.x + 5}
                    y2={marking.y}
                    stroke="black"/>
        {/each}
        <path
                d={pathString}
                stroke="orange"
                stroke-width="2"
                fill="none"
        />
    </svg>
    <div class="slidecontainer">
        <!-- Scale Slider -->
        <label>Scale</label>
        <input
                type="range"
                min="10"
                max="100"
                step="1"
                bind:value={scale}
                class="slider"
        >
        <input
                type="text"
                inputmode="numeric"
                value={scaleInput}
                oninput={handleScaleInput}
                aria-label="Scale value"
        />
    </div>

    <!-- X Slider -->
    <div class="slidecontainer">
        <label>X</label>
        <input
                type="range"
                min="-20"
                max="20"
                step="0.1"
                bind:value={viewcenter.x}
                class="slider"
        >
        <input
                type="text"
                inputmode="numeric"
                value={xInput}
                oninput={handleXInput}
                aria-label="Scale value"
        />
    </div>
    <!-- Y Slider -->
    <div class="slidecontainer">
        <label>Y</label>
        <input
                type="range"
                min="-20"
                max="20"
                step="0.1"
                bind:value={viewcenter.y}
                class="slider"
        >
        <input
                type="text"
                inputmode="numeric"
                value={yInput}
                oninput={handleYInput}
                aria-label="Scale value"
        />
    </div>
    <div>
        <label>Enable Viewport Axis</label>
        <input type="checkbox" bind:checked={enableViewportAxis} />
    </div>
</div>

<style>
    .svg-graph {
        background-color: gray;
    }
</style>