import { UnreachableCode } from './errors.js';
/**
 * A nested mapping from names to values.
 */
export class Environment {
    constructor(enclosing = undefined) {
        this.values = new Map();
        this.enclosing = enclosing;
    }
    /**
     * Map the name to the value.
     * @param name the name to be mapped (or defined)
     * @param value the value to which the name is mapped
     */
    define(name, value) {
        /* Note:
         *  It is not the environments job to prevent mutation. That should be
         *  enforced at the resolver level. The check is just for debugging.
         */
        if (this.values.has(name)) {
            throw new UnreachableCode();
        }
        this.values.set(name, value);
    }
    /**
     * Get the value the name is mapped to
     * @param name the mapped name
     */
    get(name) {
        /* Note:
         *  It should be the case that an environment is never asked to retrieve a
         *  value that it does not have. This should be guaranteed at the resolver.
         */
        let value = this.values.get(name);
        if (value === undefined) {
            if (this.enclosing === undefined) {
                return undefined;
            }
            else {
                return this.enclosing.get(name);
            }
        }
        else {
            return value;
        }
    }
}
