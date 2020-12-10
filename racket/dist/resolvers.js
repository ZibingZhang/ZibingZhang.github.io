import * as ir2 from './ir2.js';
import racket from './racket.js';
class Ir1Resolver {
    visitCall(expr) {
        if (expr.callee === undefined)
            throw new Ir1Resolver.Ir1ResolverError("function call: expected a function call after the open parenthesis, but nothing's there");
        let callee = this.evaluate(expr.callee);
        let args = expr.args.map(this.evaluate.bind(this));
        return new ir2.Call(callee, args);
    }
    visitDefineKeyword(expr) {
        throw Error();
    }
    visitLiteral(expr) {
        return new ir2.Literal(expr.value);
    }
    visitVariable(expr) {
        return new ir2.Variable(expr.name);
    }
    resolve(ir1Exprs) {
        let ir2Exprs = [];
        try {
            for (let ir1Expr of ir1Exprs) {
                ir2Exprs.push(ir1Expr.accept(this));
            }
        }
        catch (err) {
            if (err instanceof Ir1Resolver.Ir1ResolverError) {
                racket.error(err.msg);
            }
            else {
                throw err;
            }
        }
        return ir2Exprs;
    }
    evaluate(expr) {
        return expr.accept(this);
    }
}
Ir1Resolver.Ir1ResolverError = class extends Error {
    constructor(msg) {
        super();
        this.msg = msg;
    }
};
export default new Ir1Resolver();
