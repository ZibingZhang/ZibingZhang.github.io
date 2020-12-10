export class Call {
    constructor(callee, args) {
        this.callee = callee;
        this.args = args;
    }
}
export class BaseLiteral {
    constructor(value) {
        this.value = value;
    }
}
export class Variable {
    constructor(name) {
        this.name = name;
    }
}
