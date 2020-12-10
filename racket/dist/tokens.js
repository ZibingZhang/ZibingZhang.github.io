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
    TokenType["BOOLEAN"] = "BOOLEAN";
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["QUOTE"] = "QUOTE";
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
    ['check-expect', TokenType.CHECK_EXPECT],
    ['define', TokenType.DEFINE],
    ['define-struct', TokenType.DEFINE_STRUCT],
    ['lambda', TokenType.LAMBDA]
]);
;
