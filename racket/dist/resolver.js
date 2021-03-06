import BUILT_INS from './builtins.js';
import { ResolverError, UnreachableCode } from './errors.js';
import * as ir1 from './ir1.js';
import * as ir2 from './ir2.js';
import racket from './racket.js';
import { reporter } from './reporter.js';
import { RacketValueType, SymbolTable } from './symboltable.js';
import { KEYWORDS, TokenType } from './tokens.js';
import { isCallable, isList, isNumber, isStructure, RACKET_TRUE } from './values.js';
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
            else if (isStructure(value)) {
                this.symbolTable.define(name, RacketValueType.STRUCTURE);
            }
            else {
                throw new UnreachableCode();
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
            if (type === TokenType.AND) {
                let result = this.andExpression(args);
                return result;
            }
            else if (type === TokenType.CHECK_EXPECT) {
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
            else if (type === TokenType.COND) {
                return this.condExpression(args);
            }
            else if (type === TokenType.ELSE) {
                reporter.resolver.elseNotInClause();
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
            else if (type === TokenType.IF) {
                let result = this.ifExpression(args);
                return result;
            }
            if (type === TokenType.OR) {
                let result = this.orExpression(args);
                return result;
            }
            else if (type === TokenType.QUOTE) {
                return this.quoted(args);
            }
            else
                throw new UnreachableCode();
        }
        else if (callee instanceof ir1.Identifier) {
            let name = callee.name.lexeme;
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
        else if (expr.token.type === TokenType.ELSE) {
            // return statement for typechecker
            return reporter.resolver.elseNotInClause();
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
                if (expr instanceof ir1.Identifier) {
                    this.initialIdentifier(expr.name.lexeme);
                }
                else if (expr instanceof ir1.Group && expr.elements.length > 0) {
                    let callee = expr.elements[0];
                    if (callee instanceof ir1.Keyword) {
                        if (callee.token.type === TokenType.DEFINE) {
                            this.initialDefine(expr.elements.slice(1));
                        }
                        else if (callee.token.type === TokenType.DEFINE_STRUCT) {
                            this.initialDefineStructure(expr.elements.slice(1));
                        }
                    }
                    else if (callee instanceof ir1.Identifier) {
                        this.initialCall(callee.name.lexeme);
                    }
                }
            }
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
     * Initial Steps for Top-Level Statements
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    initialCall(name) {
        let type = this.symbolTable.get(name);
        if (type !== undefined) {
            reporter.resolver.checkCalleeValueType(type, name);
        }
    }
    initialDefine(exprs) {
        if (exprs.length === 0) {
            reporter.resolver.emptyDefine();
        }
        let first = exprs[0];
        if (first instanceof ir1.Group) {
            this.initialDefineFunction(first, [...exprs].splice(1));
        }
        else {
            this.initialDefineVariable(exprs);
        }
    }
    initialDefineFunction(nameAndParamList, exprs) {
        if (nameAndParamList.elements.length === 0) {
            reporter.resolver.missingFunctionName();
        }
        let identifier = nameAndParamList.elements[0];
        if (!(identifier instanceof ir1.Identifier)) {
            // return statement for typechecker
            return reporter.resolver.badFunctionNameType(identifier);
        }
        let paramList = nameAndParamList.elements.slice(1);
        if (paramList.length === 0) {
            reporter.resolver.noFunctionParams();
        }
        let names = [];
        this.symbolTable.define(identifier.name.lexeme, RacketValueType.FUNCTION, paramList.length);
        for (let param of paramList) {
            if (!(param instanceof ir1.Identifier)) {
                // return statement for typechecker
                return reporter.resolver.badFunctionParamType(param);
            }
            else if (names.includes(param.name.lexeme)) {
                reporter.resolver.functionDuplicateVariable(param.name.lexeme);
            }
            names.push(param.name.lexeme);
        }
        if (exprs.length < 1) {
            return reporter.resolver.missingFunctionBody();
        }
        else if (exprs.length > 1) {
            return reporter.resolver.expectedSingleExpressionFunctionBody(exprs.length);
        }
    }
    initialDefineStructure(exprs) {
        if (exprs.length === 0) {
            reporter.resolver.missingStructureName();
        }
        let identifier = exprs[0];
        if (!(identifier instanceof ir1.Identifier)) {
            // return statement for typechecker
            return reporter.resolver.badStructureNameType(identifier);
        }
        let fieldNames = exprs[1];
        if (fieldNames === undefined) {
            // return statement for typechecker
            return reporter.resolver.missingFieldNames();
        }
        else if (!(fieldNames instanceof ir1.Group)) {
            // return statement for typechecker
            return reporter.resolver.badFieldNamesType(fieldNames);
        }
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
    }
    initialDefineVariable(exprs) {
        let identifier = exprs[0];
        if (!(identifier instanceof ir1.Identifier)) {
            // return statement for typechecker
            return reporter.resolver.badVariableNameType(identifier);
        }
        let name = identifier.name.lexeme;
        if (KEYWORDS.get(name)) {
            reporter.resolver.variableCannotUseKeywordName();
        }
        else if (exprs.length === 1) {
            reporter.resolver.missingVariableExpression(name);
        }
        else if (exprs.length > 2) {
            reporter.resolver.expectedSingleExpressionVariableValue(name, exprs.length);
        }
        let type = RacketValueType.VARIABLE;
        let arity;
        let body = exprs[1];
        if (body instanceof ir1.Group) {
            if (body.elements.length > 0) {
                let first = body.elements[0];
                if (first instanceof ir1.Keyword && first.token.type === TokenType.LAMBDA) {
                    type = RacketValueType.FUNCTION;
                    arity = this.initialLambdaExpression(body.elements.slice(1));
                }
            }
        }
        if (this.symbolTable.contains(name)) {
            reporter.resolver.duplicateName(name);
        }
        if (type === RacketValueType.VARIABLE) {
            this.symbolTable.define(name, type);
        }
        else if (type === RacketValueType.FUNCTION) {
            this.symbolTable.define(name, type, arity);
        }
        else
            throw new UnreachableCode();
    }
    initialIdentifier(name) {
        let type = this.symbolTable.get(name);
        if (type !== undefined) {
            reporter.resolver.checkIdentifierType(type, this.evaluatingCallee, name);
        }
    }
    initialLambdaExpression(exprs) {
        if (exprs.length === 0) {
            reporter.resolver.missingLambdaParams();
        }
        let paramList = exprs[0];
        if (!(paramList instanceof ir1.Group)) {
            // return statement for typechecker
            return reporter.resolver.badLambdaParamListType(paramList);
        }
        let params = paramList.elements;
        if (params.length === 0) {
            reporter.resolver.noLambdaParams();
        }
        let names = [];
        for (let param of params) {
            if (!(param instanceof ir1.Identifier)) {
                // return statement for typechecker
                return reporter.resolver.badLambdaParamType(param);
            }
            else if (names.includes(param.name.lexeme)) {
                reporter.resolver.lambdaDuplicateVariable(param.name.lexeme);
            }
            names.push(param.name.lexeme);
        }
        if (exprs.length === 1) {
            reporter.resolver.missingLambdaBody();
        }
        else if (exprs.length > 2) {
            reporter.resolver.expectedSingleExpressionLambdaBody(exprs.length);
        }
        return params.length;
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * Group Sub-Cases
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    andExpression(exprs) {
        if (exprs.length < 2) {
            reporter.resolver.andNotEnoughArguments(exprs.length);
        }
        return new ir2.AndExpression(exprs.map(this.evaluate.bind(this)));
    }
    condExpression(exprs) {
        if (exprs.length === 0) {
            reporter.resolver.missingClause();
        }
        let clauses = [];
        exprs.forEach((expr, idx) => {
            if (!(expr instanceof ir1.Group)) {
                reporter.resolver.expectedClause(expr);
            }
            else if (expr.elements.length != 2) {
                reporter.resolver.clauseArityMismatch(expr.elements.length);
            }
            else {
                let question = expr.elements[0];
                let answer = expr.elements[1];
                if (question instanceof ir1.Keyword && question.token.type === TokenType.ELSE) {
                    if (idx !== exprs.length - 1) {
                        reporter.resolver.elseNotInClause();
                    }
                    else {
                        clauses.push([new ir2.Literal(RACKET_TRUE), this.evaluate(answer)]);
                    }
                }
                else {
                    clauses.push([this.evaluate(question), this.evaluate(answer)]);
                }
            }
        });
        return new ir2.CondExpression(clauses);
    }
    define(exprs) {
        if (!this.atTopLevel) {
            reporter.resolver.nonTopLevelDefinition();
        }
        let first = exprs[0];
        if (first instanceof ir1.Group) {
            return this.defineFunction(first, exprs.splice(1));
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
        if (!(identifier instanceof ir1.Identifier)) {
            throw new UnreachableCode();
        }
        let paramList = [...nameAndParamList.elements].splice(1);
        this.symbolTable.define(identifier.name.lexeme, RacketValueType.FUNCTION, paramList.length);
        let enclosing = this.symbolTable;
        this.symbolTable = new SymbolTable(enclosing);
        let paramNames = [];
        for (let param of paramList) {
            if (!(param instanceof ir1.Identifier)) {
                throw new UnreachableCode();
            }
            let paramName = param.name;
            paramNames.push(paramName);
            this.symbolTable.define(paramName.lexeme, RacketValueType.VARIABLE);
        }
        let atTopLevel = this.atTopLevel;
        this.atTopLevel = false;
        let body = this.evaluate(exprs[0]);
        this.atTopLevel = atTopLevel;
        this.symbolTable = enclosing;
        return new ir2.DefineVariable(new ir2.Identifier(identifier.name), new ir2.LambdaExpression(paramNames, body));
    }
    defineStructure(exprs) {
        if (!this.atTopLevel) {
            reporter.resolver.nonTopLevelStructureDefinition();
        }
        let identifier = exprs[0];
        if (!(identifier instanceof ir1.Identifier)) {
            throw new UnreachableCode();
        }
        let fieldNames = exprs[1];
        if (!(fieldNames instanceof ir1.Group)) {
            throw new UnreachableCode();
        }
        let names = [];
        for (let fieldName of fieldNames.elements) {
            if (fieldName instanceof ir1.Identifier) {
                names.push(fieldName.name.lexeme);
            }
            else if (fieldName instanceof ir1.Keyword) {
                names.push(fieldName.token.type.valueOf());
            }
            else {
                throw new UnreachableCode();
            }
        }
        let structName = identifier.name.lexeme;
        return new ir2.DefineStructure(structName, names);
    }
    defineVariable(exprs) {
        let identifier = exprs[0];
        if (!(identifier instanceof ir1.Identifier)) {
            throw new UnreachableCode();
        }
        let atTopLevel = this.atTopLevel;
        this.atTopLevel = false;
        this.atTopLevel = atTopLevel;
        return new ir2.DefineVariable(new ir2.Identifier(identifier.name), this.evaluate(exprs[1]));
    }
    ifExpression(exprs) {
        if (exprs.length != 3) {
            reporter.resolver.ifArityMismatch(exprs.length);
        }
        let predicate = this.evaluate(exprs[0]);
        let ifTrue = this.evaluate(exprs[1]);
        let ifFalse = this.evaluate(exprs[2]);
        return new ir2.IfExpression(predicate, ifTrue, ifFalse);
    }
    lambdaExpression(exprs) {
        if (!this.inFunctionDefinition) {
            reporter.resolver.lambdaNotInFunctionDefinition();
        }
        let paramList = exprs[0];
        let paramNames = [];
        if (!(paramList instanceof ir1.Group)) {
            throw new UnreachableCode();
        }
        let params = paramList.elements;
        for (let param of params) {
            if (!(param instanceof ir1.Identifier)) {
                throw new UnreachableCode();
            }
            let paramName = param.name;
            paramNames.push(paramName);
            this.symbolTable.define(param.name.lexeme, RacketValueType.PARAMETER);
        }
        let atTopLevel = this.atTopLevel;
        this.atTopLevel = false;
        let body = this.evaluate(exprs[1]);
        this.atTopLevel = atTopLevel;
        return new ir2.LambdaExpression(paramNames, body);
    }
    orExpression(exprs) {
        if (exprs.length < 2) {
            reporter.resolver.andNotEnoughArguments(exprs.length);
        }
        return new ir2.OrExpression(exprs.map(this.evaluate.bind(this)));
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
