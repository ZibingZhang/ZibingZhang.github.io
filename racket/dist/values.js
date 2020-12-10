import { Environment } from './environment.js';
import { DivByZero, StructureFunctionError } from './errors.js';
import racket from './racket.js';
import * as utils from './utils.js';
/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
 * Concrete Classes
 * = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
/* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
 * Booleans
 * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
/**
 * A Racket boolean.
 */
export class RacketBoolean {
    constructor(value) {
        this.value = value;
    }
    toString() {
        if (this.value) {
            return '#true';
        }
        else {
            return '#false';
        }
    }
    equals(other) {
        return isBoolean(other) && this.value === other.value;
    }
}
export const RACKET_TRUE = new RacketBoolean(true);
export const RACKET_FALSE = new RacketBoolean(false);
export class RacketConstructedList {
    constructor(first, rest) {
        this.first = first;
        this.rest = rest;
    }
    toString() {
        return `(cons ${this.first.toString()} ${this.rest.toString()})`;
    }
    equals(other) {
        return isConstructed(other) && this.first.equals(other.first) && this.rest.equals(other.rest);
    }
}
export class RacketEmptyList {
    toString() {
        return "'()";
    }
    equals(other) {
        return isEmpty(other);
    }
}
export const RACKET_EMPTY_LIST = new RacketEmptyList();
/* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
 * Numbers
 *
 * Class Structure:
 *  RacketNumber
 *    RacketRealNumber
 *      RacketExactNumber
 *      RacketInexactNumber
 *        RacketInexactFraction
 *        RacketInexactFloat
 *    RacketComplexNumber
 * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
/**
 * A Racket number.
 */
export class RacketNumber {
    equals(other) {
        throw new Error('Method not implemented.');
    }
    /**
     * Is this number zero?
     */
    isZero() {
        throw new Error('Method not implemented.');
    }
    /**
     * Return a new Racket number which is equal to the negative of this one.
     */
    negated() {
        throw new Error('Method not implemented.');
    }
    /**
     * Return a new Racket number which is equal to the inverse of this one.
     */
    inverted() {
        throw new Error('Method not implemented.');
    }
    /**
     * Return a new Racket number which is equal to this plus that one.
     * @param other the number to add with this one
     */
    add(other) {
        throw new Error('Method not implemented.');
    }
    /**
     * Return a new Racket number which is equal to this minus that one.
     * @param other the number to subtract with this one
     */
    sub(other) {
        return this.add(other.negated());
    }
    /**
     * Return a new Racket number which is equal to this times that one.
     * @param other the number to multiply with this one
     */
    mul(other) {
        throw new Error('Method not implemented.');
    }
    /**
     * Return a new Racket number which is equal to this divided by that one.
     * @param other the number to divide this one by
     */
    div(other) {
        return this.mul(other.inverted());
    }
}
/**
 * A real Racket number.
 */
export class RacketRealNumber extends RacketNumber {
    constructor(isExact) {
        super();
        this.isExact = isExact;
    }
    negated() {
        throw new Error('Method not implemented.');
    }
    inverted() {
        throw new Error('Method not implemented.');
    }
    isNegative() {
        throw new Error('Method not implemented.');
    }
    isPositive() {
        throw new Error('Method not implemented.');
    }
}
/**
 * An exact Racket number.
 */
export class RacketExactNumber extends RacketRealNumber {
    constructor(numerator, denominator) {
        super(true);
        if (numerator === 0n) {
            this.numerator = 0n;
            this.denominator = 1n;
        }
        else {
            let numeratorSgn = numerator > 0 ? 1n : -1n;
            numerator *= numeratorSgn;
            let gcd = utils.gcd(numerator, denominator);
            this.numerator = numeratorSgn * numerator / gcd;
            this.denominator = denominator / gcd;
        }
    }
    toString() {
        return (Number(this.numerator) / Number(this.denominator)).toString();
    }
    equals(other) {
        return isRational(other) && this.numerator === other.numerator && this.denominator === other.denominator;
    }
    isZero() {
        return this.numerator === 0n;
    }
    negated() {
        return new RacketExactNumber(-this.numerator, this.denominator);
    }
    inverted() {
        if (this.isZero()) {
            throw new DivByZero();
        }
        else {
            let numeratorSign = this.numerator > 0 ? 1n : -1n;
            return new RacketExactNumber(numeratorSign * this.denominator, numeratorSign * this.numerator);
        }
    }
    add(other) {
        if (other instanceof RacketExactNumber) {
            let numerator = this.numerator * other.denominator + this.denominator * other.numerator;
            let denominator = this.denominator * other.denominator;
            return new RacketExactNumber(numerator, denominator);
        }
        else {
            return other.add(this);
        }
    }
    mul(other) {
        if (other instanceof RacketExactNumber) {
            if (this.isZero() || other.isZero())
                return new RacketExactNumber(0n, 1n);
            let numerator = this.numerator * other.numerator;
            let denominator = this.denominator * other.denominator;
            return new RacketExactNumber(numerator, denominator);
        }
        else {
            return other.mul(this);
        }
    }
    isNegative() {
        return this.numerator / this.denominator < 0;
    }
    isPositive() {
        return this.numerator / this.denominator > 0;
    }
}
/**
 * An inexact Racket number.
 */
