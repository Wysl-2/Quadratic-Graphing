
export function frac(u: number){
    return u - Math.floor(u);
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function inverseLerp(a: number, b: number, position: number): number {
    return (position - a) / (b - a);
}

export function normalisePeriodic(range: number, n: number) {
    const u = n / range;
    return frac(u)
}

export function decompose(u: number){
    const integer = Math.floor(u)
    return {
        integer,
        fraction: u - integer
    }
}