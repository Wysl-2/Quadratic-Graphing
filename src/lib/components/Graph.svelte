<script lang="ts">
    
    type Vector2 = { x: number; y: number };
    type Interval = { min: number; max: number };
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
    
    function createPath(evaluator: EvaluateFunction, r: Interval, h: number): string
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
            const tp = mapPoint(p);
            d += `${n === 0 ? "M" : " L"} ${tp.x} ${tp.y}`
        }
        return d
    }

    function createAxisMarkings(axis: Axis): Vector2[]
    {
        const range: Interval = axis == "x" ? xRange : yRange
        const markings: Vector2[] = [];
        for(let i = Math.ceil(range.min); i <= range.max; i++)
        {
            if(i === 0)
                continue;
            const point: Vector2 = axis === "x"
                ? { x: i, y: 0 }
                : { x: 0, y: i };
            markings.push(mapPoint(point));
        }
        return markings;
    }
    
    
    const viewport: Size2D = {width: 1200, height: 400};
    const xRange: Interval = { min: -10, max: 10 };
    const yRange: Interval = { min: -10, max: 10 };
    
    const scale: Vector2 = {
        x: viewport.width / (xRange.max - xRange.min),
        y: viewport.height / (yRange.max - yRange.min)
    }
    
    const origin: Vector2 = {
        x:  -xRange.min * scale.x,
        y:  yRange.max * scale.y,
    };
    
    function mapPoint(point: Vector2): Vector2 {
        const x = origin.x + (point.x * scale.x);
        const y = origin.y - (point.y * scale.y);
        return { x, y }
    }

    const xAxisMarkings: Vector2[] = createAxisMarkings("x");
    const yAxisMarkings: Vector2[] = createAxisMarkings("y");
    
    const MAX_SAMPLES = 100000
    const h: number = 0.1;
    const standard: StandardCoefficients = {a: 1, b:0, c:-5}
    const vertex: VertexCoefficients = {a: 1, h: -1, k: 0}
    const factored: FactoredCoefficients = { a: -5, r1: -5, r2: 5 }

    const standardEvaluator: EvaluateFunction =
        (x) => evaluateStandardCoefficients(standard, x);

    const vertexEvaluator: EvaluateFunction =
        (x) => evaluateVertexCoefficients(vertex, x);

    const factoredEvaluator: EvaluateFunction =
        (x) => evaluateFactoredCoefficients(factored, x);
    
    const pathString = createPath(vertexEvaluator, xRange, h);
        
</script>

<div class="graph-container">
    <svg class="svg-graph" viewBox="0 0 {viewport.width} {viewport.height}" xmlns="http://www.w3.org/2000/svg"
         style:width={`${viewport.width}px`} style:height={`${viewport.height}px`}>
        <line x1="0" y1={origin.y} x2={viewport.width} y2={origin.y} stroke="black" />
        {#each xAxisMarkings as marking}
            <line 
            x1={marking.x}
            y1={marking.y - 5}
            x2={marking.x}
            y2={marking.y + 5}
            stroke="black"/>
        {/each}
        <line x1={origin.x} y1="0" x2={origin.x} y2={viewport.height} stroke="black" />
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
</div>

<style>
    .svg-graph {
        background-color: gray;
    }
</style>