class RacketInexactNumber extends RacketRealNumber {
}
/**
 * An inexact Racket number which is stored as a fraction.
 */
export class RacketInexactFraction extends RacketInexactNumber {
    constructor(numerator, denominator) {
        super(false);
        if (numerator === 0n) {
            this.numerator = 0n;
            this.denominator = 1n;
        }
        else {
            let numeratorSgn = numerator > 0 ? 1n : -1n;
            numerator *= numeratorSgn;
            let gcd = utils.gcd(numerator, denominator);
            this.numerator = numeratorSgn * numerator / gcd;
            this.denominator = denominator / gcd;
        }
    }
    toString() {
        let value = Number(this.numerator) / Number(this.denominator);
        if (Number.isInteger(value))
            return '#i' + value.toString() + '.0';
        else
            return '#i' + value.toString();
    }
    equals(other) {
        return isRational(other) && this.numerator === other.numerator && this.denominator === other.denominator;
    }
    isZero() {
        return this.numerator === 0n;
    }
    negated() {
        return new RacketInexactFraction(-this.numerator, this.denominator);
    }
    inverted() {
        if (this.isZero()) {
            throw new DivByZero();
        }
        else {
            let numeratorSign = this.numerator > 0 ? 1n : -1n;
            return new RacketInexactFraction(numeratorSign * this.denominator, numeratorSign * this.numerator);
        }
    }
    add(other) {
        if (other instanceof RacketExactNumber || other instanceof RacketInexactFraction) {
            let numerator = this.numerator * other.denominator + this.denominator * other.numerator;
            let denominator = this.denominator * other.denominator;
            return new RacketInexactFraction(numerator, denominator);
        }
        else {
            return other.add(this);
        }
    }
    mul(other) {
        if (other instanceof RacketExactNumber || other instanceof RacketInexactFraction) {
            if (this.isZero() || other.isZero())
                return new RacketInexactFraction(0n, 1n);
            let numerator = this.numerator * other.numerator;
            let denominator = this.denominator * other.denominator;
            return new RacketInexactFraction(numerator, denominator);
        }
        else {
            return other.mul(this);
        }
    }
    isNegative() {
        return this.numerator / this.denominator < 0;
    }
    isPositive() {
        return this.numerator / this.denominator > 0;
    }
}
/**
 * An inexact Racket number which is stored as a float.
 */
export class RacketInexactFloat extends RacketInexactNumber {
    constructor(value) {
        super(false);
        this.isExact = false;
        this.value = value;
    }
    toString() {
        if (this.value === Infinity) {
            return '#i+inf.0';
        }
        else if (this.value === -Infinity) {
            return '#i-inf.0';
        }
        else if (this.value === NaN) {
            return '#i+nan.0';
        }
        else {
            return '#i' + this.value;
        }
    }
    equals(other) {
        return isInexactFloat(other) && this.value === other.value;
    }
    isZero() {
        return this.value === 0;
    }
    negated() {
        return new RacketInexactFloat(-this.value);
    }
    inverted() {
        if (this.isZero()) {
            throw new DivByZero();
        }
        else {
            return new RacketInexactFloat(1 / this.value);
        }
    }
    add(other) {
        if (other instanceof RacketExactNumber || other instanceof RacketInexactFraction) {
            return new RacketInexactFloat(this.value + fractionToFloat(other.numerator, other.denominator));
        }
        else if (other instanceof RacketInexactFloat) {
            return new RacketInexactFloat(this.value + other.value);
        }
        else {
            return other.add(this);
        }
    }
    mul(other) {
        if (other instanceof RacketExactNumber || other instanceof RacketInexactFraction) {
            if (this.isZero() || other.isZero())
                return new RacketInexactFraction(0n, 1n);
            return new RacketInexactFloat(this.value * fractionToFloat(other.numerator, other.denominator));
        }
        else if (other instanceof RacketInexactFloat) {
            if (this.isZero() || other.isZero())
                return new RacketInexactFraction(0n, 1n);
            return new RacketInexactFloat(this.value * other.value);
        }
        else {
            return other.mul(this);
        }
    }
    isNegative() {
        return this.value < 0;
    }
    isPositive() {
        return this.value > 0;
    }
}
/**
 * A complex Racket number.
 */
