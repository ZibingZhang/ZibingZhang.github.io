import Interpreter from './interpreter.js';
import { Console } from './output.js';
import parser from './parser.js';
import Resolver from './resolver.js';
import scanner from './scanner.js';
/**
 * Evaluates Racket code.
 */
class Racket {
    constructor() {
        this.output = new Console();
        this.resolver = new Resolver();
        this.interpreter = new Interpreter();
        this.hasError = false;
        this.errors = [];
    }
    run(text) {
        this.hasError = false;
        this.errors = [];
        let tokens = scanner.scan(text);
        if (this.report())
            return;
        let ir1Exprs = parser.parse(tokens);
        if (this.report())
            return;
        this.resolver = new Resolver();
        let ir2Exprs = this.resolver.resolveBody(ir1Exprs);
        if (this.report())
            return;
        this.interpreter = new Interpreter();
        let values = this.interpreter.interpretBody(ir2Exprs);
        if (this.report())
            return;
        for (let value of values) {
            this.output.display(value.toString());
        }
        let testCases = this.resolver.resolveTestCases();
        let passedTests = this.interpreter.interpretTestCases(testCases);
        if (this.report())
            return;
        if (passedTests === 1) {
            this.output.display('The test passed!');
        }
        else if (passedTests === 2) {
            this.output.display('Both tests passed!');
        }
        else if (passedTests >= 3) {
            this.output.display(`All ${passedTests} tests passed!`);
        }
    }
    /**
     * Log an error.
     * @param msg the error message
     */
    error(msg) {
        this.hasError = true;
        this.errors.push(msg);
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * Error Reporting
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    report() {
        if (!this.hasError)
            return false;
        for (let msg of this.errors) {
            this.output.display(msg);
        }
        return true;
    }
}
export default new Racket();
