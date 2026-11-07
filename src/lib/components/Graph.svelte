<script lang="ts">
    import { onMount } from 'svelte';
    
    type Vector2 = { x: number; y: number };
    type Interval = { min: number; max: number };
    type Size2D = { width: number; height: number };
    
    type Coefficients = { a: number; b: number; c: number };
    
    function evaluate(q: Coefficients, x: number): Vector2
    {
        const y = (q.a * (x ** 2)) + (q.b * x) + q.c;
        return { x, y };
    }
    
    function evaluateRange(q: Coefficients, r: Interval): Vector2[]
    {
        const points: Vector2[] = [];
        for(let i = r.min; i <= r.max; i++)
        {
            points.push(evaluate(q, i));
        }
        return points
    }
    
    const viewport: Size2D = {width: 800, height: 800};
    
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
    
    const a: Vector2 = { x: 5, y: 0};
    const p = mapPoint(a);
    
    onMount(() => {
        const q: Coefficients = {a: 2, b:-3, c:1}
        const r: Interval = { min: -10, max: 10 };
        
        const points = evaluateRange(q, r);
        console.log(points);
        // const point: Vector2 = evaluate(q, 2);
        // console.log(point);
        // console.log(mapPoint(point));
    })
        
</script>

<div class="graph-container">
    <svg class="svg-graph" viewBox="0 0 {viewport.width} {viewport.height}" xmlns="http://www.w3.org/2000/svg"
         style:width={`${viewport.width}px`} style:height={`${viewport.height}px`}>
        <line x1="0" y1={origin.y} x2={viewport.width} y2={origin.y} stroke="black" />
        <line x1={origin.x} y1="0" x2={origin.x} y2={viewport.height} stroke="black" />
        <circle cx={p.x} cy={p.y} r="2" fill="black" />
    </svg>
</div>
