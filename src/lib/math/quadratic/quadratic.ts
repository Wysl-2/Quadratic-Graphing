export type Quadratic =
    | {
    form: "standard";
    coefficients: StandardCoefficients;
}
    | {
    form: "vertex";
    coefficients: VertexCoefficients;
}
    | {
    form: "factored";
    coefficients: FactoredCoefficients;
};

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

export type EvaluateFunction = (x: number) => number;

export function evaluateStandardCoefficients(q: StandardCoefficients, x: number): number
{
    return (q.a * (x ** 2)) + (q.b * x) + q.c;
}

export function evaluateVertexCoefficients(q: VertexCoefficients, x: number): number
{
    return q.a * (x - q.h) ** 2 + q.k;
}

export function evaluateFactoredCoefficients(q: FactoredCoefficients, x: number): number
{
    return q.a * (x - q.r1) * (x - q.r2)
}

export function evaluateQuadratic(
    quadratic: Quadratic,
    x: number
): number {

    switch (quadratic.form) {

        case "standard":
            return evaluateStandardCoefficients(
                quadratic.coefficients,
                x
            );

        case "vertex":
            return evaluateVertexCoefficients(
                quadratic.coefficients,
                x
            );

        case "factored":
            return evaluateFactoredCoefficients(
                quadratic.coefficients,
                x
            );
    }
}
