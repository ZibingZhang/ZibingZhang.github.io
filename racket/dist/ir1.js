/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
 * Concrete Classes
 * = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
/**
 * Any grouping of sub-expressions denoted using parentheses.
 */
export class Group {
    constructor(elements) {
        this.elements = elements;
    }
    accept(visitor) {
        return visitor.visitGroup(this);
    }
}
/**
 * An identifier, i.e. name.
 */
export class Identifier {
    constructor(name) {
        this.name = name;
    }
    accept(visitor) {
        return visitor.visitIdentifier(this);
    }
}
/**
 * An identifier that happens to be a keyword.
 */
export class Keyword {
    constructor(token) {
        this.token = token;
    }
    accept(visitor) {
        return visitor.visitKeyword(this);
    }
}
/**
 * A literal value, i.e. boolean, number, string.
 */
export class Literal {
    constructor(value) {
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitLiteral(this);
    }
}
