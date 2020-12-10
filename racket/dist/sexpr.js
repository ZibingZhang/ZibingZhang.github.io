/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
 * Concrete Classes
 * = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
/**
 * A list.
 */
export class SExprList {
    constructor(elements) {
        this.elements = elements;
    }
    toString() {
        let strings = [];
        for (let element of this.elements)
            strings.push(element.toString());
        return `(${strings.join(' ')})`;
    }
    accept(visitor) {
        return visitor.visitSExprList(this);
    }
}
/**
 * A literal value, i.e. boolean, number, string.
 */
export class SExprLiteral {
    constructor(token) {
        this.token = token;
    }
    toString() {
        let value = this.token.value;
        if (value === undefined)
            throw new Error('Unreachable code.');
        return value.toString();
    }
    accept(visitor) {
        return visitor.visitSExprLiteral(this);
    }
}
/**
 * A symbol.
 */
export class SExprSymbol {
    constructor(token) {
        this.token = token;
    }
    toString() {
        return this.token.lexeme;
    }
    accept(visitor) {
        return visitor.visitSExprSymbol(this);
    }
}