export class RacketComplexNumber extends RacketNumber {
    constructor(real, imaginary) {
        super();
        this.real = real;
        this.imaginary = imaginary;
    }
    toString() {
        return this.real.toString()
            + (!this.imaginary.isNegative() ? '+' : '')
            + this.imaginary.toString().replace('#i', '') + 'i';
    }
    equals(other) {
        return isComplex(other) && this.real.equals(other.real) && this.imaginary.equals(other.imaginary);
    }
    isZero() {
        return this.real.isZero() && this.imaginary.isZero();
    }
    negated() {
        return new RacketComplexNumber(this.real.negated(), this.imaginary.negated());
    }
    inverted() {
        if (this.isZero()) {
            throw new DivByZero();
        }
        else {
            let magnitudeSquared = this.real.mul(this.real).add(this.imaginary.mul(this.imaginary));
            if (!isReal(magnitudeSquared))
                throw new Error('Unreachable code.');
            let invertedMagnitudeSquared = magnitudeSquared.inverted();
            let real = this.real.mul(invertedMagnitudeSquared);
            let imaginary = this.imaginary.mul(invertedMagnitudeSquared).negated();
            if (!isReal(real) || !isReal(imaginary))
                throw new Error('Unreachable code.');
            return new RacketComplexNumber(real, imaginary);
        }
    }
    add(other) {
        if (other instanceof RacketComplexNumber) {
            let real = this.real.add(other.real);
            let imaginary = this.imaginary.add(other.imaginary);
            if (!isReal(real) || !isReal(imaginary))
                throw new Error('Unreachable code.');
            if (imaginary.isZero())
                return real;
            else
                return new RacketComplexNumber(real, imaginary);
        }
        else {
            let real = this.real.add(other);
            if (!isReal(real))
                throw new Error('Unreachable code.');
            else
                return new RacketComplexNumber(real, this.imaginary);
        }
    }
    mul(other) {
        if (other instanceof RacketComplexNumber) {
            let real = this.real.mul(other.real).sub(this.imaginary.mul(other.imaginary));
            let imaginary = this.real.mul(other.imaginary).add(this.imaginary.mul(other.real));
            if (!isReal(real) || !isReal(imaginary))
                throw new Error('Unreachable code.');
            if (imaginary.isZero())
                return real;
            else
                return new RacketComplexNumber(real, imaginary);
        }
        else {
            let real = this.real.mul(other);
            if (!isReal(real))
                throw new Error('Unreachable code.');
            else
                return new RacketComplexNumber(real, this.imaginary);
        }
    }
}
/* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
 * Strings
 * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
/**
* A Racket string.
*/
export class RacketString {
    constructor(value) {
        this.value = value;
    }
    toString() {
        return JSON.stringify(this.value);
    }
    equals(other) {
        return isString(other) && this.value === other.value;
    }
}
export class RacketLambda {
    constructor(params, body) {
        this.params = params;
        this.body = body;
    }
    equals(other) {
        throw new Error('Method not implemented.');
    }
    call(args) {
        let interpreter = racket.interpreter;
        let enclosing = interpreter.environment;
        interpreter.environment = new Environment(enclosing);
        for (let i = 0; i < args.length; i++) {
            let param = this.params[i];
            let arg = args[i];
            interpreter.environment.define(param, arg);
        }
        let result = interpreter.evaluate(this.body);
        interpreter.environment = enclosing;
        return result;
    }
}
class RacketStructureFunction {
    constructor(func) {
        this.function = func;
    }
    equals(other) {
        throw new Error('Method not implemented.');
    }
    call(args) {
        return this.function(args);
    }
}
/* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
 * Structures
 * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
/**
 * A Racket structure.
 */
