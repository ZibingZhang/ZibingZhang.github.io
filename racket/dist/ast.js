export class Call {
    constructor(callee, args) {
        this.callee = callee;
        this.arguments = args;
    }
    accept(visitor) {
        return visitor.visitCall(this);
    }
}
export class DefineFunction {
    constructor(name, params, body) {
        this.name = name;
        this.parameters = params;
        this.body = body;
    }
    accept(visitor) {
        return visitor.visitDefineKeyword(this);
    }
}
export class DefineKeyword {
    accept(visitor) {
        return visitor.visitDefineKeyword(this);
    }
}
export class DefineVariable {
    constructor(args) {
        this.arguments = args;
    }
    accept(visitor) {
        return visitor.visitDefineVariable(this);
    }
}
export class Identifier {
    constructor(name) {
        this.name = name;
    }
    accept(visitor) {
        return visitor.visitIdentifier(this);
    }
}
export class Literal {
    constructor(value) {
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitLiteral(this);
    }
}
