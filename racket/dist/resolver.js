import BUILT_INS from './builtins.js';
import { ResolverError, UnreachableCode } from './errors.js';
import * as ir1 from './ir1.js';
import * as ir2 from './ir2.js';
import racket from './racket.js';
import { reporter } from './reporter.js';
import { RacketValueType, SymbolTable } from './symboltable.js';
import { KEYWORDS, TokenType } from './tokens.js';
import { isCallable, isList, isNumber } from './values.js';
/**
 * Transforms Intermediate Representation Is into Intermediate Representation
 * IIs along with a lot of error checking.
 */
export default class Resolver {
    constructor() {
        this.symbolTable = new SymbolTable();
        this.atTopLevel = true;
        this.evaluatingCallee = false;
        this.inFunctionDefinition = false;
        this.resolvingQuoted = false;
        this.testCases = [];
        for (let [name, value] of BUILT_INS) {
            if (isNumber(value) || isList(value)) {
                this.symbolTable.define(name, RacketValueType.BUILTIN_LITERAL);
            }
            else if (isCallable(value)) {
                this.symbolTable.define(name, RacketValueType.BUILTIN_FUNCTION);
            }
            else {
                throw new Error('Unreachable code.');
            }
        }
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * Visitor
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    visitGroup(expr) {
        let elements = expr.elements;
        if (this.resolvingQuoted) {
            let groupElements = [];
            for (let element of elements) {
                groupElements.push(this.evaluate(element));
            }
            return new ir2.Group(groupElements);
        }
        if (elements.length === 0) {
            reporter.resolver.emptyGroup();
        }
        let callee = elements[0];
        let args = [...elements].splice(1);
        if (callee instanceof ir1.Keyword) {
            let type = callee.token.type;
            if (type === TokenType.CHECK_EXPECT) {
                if (!this.atTopLevel) {
                    reporter.resolver.nonTopLevelTest();
                }
                else if (args.length !== 2) {
                    reporter.resolver.testCaseArityMismatch(args.length);
                }
                else {
                    this.testCases.push([args[0], args[1]]);
                    return;
                }
            }
            else if (type === TokenType.DEFINE) {
                let inFunctionDefinition = this.inFunctionDefinition;
                this.inFunctionDefinition = true;
                let result = this.define(args);
                this.inFunctionDefinition = inFunctionDefinition;
                return result;
            }
            else if (type === TokenType.DEFINE_STRUCT) {
                return this.defineStructure(args);
            }
            else if (type === TokenType.LAMBDA) {
                let enclosing = this.symbolTable;
                this.symbolTable = new SymbolTable(enclosing);
                let result = this.lambdaExpression(args);
                this.symbolTable = enclosing;
                return result;
            }
            else
                throw new UnreachableCode();
        }
        else if (callee instanceof ir1.Identifier) {
            let name = callee.name.lexeme;
            if (name === 'quote') {
                return this.quoted(args);
            }
            let type = this.symbolTable.get(name);
            if (type === undefined) {
                reporter.resolver.undefinedCallee(name);
            }
            else if (type === RacketValueType.FUNCTION) {
                let expected = this.symbolTable.getArity(name);
                let actual = args.length;
                if (expected != actual) {
                    reporter.resolver.functionArityMismatch(name, expected, actual);
                }
            }
            else {
                reporter.resolver.checkCalleeValueType(type, name);
            }
        }
        else {
            reporter.resolver.badCalleeType(callee);
        }
        let evaluatingCallee = this.evaluatingCallee;
        this.evaluatingCallee = true;
        let evaledCallee = this.evaluate(callee);
        this.evaluatingCallee = evaluatingCallee;
        let evaledArgs = args.map(this.evaluate.bind(this));
        return new ir2.Call(evaledCallee, evaledArgs);
    }
    visitIdentifier(expr) {
        let name = expr.name.lexeme;
        let type = this.symbolTable.get(name);
        if (!this.resolvingQuoted) {
            if (type === undefined) {
                reporter.resolver.undefinedIdentifier(name);
            }
            else {
                reporter.resolver.checkIdentifierType(type, this.evaluatingCallee, name);
            }
        }
        return new ir2.Identifier(expr.name);
    }
    visitKeyword(expr) {
        if (expr.token.type === TokenType.CHECK_EXPECT) {
            // return statement for typechecker
            return reporter.resolver.testCaseArityMismatch(0);
        }
        else {
            // return statement for typechecker
            return reporter.resolver.missingOpenParenthesis(expr.token.type.valueOf());
        }
    }
    visitLiteral(expr) {
        return new ir2.Literal(expr.value);
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * Resolving
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    resolveBody(exprs) {
        let statements = [];
        try {
            for (let expr of exprs) {
                let statement = this.evaluate(expr);
                if (statement !== undefined) {
                    statements.push(statement);
                }
            }
        }
        catch (err) {
            if (err instanceof ResolverError) {
                racket.error(err.msg);
            }
            else
                throw err;
        }
        return statements;
    }
    resolveTestCases() {
        this.atTopLevel = false;
        let testCases = [];
        try {
            for (let [actual, expected] of this.testCases) {
                testCases.push(new ir2.TestCase(this.evaluate(actual), this.evaluate(expected)));
            }
        }
        catch (err) {
            if (err instanceof ResolverError) {
                racket.error(err.msg);
            }
            else
                throw err;
        }
        return testCases;
    }
    evaluate(expr) {
        return expr.accept(this);
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * Group Sub-Cases
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    define(exprs) {
        if (!this.atTopLevel) {
            reporter.resolver.nonTopLevelDefinition();
        }
        else if (exprs.length === 0) {
            reporter.resolver.emptyDefine();
        }
        let first = exprs[0];
        if (first instanceof ir1.Group) {
            return this.defineFunction(first, [...exprs].splice(1));
        }
        else {
            return this.defineVariable(exprs);
        }
    }
    defineFunction(nameAndParamList, exprs) {
        if (nameAndParamList.elements.length === 0) {
            reporter.resolver.missingFunctionName();
        }
        let identifier = nameAndParamList.elements[0];
        if (identifier instanceof ir1.Identifier) {
            let paramList = [...nameAndParamList.elements].splice(1);
            if (paramList.length === 0) {
                reporter.resolver.noFunctionParams();
            }
            let enclosing = this.symbolTable;
            this.symbolTable = new SymbolTable(enclosing);
            let paramNames = [];
            for (let param of paramList) {
                if (param instanceof ir1.Identifier) {
                    let paramName = param.name;
                    paramNames.push(paramName);
                    this.symbolTable.define(paramName.lexeme, RacketValueType.VARIABLE);
                }
                else {
                    reporter.resolver.badFunctionParamType(param);
                }
            }
            if (exprs.length === 1) {
                let atTopLevel = this.atTopLevel;
                this.atTopLevel = false;
                let body = this.evaluate(exprs[0]);
                this.atTopLevel = atTopLevel;
                this.symbolTable = enclosing;
                this.symbolTable.define(identifier.name.lexeme, RacketValueType.FUNCTION, paramNames.length);
                return new ir2.DefineVariable(new ir2.Identifier(identifier.name), new ir2.LambdaExpression(paramNames, body));
            }
            else if (exprs.length < 1) {
                // return statement for typechecker
                return reporter.resolver.missingFunctionBody();
            }
            else {
                // return statement for typechecker
                return reporter.resolver.expectedSingleExpressionFunctionBody(exprs.length);
            }
        }
        else {
            // return statement for typechecker
            return reporter.resolver.badFunctionNameType(identifier);
        }
    }
    defineStructure(exprs) {
        if (!this.atTopLevel) {
            reporter.resolver.nonTopLevelStructureDefinition();
        }
        else if (exprs.length === 0) {
            reporter.resolver.missingStructureName();
        }
        let identifier = exprs[0];
        if (identifier instanceof ir1.Identifier) {
            let fieldNames = exprs[1];
            if (fieldNames === undefined) {
                // return statement for typechecker
                return reporter.resolver.missingFieldNames();
            }
            else if (fieldNames instanceof ir1.Group) {
                let names = [];
                for (let fieldName of fieldNames.elements) {
                    if (fieldName instanceof ir1.Identifier) {
                        names.push(fieldName.name.lexeme);
                    }
                    else if (fieldName instanceof ir1.Keyword) {
                        names.push(fieldName.token.type.valueOf());
                    }
                    else {
                        reporter.resolver.badFieldNameType(fieldName);
                    }
                }
                let structName = identifier.name.lexeme;
                if (this.symbolTable.contains(structName)) {
                    reporter.resolver.duplicateName(structName);
                }
                else if (this.symbolTable.contains(structName + '?')) {
                    reporter.resolver.duplicateName(structName + '?');
                }
                else if (this.symbolTable.contains(`make-${structName}`)) {
                    reporter.resolver.duplicateName('make-' + structName);
                }
                for (let fieldName of names) {
                    if (this.symbolTable.contains(`${structName}-${fieldName}`)) {
                        reporter.resolver.duplicateName(`${structName}-${fieldName}`);
                    }
                    else {
                        this.symbolTable.define(`${structName}-${fieldName}`, RacketValueType.FUNCTION, 1);
                    }
                }
                this.symbolTable.define(structName, RacketValueType.STRUCTURE);
                this.symbolTable.define(structName + '?', RacketValueType.FUNCTION, 1);
                this.symbolTable.define(`make-${structName}`, RacketValueType.FUNCTION, names.length);
                return new ir2.DefineStructure(structName, names);
            }
            else {
                // return statement for typechecker
                return reporter.resolver.badFieldNamesType(fieldNames);
            }
        }
        else {
            // return statement for typechecker
            return reporter.resolver.badStructureNameType(identifier);
        }
    }
    defineVariable(exprs) {
        let identifier = exprs[0];
        if (identifier instanceof ir1.Identifier) {
            let name = identifier.name.lexeme;
            if (KEYWORDS.get(name)) {
                reporter.resolver.variableCannotUseKeywordName();
            }
            else if (this.symbolTable.contains(name)) {
                reporter.resolver.duplicateName(name);
            }
            else if (exprs.length === 1) {
                reporter.resolver.missingVariableExpression(name);
            }
            else if (exprs.length > 2) {
                reporter.resolver.expectedSingleExpressionVariableValue(name, exprs.length);
            }
            let atTopLevel = this.atTopLevel;
            this.atTopLevel = false;
            let body = this.evaluate(exprs[1]);
            this.atTopLevel = atTopLevel;
            if (body instanceof ir2.Call
                || body instanceof ir2.Identifier) {
                this.symbolTable.define(name, RacketValueType.VARIABLE);
            }
            else if (body instanceof ir2.LambdaExpression) {
                this.symbolTable.define(name, RacketValueType.FUNCTION, body.names.length);
            }
            else if (body instanceof ir2.Literal) {
                this.symbolTable.define(name, RacketValueType.VARIABLE);
            }
            else
                throw new Error('Unreachable code.');
            return new ir2.DefineVariable(new ir2.Identifier(identifier.name), this.evaluate(exprs[1]));
        }
        else {
            // return statement for typechecker
            return reporter.resolver.badVariableNameType(identifier);
        }
    }
    lambdaExpression(exprs) {
        if (!this.inFunctionDefinition) {
            reporter.resolver.lambdaNotInFunctionDefinition();
        }
        else if (exprs.length === 0) {
            reporter.resolver.missingLambdaParams();
        }
        let paramList = exprs[0];
        let paramNames = [];
        if (paramList instanceof ir1.Group) {
            let params = paramList.elements;
            if (params.length === 0) {
                reporter.resolver.noLambdaParams();
            }
            for (let param of params) {
                if (param instanceof ir1.Identifier) {
                    let paramName = param.name;
                    paramNames.push(paramName);
                    this.symbolTable.define(param.name.lexeme, RacketValueType.PARAMETER);
                }
                else {
                    reporter.resolver.badLambdaParamType(param);
                }
            }
            if (exprs.length === 1) {
                reporter.resolver.missingLambdaBody();
            }
            else if (exprs.length > 2) {
                reporter.resolver.expectedSingleExpressionLambdaBody(exprs.length);
            }
            let atTopLevel = this.atTopLevel;
            this.atTopLevel = false;
            let body = this.evaluate(exprs[1]);
            this.atTopLevel = atTopLevel;
            return new ir2.LambdaExpression(paramNames, body);
        }
        else {
            // return statement for typechecker
            return reporter.resolver.badLambdaParamListType(paramList);
        }
    }
    quoted(exprs) {
        if (exprs.length !== 1) {
            reporter.resolver.quoteArityMismatch();
        }
        let expr = exprs[0];
        if (expr instanceof ir1.Identifier
            || expr instanceof ir1.Keyword
            || expr instanceof ir1.Group) {
            let resolvingQuoted = this.resolvingQuoted;
            this.resolvingQuoted = true;
            let evaledExpr = this.evaluate(expr);
            this.resolvingQuoted = resolvingQuoted;
            if (evaledExpr instanceof ir2.Group) {
                if (evaledExpr.elements.length !== 0) {
                    reporter.resolver.quotedNonEmptyGroup();
                }
            }
            if (evaledExpr instanceof ir2.Group || evaledExpr instanceof ir2.Identifier) {
                return new ir2.Quoted(evaledExpr);
            }
            else
                throw new UnreachableCode();
        }
        else {
            // return statement for typechecker
            return reporter.resolver.badQuotedExpressionType(expr);
        }
    }
}