export class RacketStructure {
    constructor(name, fields) {
        this.name = name;
        this.fields = fields;
    }
    equals(other) {
        throw new Error('Method not implemented.');
    }
    /**
     * Produce a function that creates an instance of this Racket structure.
     */
    makeFunction() {
        return new RacketStructureFunction((args) => {
            let functionName = 'make-' + this.name;
            let expected = this.fields.length;
            let received = args.length;
            if (expected === 0 && received > 0) {
                this.error(`${functionName}: expects no arguments, but found ${args.length}`);
            }
            else if (expected > received) {
                this.error(`${functionName}: expects ${expected} argument${expected === 1 ? '' : 's'}, but found ${received === 0 ? 'none' : `only ${received}`}`);
            }
            else if (expected < received) {
                this.error(`${functionName}: expects only ${expected} argument${expected === 1 ? '' : 's'}, but found ${received}`);
            }
            else {
                return new RacketInstance(this, args);
            }
        });
    }
    /**
     * Produce a function that determines whether some value is an instance of this structure.
     */
    isInstanceFunction() {
        return new RacketStructureFunction((args) => {
            let functionName = 'make-' + this.name;
            if (args.length === 0) {
                this.error(`${functionName}: expects 1 argument, but found none`);
            }
            else if (args.length > 1) {
                this.error(`${functionName}: expects only 1 argument, but found ${args.length}`);
            }
            else {
                let instance = args[0];
                return instance instanceof RacketInstance && instance.type === this ? RACKET_TRUE : RACKET_FALSE;
            }
        });
    }
    /**
     * Produce a list of functions that get attributes from instances of this Racket structure.
     */
    getFunctions() {
        let functions = [];
        this.fields.forEach((field, i) => {
            functions.push(new RacketStructureFunction((args) => {
                let functionName = `${this.name}-${field}`;
                if (args.length === 0) {
                    this.error(`${functionName}: expects 1 argument, but found none`);
                }
                else if (args.length > 1) {
                    this.error(`${functionName}: expects only 1 argument, but found ${args.length}`);
                }
                else {
                    let instance = args[0];
                    if (!(instance instanceof RacketInstance) || instance.type !== this) {
                        this.error(`${functionName}: expects a ${this.name}, given ${instance.toString()}`);
                    }
                    else {
                        return instance.values[i];
                    }
                }
            }));
        });
        return functions;
    }
    error(msg) {
        throw new StructureFunctionError(msg);
    }
}
/**
 * An instance of a Racket structure.
 */
export class RacketInstance {
    constructor(type, values) {
        this.type = type;
        this.values = values;
    }
    toString() {
        let string = `(make-${this.type.name}`;
        for (let value of this.values) {
            string += ` ${value.toString()}`;
        }
        return string + ')';
    }
    equals(other) {
        if (!isInstance(other)) {
            return false;
        }
        for (let idx = 0; idx < this.values.length; idx++) {
            if (!this.values[idx].equals(other.values[idx])) {
                return false;
            }
        }
        return true;
    }
}
/* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
 * Symbols
 * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
/**
* A Racket symbol.
*/
export class RacketSymbol {
    constructor(name) {
        this.name = name;
    }
    toString() {
        return "'" + this.name;
    }
    equals(other) {
        return isSymbol(other) && this.name === other.name;
    }
}
/* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
 * Type Guards
 * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
export function isCallable(object) {
    return object.call !== undefined;
}
export function isBoolean(object) {
    return object === RACKET_TRUE || object === RACKET_FALSE;
}
export function isComplex(object) {
    return object instanceof RacketComplexNumber;
}
export function isConstructed(object) {
    return object instanceof RacketConstructedList;
}
export function isEmpty(object) {
    return object instanceof RacketEmptyList;
}
export function isExact(number) {
    return number instanceof RacketExactNumber;
}
export function isInstance(object) {
    return object instanceof RacketInstance;
}
export function isInexact(object) {
    return object instanceof RacketInexactNumber;
}
function isInexactFloat(object) {
    return object instanceof RacketInexactFloat;
}
export function isList(object) {
    return object instanceof RacketConstructedList
        || object === RACKET_EMPTY_LIST;
}
export function isNumber(object) {
    return object instanceof RacketNumber;
}
export function isRational(object) {
    return object instanceof RacketExactNumber
        || object instanceof RacketInexactFraction;
}
export function isReal(number) {
    return number instanceof RacketRealNumber;
}
export function isString(object) {
    return object instanceof RacketString;
}
export function isStructure(object) {
    return object instanceof RacketStructure;
}
export function isSymbol(object) {
    return object instanceof RacketSymbol;
}
/* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
 * Helper Functions
 * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
function fractionToFloat(numerator, denominator) {
    return Number(numerator) / Number(denominator);
}
