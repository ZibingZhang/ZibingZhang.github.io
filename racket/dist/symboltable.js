/**
 * A nested mapping from names to value types.
 *
 * It also keeps track of the arity of functions if the value is of type function.
 */
export class SymbolTable {
    constructor(enclosing = undefined) {
        this.values = new Map();
        this.arities = new Map();
        this.enclosing = enclosing;
    }
    /**
     * Does this table contain the name?
     * @param name the name to lookup
     */
    contains(name) {
        return this.values.has(name) || (!!this.enclosing && this.enclosing.contains(name));
    }
    /**
     * Map the name to the value.
     *
     * @param name the name to be mapped
     * @param value the value the name is mapped to
     * @param arity the arity of the value if it is a function
     */
    define(name, value, arity = undefined) {
        if (value === RacketValueType.FUNCTION) {
            if (arity !== undefined) {
                this.arities.set(name, arity);
            }
            else {
                throw new Error('Unreachable code.');
            }
        }
        this.values.set(name, value);
    }
    /**
     * Get the value type the name is mapped to.
     * @param name the mapped name
     */
    get(name) {
        let type = this.values.get(name);
        if (type === undefined && this.enclosing) {
            return this.enclosing.get(name);
        }
        else {
            return type;
        }
    }
    /**
     * Get the arity of the function the name represents.
     * @param name the mapped name
     */
    getArity(name) {
        let value = this.arities.get(name);
        if (value === undefined) {
            if (this.enclosing === undefined) {
                throw new Error('Unreachable code.');
            }
            else {
                return this.enclosing.getArity(name);
            }
        }
        else {
            return value;
        }
    }
}
/* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
 * Racket Value Types
 * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
export var RacketValueType;
(function (RacketValueType) {
    RacketValueType["BUILTIN_FUNCTION"] = "BUILTIN_FUNCTION";
    RacketValueType["BUILTIN_LITERAL"] = "BUILTIN_LITERAL";
    RacketValueType["FUNCTION"] = "FUNCTION";
    RacketValueType["INSTANCE"] = "INSTANCE";
    RacketValueType["PARAMETER"] = "PARAMETER";
    RacketValueType["STRUCTURE"] = "STRUCTURE";
    RacketValueType["VARIABLE"] = "VARIABLE";
})(RacketValueType || (RacketValueType = {}));
