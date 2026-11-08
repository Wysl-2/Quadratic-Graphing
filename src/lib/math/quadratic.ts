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