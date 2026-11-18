import type {Vector2} from "#lib/viewport/types.ts";

export type StandardCoefficients = {
    a: number;
    b: number;
    c: number;
};

export type VertexCoefficients = {
    a: number;
    h: number;
    k: number;
};

export type FactoredCoefficients = {
    a: number;
    r1: number;
    r2: number;
};

export type EvaluateFunction = (x: number) => Vector2;

export function evaluateStandardCoefficients(q: StandardCoefficients, x: number): Vector2
{
    const y = (q.a * (x ** 2)) + (q.b * x) + q.c;
    return { x, y };
}

export function evaluateVertexCoefficients(q: VertexCoefficients, x: number): Vector2
{
    const y = q.a * (x - q.h) ** 2 + q.k;
    return { x, y };
}

export function evaluateFactoredCoefficients(q: FactoredCoefficients, x: number): Vector2
{
    const y = q.a * (x - q.r1) * (x - q.r2)
    return { x, y }
}


// function createPathString(points: Vector2[]): string
// {
//     if (points.length === 0)
//         return "";
//     const p1 = mapPoint(points[0])
//     let d = `M ${p1.x} ${p1.y}`;
//     for(let i = 1; i < points.length; i++)
//     {
//         const p = mapPoint(points[i]);
//         const s = ` L ${p.x} ${p.y}`;
//         d += s;
//     }
//     return d;
// }
//
// function evaluateRange(q: Coefficients, r: Interval, h: number = 1): Vector2[]
// {
//     const points: Vector2[] = [];
//     for(let i = r.min; i <= r.max; i += h)
//     {
//         points.push(evaluate(q, i));
//     }
//     return points
// }
//
// function mapPoint(point: Vector2): Vector2 {
//     const x = origin.x + (point.x * scale.x);
//     const y = origin.y - (point.y * scale.y);
//     return { x, y }
// }