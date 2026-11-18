import type { Quadratic } from "#lib/math/quadratic/quadratic.ts";

export function evaluateQuadraticDerivative(
    quadratic: Quadratic,
    x: number
): number {
    switch(quadratic.form){
        case "standard": {
            const { a, b } = quadratic.coefficients
            return  2 * a * x + b
        }
            
        case "vertex": {
            const { a, h } = quadratic.coefficients
            return 2 * a * (x - h)
        }
        
        case "factored": {
            const { a, r1, r2 } = quadratic.coefficients
            return a * (2 * x - r1 - r2)
        }
    }
}