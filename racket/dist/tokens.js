/**
 * The type of a token.
 */
export var TokenType;
(function (TokenType) {
    TokenType["OPEN"] = "(";
    TokenType["CLOSE"] = ")";
    TokenType["OPEN_BRACE"] = "{";
    TokenType["CLOSE_BRACE"] = "}";
    TokenType["OPEN_BRACKET"] = "[";
    TokenType["CLOSE_BRACKET"] = "]";
    TokenType["CHECK_EXPECT"] = "check-expect";
    TokenType["DEFINE"] = "define";
    TokenType["DEFINE_STRUCT"] = "define-struct";
    TokenType["LAMBDA"] = "lambda";
    TokenType["QUOTE"] = "quote";
    TokenType["SINGLE_QUOTE"] = "'";
    TokenType["AND"] = "and";
    TokenType["COND"] = "cond";
    TokenType["ELSE"] = "else";
    TokenType["IF"] = "if";
    TokenType["OR"] = "or";
    TokenType["BOOLEAN"] = "BOOLEAN";
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["STRING"] = "STRING";
    TokenType["EOF"] = "EOF";
})(TokenType || (TokenType = {}));
/**
 * A abstract representation of a consecutive sequence of characters.
 */
export class Token {
    constructor(type, lexeme, value = undefined) {
        this.type = type;
        this.lexeme = lexeme;
        this.value = value;
    }
    toString() {
        return `<Token type:${this.type.toString()} lexeme:${this.lexeme}${this.value ? ' value:' + this.value.toString() : ''}>`;
    }
}
export const KEYWORDS = new Map([
    [TokenType.CHECK_EXPECT.valueOf(), TokenType.CHECK_EXPECT],
    [TokenType.DEFINE.valueOf(), TokenType.DEFINE],
    [TokenType.DEFINE_STRUCT.valueOf(), TokenType.DEFINE_STRUCT],
    [TokenType.LAMBDA.valueOf(), TokenType.LAMBDA],
    [TokenType.QUOTE.valueOf(), TokenType.QUOTE],
    [TokenType.AND.valueOf(), TokenType.AND],
    [TokenType.COND.valueOf(), TokenType.COND],
    [TokenType.ELSE.valueOf(), TokenType.ELSE],
    [TokenType.IF.valueOf(), TokenType.IF],
    [TokenType.OR.valueOf(), TokenType.OR],
]);
;
