import * as ir1 from './ir1.js';
import { KEYWORDS, Token, TokenType } from './tokens.js';
import racket from './racket.js';
import { SExprList, SExprLiteral, SExprSymbol } from './sexpr.js';
import { UnreachableCode } from './errors.js';
/**
 * A parser for transforming tokens into S-expressions.
 */
class TokenParser {
    constructor() {
        this.braceMap = new Map([
            [TokenType.OPEN, TokenType.CLOSE],
            [TokenType.OPEN_BRACE, TokenType.CLOSE_BRACE],
            [TokenType.OPEN_BRACKET, TokenType.CLOSE_BRACKET]
        ]);
        this.openingStack = [];
        this.current = 0;
        this.tokens = [];
    }
    /**
     * Produces an S-expression representation of the tokens.
     * @param tokens the token representation of the code
     */
    parse(tokens) {
        this.current = 0;
        this.tokens = tokens;
        let sexprs = [];
        try {
            while (!this.isAtEnd()) {
                sexprs.push(this.expr());
            }
        }
        catch (err) {
            if (err instanceof TokenParser.TokenParserError) {
                racket.error('read-syntax: ' + err.msg);
            }
            else {
                throw err;
            }
        }
        return sexprs;
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * S-expression Components
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    expr() {
        if (this.match(TokenType.IDENTIFIER, ...KEYWORDS.values())) {
            return this.symbol();
        }
        else if (this.match(TokenType.BOOLEAN, TokenType.NUMBER, TokenType.STRING)) {
            return this.literal();
        }
        else if (this.match(TokenType.OPEN, TokenType.OPEN_BRACE, TokenType.OPEN_BRACKET)) {
            return this.list();
        }
        else if (this.match(TokenType.SINGLE_QUOTE)) {
            return this.quoted();
        }
        else if (this.match(TokenType.CLOSE, TokenType.CLOSE_BRACE, TokenType.CLOSE_BRACKET)) {
            if (this.openingStack.length === 0) {
                this.error(`unexpected \`${this.previous().type}\``);
            }
            else {
                let preceding = this.openingStack[0];
                let expected = this.braceMap.get(preceding);
                let actual = this.previous().type;
                this.error(`expected \`${expected}\` to close preceding \`${preceding}\`, but found instead \`${actual}\``);
            }
        }
        else {
            throw new UnreachableCode();
        }
    }
    list() {
        let opening = this.previous().type;
        this.openingStack.unshift(opening);
        let closing = this.braceMap.get(opening);
        let elements = [];
        while (this.peek().type !== closing) {
            if (this.isAtEnd()) {
                this.error(`expected a \`${closing}\` to close \`${opening}\``);
            }
            elements.push(this.expr());
        }
        this.openingStack.shift();
        this.advance();
        return new SExprList(elements);
    }
    literal() {
        return new SExprLiteral(this.previous());
    }
    quoted() {
        if (this.isAtEnd()) {
            this.error('read-syntax: expected an element for quoting "\'", found end-of-file');
        }
        let elements = [new SExprSymbol(new Token(TokenType.QUOTE, TokenType.QUOTE.valueOf()))];
        elements.push(this.expr());
        return new SExprList(elements);
    }
    symbol() {
        return new SExprSymbol(this.previous());
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * General Parsing Helper Functions
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    advance() {
        if (!this.isAtEnd()) {
            this.current += 1;
        }
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    isAtEnd() {
        return this.peek().type === TokenType.EOF;
    }
    match(...types) {
        for (let type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    peek() {
        return this.tokens[this.current];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * Error Handling
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    error(msg) {
        throw new TokenParser.TokenParserError(msg);
    }
}
TokenParser.TokenParserError = class extends Error {
    constructor(msg) {
        super();
        this.msg = msg;
    }
};
/**
 * A parser for transforming tokens into a slightly more useful intermediate
 * representations.
 */
class Parser {
    constructor() {
        this.tokenParser = new TokenParser();
    }
    /**
     * Produces an Intermediate Representation I representation of the tokens.
     * @param tokens the token representation of the code
     */
    parse(tokens) {
        let sexprs = this.tokenParser.parse(tokens);
        let exprs = [];
        for (let sexpr of sexprs) {
            exprs.push(this.expr(sexpr));
        }
        return exprs;
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * Intermediate Representation I Forms
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    expr(sexpr) {
        if (sexpr instanceof SExprList) {
            return this.group(sexpr);
        }
        else if (sexpr instanceof SExprLiteral) {
            return this.literal(sexpr);
        }
        else if (sexpr instanceof SExprSymbol) {
            return this.symbol(sexpr);
        }
        else {
            throw new UnreachableCode();
        }
    }
    group(sexpr) {
        let elements = sexpr.elements;
        if (elements.length === 0) {
            return new ir1.Group([]);
        }
        return new ir1.Group(elements.map(this.expr.bind(this)));
    }
    literal(sexpr) {
        if (sexpr.token.value === undefined) {
            throw new UnreachableCode();
        }
        ;
        return new ir1.Literal(sexpr.token.value);
    }
    symbol(sexpr) {
        if (Array.from(KEYWORDS.values()).includes(sexpr.token.type)) {
            return new ir1.Keyword(sexpr.token);
        }
        else {
            return new ir1.Identifier(sexpr.token);
        }
    }
}
export default new Parser();
