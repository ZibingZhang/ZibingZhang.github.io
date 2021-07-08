/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
 * Concrete Classes
 * = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
/**
 * An and expression.
 */
export class AndExpression {
    constructor(exprs) {
        this.expressions = exprs;
    }
    accept(visitor) {
        return visitor.visitAndExpression(this);
    }
}
/**
 * A function call.
 */
export class Call {
    constructor(callee, args) {
        this.callee = callee;
        this.arguments = args;
    }
    accept(visitor) {
        return visitor.visitCall(this);
    }
}
/**
 * A cond expression.
 */
export class CondExpression {
    constructor(clauses) {
        this.clauses = clauses;
    }
    accept(visitor) {
        return visitor.visitCondExpression(this);
    }
}
/**
 * A structure definition.
 */
export class DefineStructure {
    constructor(name, fields) {
        this.name = name;
        this.fields = fields;
    }
    accept(visitor) {
        return visitor.visitDefineStructure(this);
    }
}
/**
 * A variable definition.
 */
export class DefineVariable {
    constructor(identifier, expr) {
        this.identifier = identifier;
        this.expression = expr;
    }
    accept(visitor) {
        return visitor.visitDefineVariable(this);
    }
}
/**
 * An identifier.
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
 * An if expression.
 */
export class IfExpression {
    constructor(predicate, ifTrue, ifFalse) {
        this.predicate = predicate;
        this.ifTrue = ifTrue;
        this.ifFalse = ifFalse;
    }
    accept(visitor) {
        return visitor.visitIfExpression(this);
    }
}
/**
 * A lambda expression.
 */
export class LambdaExpression {
    constructor(names, body) {
        this.names = names;
        this.body = body;
    }
    accept(visitor) {
        return visitor.visitLambdaExpression(this);
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
/**
 * An and expression.
 */
export class OrExpression {
    constructor(exprs) {
        this.expressions = exprs;
    }
    accept(visitor) {
        return visitor.visitOrExpression(this);
    }
}
/**
 * A quoted value, e.g. symbol or list.
 */
export class Quoted {
    constructor(expr) {
        this.expression = expr;
    }
    accept(visitor) {
        return visitor.visitQuoted(this);
    }
}
/**
 * A test case.
 */
export class TestCase {
    constructor(actual, expected) {
        this.actual = actual;
        this.expected = expected;
    }
    accept(visitor) {
        return visitor.visitTestCase(this);
    }
}
/* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
 * Not Visited
 * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
/**
 * A group for `quote`.
 */
export class Group {
    constructor(exprs) {
        this.elements = exprs;
    }
}
