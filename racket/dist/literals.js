export class RacketExactNumber {
    constructor(numerator, denominator) {
        this.isExact = true;
        this.numerator = numerator;
        this.denominator = denominator;
    }
    toString() {
        return (Number(this.numerator) / Number(this.denominator)).toString();
    }
    isNegative() {
        return this.numerator / this.denominator < 0;
    }
    isZero() {
        return this.numerator / this.denominator === 0n;
    }
    isPositive() {
        return this.numerator / this.denominator > 0;
    }
}
export class RacketInexactFraction {
    constructor(numerator, denominator) {
        this.isExact = false;
        this.numerator = numerator;
        this.denominator = denominator;
    }
    toString() {
        let value = Number(this.numerator) / Number(this.denominator);
        if (Number.isInteger(value))
            return '#i' + value.toString() + '.0';
        else
            return '#i' + value.toString();
    }
    isNegative() {
        return this.numerator / this.denominator < 0;
    }
    isZero() {
        return this.numerator / this.denominator === 0n;
    }
    isPositive() {
        return this.numerator / this.denominator > 0;
    }
}
export class RacketInexactFloat {
    constructor(value) {
        this.isExact = false;
        this.value = value;
    }
    isNegative() {
        return this.value < 0;
    }
    isZero() {
        return this.value === 0;
    }
    isPositive() {
        return this.value > 0;
    }
}
export class RacketComplexNumber {
    constructor(real, complex) {
        this.real = real;
        this.complex = complex;
    }
    toString() {
        return this.real.toString()
            + (!this.complex.isNegative() ? '+' : '')
            + this.complex.toString().replace('#i', '') + 'i';
    }
}
