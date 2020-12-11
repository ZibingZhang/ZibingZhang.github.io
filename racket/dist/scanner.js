import { UnreachableCode } from './errors.js';
import { RacketComplexNumber, RacketExactNumber, RacketInexactFloat, RacketString, RACKET_FALSE, RACKET_TRUE } from './values.js';
import { KEYWORDS, Token, TokenType } from './tokens.js';
import racket from './racket.js';
var State;
(function (State) {
    // Miscellaneous
    State[State["TOP"] = 0] = "TOP";
    State[State["POUND"] = 1] = "POUND";
    // Numbers
    State[State["SIGNED_NUMERATOR"] = 2] = "SIGNED_NUMERATOR";
    State[State["SIGNED_DENOMINATOR"] = 3] = "SIGNED_DENOMINATOR";
    State[State["SIGNED_DECIMAL"] = 4] = "SIGNED_DECIMAL";
    State[State["REAL_NUMERATOR"] = 5] = "REAL_NUMERATOR";
    State[State["REAL_DENOMINATOR"] = 6] = "REAL_DENOMINATOR";
    State[State["REAL_DECIMAL"] = 7] = "REAL_DECIMAL";
    State[State["IMAGINARY_NUMERATOR"] = 8] = "IMAGINARY_NUMERATOR";
    State[State["IMAGINARY_DENOMINATOR"] = 9] = "IMAGINARY_DENOMINATOR";
    State[State["IMAGINARY_DECIMAL"] = 10] = "IMAGINARY_DECIMAL";
    State[State["COMPLEX_END"] = 11] = "COMPLEX_END";
    // Strings
    State[State["STRING"] = 12] = "STRING";
    State[State["ESCAPED_CHAR"] = 13] = "ESCAPED_CHAR";
    // Name
    State[State["NAME"] = 14] = "NAME";
    // Comments
    State[State["LINE_COMMENT"] = 15] = "LINE_COMMENT";
    State[State["BLOCK_COMMENT"] = 16] = "BLOCK_COMMENT";
    State[State["MAYBE_END_BLOCK_COMMENT"] = 17] = "MAYBE_END_BLOCK_COMMENT";
})(State || (State = {}));
var NumberType;
(function (NumberType) {
    NumberType[NumberType["INTEGER"] = 0] = "INTEGER";
    NumberType[NumberType["FRACTION"] = 1] = "FRACTION";
    NumberType[NumberType["DECIMAL"] = 2] = "DECIMAL";
})(NumberType || (NumberType = {}));
/**
 * A scanner for transforming text into tokens.
 */
class Scanner {
    constructor() {
        this.escapedChars = new Map([
            ['a', '\a'],
            ['b', '\b'],
            ['e', '\e'],
            ['f', '\f'],
            ['n', '\n'],
            ['r', '\r'],
            ['t', '\t'],
            ['v', '\v'],
            ['\\', '\\'],
            ["'", '\''],
            ['"', '\"']
        ]);
        this.singleCharTokens = new Map([
            ['(', TokenType.OPEN],
            [')', TokenType.CLOSE],
            ['{', TokenType.OPEN_BRACE],
            ['}', TokenType.CLOSE_BRACE],
            ['[', TokenType.OPEN_BRACKET],
            [']', TokenType.CLOSE_BRACKET],
            ["'", TokenType.SINGLE_QUOTE]
        ]);
    }
    /**
     * Produces a tokenized representation of the text.
     * @param text the text which the tokens will represent
     */
    scan(text) {
        let groups = text.split(/(\s+|\(|\)|\[|\]|\{|\}|')/);
        let lexeme = '';
        let tokens = [];
        let signedNumerator = '';
        let signedDenominator = '';
        let signedDecimal = '';
        let signedType = NumberType.INTEGER;
        let realNumerator = '';
        let realDenominator = '';
        let realDecimal = '';
        let realType = NumberType.INTEGER;
        let imaginaryNumerator = '';
        let imaginaryDenominator = '';
        let imaginaryDecimal = '';
        let imaginaryType = NumberType.INTEGER;
        let state = State.TOP;
        for (let group of groups) {
            switch (true) {
                case state === State.LINE_COMMENT:
                case state === State.BLOCK_COMMENT:
                case state === State.MAYBE_END_BLOCK_COMMENT: {
                    break;
                }
                default: {
                    state = State.TOP;
                }
            }
            try {
                for (let char of group) {
                    switch (true) {
                        /* STATE  = TOP */
                        // LEXEME = .+
                        case state === State.TOP: {
                            lexeme = char;
                            switch (true) {
                                case /\s/.test(char): {
                                    this.nextLexeme();
                                }
                                case this.singleCharTokens.has(char): {
                                    // @ts-ignore
                                    tokens.push(new Token(this.singleCharTokens.get(char), char));
                                    break;
                                }
                                case char === '#': {
                                    state = State.POUND;
                                    break;
                                }
                                case !isNaN(+char): {
                                    state = State.REAL_NUMERATOR;
                                    realType = NumberType.INTEGER;
                                    realNumerator = char;
                                    break;
                                }
                                case char === '+':
                                case char === '-': {
                                    state = State.SIGNED_NUMERATOR;
                                    signedType = NumberType.INTEGER;
                                    realType = NumberType.INTEGER;
                                    realNumerator = '';
                                    signedNumerator = char;
                                    break;
                                }
                                case char === '.': {
                                    state = State.REAL_DECIMAL;
                                    realType = NumberType.DECIMAL;
                                    realNumerator = '';
                                    realDecimal = '';
                                    break;
                                }
                                case char === '"': {
                                    state = State.STRING;
                                    break;
                                }
                                case char === ';': {
                                    state = State.LINE_COMMENT;
                                    break;
                                }
                                default: {
                                    state = State.NAME;
                                }
                            }
                            break;
                        }
                        /* STATE  = POUND */
                        // LEXEME = #.*
                        case state === State.POUND: {
                            lexeme += char;
                            switch (true) {
                                // LEXEME = #t.*
                                case char === 't': {
                                    if (['#t', '#true'].includes(group)) {
                                        tokens.push(new Token(TokenType.BOOLEAN, group, RACKET_TRUE));
                                        this.nextLexeme();
                                    }
                                    else {
                                        this.error(`bad syntax \`${group.substring(0, 3)}\``);
                                    }
                                }
                                // LEXEME = #f.*
                                case char === 'f': {
                                    if (['#f', '#false'].includes(group)) {
                                        tokens.push(new Token(TokenType.BOOLEAN, group, RACKET_FALSE));
                                        this.nextLexeme();
                                    }
                                    else {
                                        this.error(`bad syntax \`${group.substring(0, 3)}\``);
                                    }
                                }
                                // LEXEME = #|.*
                                case char === '|': {
                                    state = State.BLOCK_COMMENT;
                                    break;
                                }
                                // LEXEME = #(?!t|f).*
                                default: {
                                    this.error(`bad syntax \`${group.substring(0, 2)}\``);
                                }
                            }
                            break;
                        }
                        /* STATE  = SIGNED NUMERATOR */
                        // LEXEME = [+|-].*
                        case state === State.SIGNED_NUMERATOR: {
                            switch (true) {
                                case !isNaN(+char): {
                                    lexeme += char;
                                    signedNumerator += char;
                                    break;
                                }
                                case char === '/': {
                                    lexeme += char;
                                    if (signedNumerator === '') {
                                        state = State.NAME;
                                    }
                                    else {
                                        state = State.SIGNED_DENOMINATOR;
                                        signedType = NumberType.FRACTION;
                                        signedDenominator = '';
                                    }
                                    break;
                                }
                                case char === '.': {
                                    state = State.SIGNED_DECIMAL;
                                    lexeme += char;
                                    signedType = NumberType.DECIMAL;
                                    signedDecimal = '';
                                    break;
                                }
                                case char === 'i':
                                    state = State.COMPLEX_END;
                                    lexeme += char;
                                    signedNumerator = signedNumerator;
                                    signedType = signedType;
                                    break;
                                case char === '"':
                                    state = State.STRING;
                                    tokens.push(this.makeInteger(lexeme, signedNumerator));
                                    lexeme = char;
                                    break;
                                default: {
                                    state = State.NAME;
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = SIGNED DENOMINATOR */
                        // LEXEME = [+|-]\d+/.*
                        case state === State.SIGNED_DENOMINATOR: {
                            switch (true) {
                                case !isNaN(+char): {
                                    lexeme += char;
                                    signedDenominator += char;
                                    break;
                                }
                                case char === 'i':
                                    lexeme += char;
                                    if (signedDenominator === '') {
                                        state = State.NAME;
                                    }
                                    else {
                                        state = State.COMPLEX_END;
                                        imaginaryNumerator = signedNumerator;
                                        imaginaryDenominator = signedDenominator;
                                        imaginaryType = signedType;
                                    }
                                    break;
                                case char === '"':
                                    state = State.STRING;
                                    if (signedDenominator === '') {
                                        tokens.push(this.makeName(lexeme));
                                    }
                                    else {
                                        tokens.push(this.makeFraction(lexeme, signedNumerator, signedDenominator));
                                    }
                                    lexeme = char;
                                    break;
                                default: {
                                    state = State.NAME;
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = SIGNED DECIMAL */
                        // LEXEME = [+|-]\d*/.*
                        case state === State.SIGNED_DECIMAL: {
                            switch (true) {
                                case !isNaN(+char): {
                                    lexeme += char;
                                    signedDecimal += char;
                                    break;
                                }
                                case char === 'i':
                                    lexeme += char;
                                    if (signedDenominator === '') {
                                        state = State.NAME;
                                    }
                                    else {
                                        state = State.COMPLEX_END;
                                        imaginaryNumerator = signedNumerator;
                                        imaginaryDenominator = signedDenominator;
                                        imaginaryType = signedType;
                                    }
                                    break;
                                case char === '"':
                                    state = State.STRING;
                                    if (signedDenominator === '') {
                                        tokens.push(this.makeName(lexeme));
                                    }
                                    else {
                                        tokens.push(this.makeDecimal(lexeme, signedNumerator, signedDecimal));
                                    }
                                    lexeme = char;
                                    break;
                                default: {
                                    state = State.NAME;
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = REAL NUMERATOR */
                        // LEXEME = \d.*
                        case state === State.REAL_NUMERATOR: {
                            switch (true) {
                                case !isNaN(+char): {
                                    lexeme += char;
                                    realNumerator += char;
                                    break;
                                }
                                case char === '/': {
                                    state = State.REAL_DENOMINATOR;
                                    lexeme += char;
                                    realType = NumberType.FRACTION;
                                    realDenominator = '';
                                    break;
                                }
                                case char === '.': {
                                    state = State.REAL_DECIMAL;
                                    lexeme += char;
                                    realType = NumberType.DECIMAL;
                                    realDecimal = '';
                                    break;
                                }
                                case char === '+':
                                case char === '-': {
                                    state = State.IMAGINARY_NUMERATOR;
                                    imaginaryType = NumberType.INTEGER;
                                    lexeme += char;
                                    imaginaryNumerator = char;
                                    break;
                                }
                                case char === '"':
                                    state = State.STRING;
                                    tokens.push(this.makeInteger(lexeme, realNumerator));
                                    lexeme = char;
                                    break;
                                default: {
                                    state = State.NAME;
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = REAL DENOMINATOR */
                        // LEXEME = \d*/.*
                        case state === State.REAL_DENOMINATOR: {
                            switch (true) {
                                case !isNaN(+char): {
                                    lexeme += char;
                                    realDenominator += char;
                                    break;
                                }
                                case char === '+':
                                case char === '-': {
                                    state = State.IMAGINARY_NUMERATOR;
                                    lexeme += char;
                                    imaginaryNumerator = char;
                                    break;
                                }
                                case char === '"':
                                    state = State.STRING;
                                    if (realDenominator === '') {
                                        tokens.push(this.makeName(lexeme));
                                    }
                                    else {
                                        tokens.push(this.makeFraction(lexeme, realNumerator, realDenominator));
                                    }
                                    lexeme = char;
                                    break;
                                default: {
                                    state = State.NAME;
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = REAL DECIMAL */
                        // LEXEME = \d+\..*
                        case state === State.REAL_DECIMAL: {
                            switch (true) {
                                case !isNaN(+char): {
                                    lexeme += char;
                                    realDecimal += char;
                                    break;
                                }
                                case char === '+':
                                case char === '-': {
                                    state = State.IMAGINARY_NUMERATOR;
                                    lexeme += char;
                                    imaginaryNumerator = char;
                                    break;
                                }
                                case char === '"':
                                    state = State.STRING;
                                    if (realDecimal === '') {
                                        tokens.push(this.makeName(lexeme));
                                    }
                                    else {
                                        tokens.push(this.makeDecimal(lexeme, realNumerator, realDecimal));
                                    }
                                    lexeme = char;
                                    break;
                                default: {
                                    state = State.NAME;
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = IMAGINARY NUMERATOR */
                        // LEXEME = .*[+|-].*
                        case state === State.IMAGINARY_NUMERATOR: {
                            switch (true) {
                                case !isNaN(+char): {
                                    lexeme += char;
                                    imaginaryNumerator += char;
                                    break;
                                }
                                case char === '/': {
                                    lexeme += char;
                                    if (imaginaryNumerator.length === 1) {
                                        state = State.NAME;
                                    }
                                    else {
                                        state = State.IMAGINARY_DENOMINATOR;
                                        imaginaryType = NumberType.FRACTION;
                                        imaginaryDenominator = '';
                                    }
                                    break;
                                }
                                case char === '.': {
                                    state = State.IMAGINARY_DECIMAL;
                                    lexeme += char;
                                    imaginaryType = NumberType.DECIMAL;
                                    imaginaryDecimal = '';
                                    break;
                                }
                                case char === 'i':
                                    state = State.COMPLEX_END;
                                    lexeme += char;
                                    break;
                                case char === '"':
                                    state = State.STRING;
                                    tokens.push(this.makeComplex(lexeme, realType, realNumerator, realType === NumberType.DECIMAL ? realDecimal : realDenominator, imaginaryType, imaginaryNumerator, ''));
                                    lexeme = char;
                                    break;
                                default: {
                                    state = State.NAME;
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = IMAGINARY DENOMINATOR */
                        // LEXEME = .*[+|-].*/.*
                        case state === State.IMAGINARY_DENOMINATOR: {
                            switch (true) {
                                case !isNaN(+char): {
                                    lexeme += char;
                                    imaginaryDenominator += char;
                                    break;
                                }
                                case char === 'i':
                                    state = State.COMPLEX_END;
                                    lexeme += char;
                                    break;
                                case char === '"':
                                    state = State.STRING;
                                    tokens.push(this.makeComplex(lexeme, realType, realNumerator, realType === NumberType.DECIMAL ? realDecimal : realDenominator, imaginaryType, imaginaryNumerator, imaginaryType === NumberType.DECIMAL ? imaginaryDecimal : imaginaryDenominator));
                                    lexeme = char;
                                    break;
                                default: {
                                    state = State.NAME;
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = IMAGINARY DECIMAL */
                        // LEXEME = .*[+|-].*\..*
                        case state === State.IMAGINARY_DECIMAL: {
                            switch (true) {
                                case !isNaN(+char): {
                                    lexeme += char;
                                    imaginaryDecimal += char;
                                    break;
                                }
                                case char === 'i':
                                    lexeme += char;
                                    if (imaginaryNumerator === '' && imaginaryDecimal === '') {
                                        state = State.NAME;
                                    }
                                    else {
                                        state = State.COMPLEX_END;
                                    }
                                    break;
                                case char === '"':
                                    state = State.STRING;
                                    tokens.push(this.makeComplex(lexeme, realType, realNumerator, realType === NumberType.DECIMAL ? realDecimal : realDenominator, imaginaryType, imaginaryNumerator, imaginaryType === NumberType.DECIMAL ? imaginaryDecimal : imaginaryDenominator));
                                    lexeme = char;
                                    break;
                                default: {
                                    state = State.NAME;
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = COMPLEX END */
                        // LEXEME = .*i.*
                        case state === State.COMPLEX_END: {
                            switch (true) {
                                case char === '"': {
                                    state = State.STRING;
                                    tokens.push(this.makeComplex(lexeme, realType, realNumerator, realType === NumberType.DECIMAL ? realDecimal : realDenominator, imaginaryType, imaginaryNumerator, imaginaryType === NumberType.DECIMAL ? imaginaryDecimal : imaginaryDenominator));
                                    lexeme = char;
                                    break;
                                }
                                default: {
                                    state = State.NAME;
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = STRING */
                        // LEXEME = ".*
                        case state === State.STRING: {
                            switch (true) {
                                case char === '\\': {
                                    state = State.ESCAPED_CHAR;
                                    break;
                                }
                                case char === '"':
                                    state = State.TOP;
                                    lexeme += char;
                                    tokens.push(new Token(TokenType.STRING, lexeme, new RacketString(lexeme.slice(1, -1))));
                                    break;
                                default: {
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = ESCAPED_CHAR */
                        // LEXEME = ".*\\.*
                        case state === State.ESCAPED_CHAR: {
                            switch (true) {
                                case this.escapedChars.has(char): {
                                    state = State.STRING;
                                    lexeme += this.escapedChars.get(char);
                                    break;
                                }
                                default: {
                                    this.error(`unknown escape sequence \`\\${char}\` in string`);
                                }
                            }
                            break;
                        }
                        /* STATE  = NAME */
                        case state === State.NAME: {
                            switch (true) {
                                case char === '"': {
                                    state = State.STRING;
                                    if (KEYWORDS.has(lexeme)) {
                                        // @ts-ignore
                                        tokens.push(new Token(KEYWORDS.get(lexeme), lexeme));
                                    }
                                    else {
                                        tokens.push(new Token(TokenType.IDENTIFIER, lexeme));
                                    }
                                    lexeme = char;
                                    break;
                                }
                                default: {
                                    lexeme += char;
                                }
                            }
                            break;
                        }
                        /* STATE  = LINE COMMENT */
                        // LEXEME = ;.*
                        case state === State.LINE_COMMENT: {
                            switch (true) {
                                case /\n/.test(char): {
                                    state = State.TOP;
                                    this.nextLexeme();
                                }
                            }
                            break;
                        }
                        /* STATE  = BLOCK COMMENT */
                        // LEXEME = #|.*
                        case state === State.BLOCK_COMMENT: {
                            switch (true) {
                                case char === '|': {
                                    state = State.MAYBE_END_BLOCK_COMMENT;
                                    break;
                                }
                            }
                            break;
                        }
                        /* STATE  = MAYBE END BLOCK COMMENT */
                        // LEXEME = #|.*|.*
                        case state === State.MAYBE_END_BLOCK_COMMENT: {
                            switch (true) {
                                case char === '#': {
                                    state = State.TOP;
                                    lexeme = '';
                                    break;
                                }
                                default: {
                                    state = State.BLOCK_COMMENT;
                                }
                            }
                            break;
                        }
                        default: {
                            throw new UnreachableCode();
                        }
                    }
                }
                if (state === State.REAL_DENOMINATOR) {
                    if (realDenominator === '') {
                        // LEXEME = \d+/
                        state = State.NAME;
                    }
                }
                else if (state === State.REAL_DECIMAL) {
                    if (realNumerator === '') {
                        if (realDecimal === '') {
                            // LEXEME = .
                            this.error('illegal use of `.`');
                        }
                    }
                }
                else if (state === State.SIGNED_NUMERATOR) {
                    if (signedNumerator.length === 1) {
                        state = State.NAME;
                    }
                }
                switch (true) {
                    case state === State.TOP: {
                        break;
                    }
                    case state === State.POUND: {
                        this.error('bad syntax: `#`');
                    }
                    case state === State.SIGNED_NUMERATOR: {
                        tokens.push(this.makeInteger(lexeme, signedNumerator));
                        break;
                    }
                    case state === State.SIGNED_DENOMINATOR: {
                        tokens.push(this.makeFraction(lexeme, signedNumerator, signedDenominator));
                        break;
                    }
                    case state === State.SIGNED_DECIMAL: {
                        if (signedNumerator.length === 1) {
                            tokens.push(this.makeDecimal(lexeme, '', signedDecimal));
                        }
                        else {
                            tokens.push(this.makeDecimal(lexeme, signedNumerator, signedDecimal));
                        }
                        break;
                    }
                    case state === State.REAL_NUMERATOR: {
                        tokens.push(this.makeInteger(lexeme, realNumerator));
                        break;
                    }
                    case state === State.REAL_DENOMINATOR: {
                        tokens.push(this.makeFraction(lexeme, realNumerator, realDenominator));
                        break;
                    }
                    case state === State.REAL_DECIMAL: {
                        tokens.push(this.makeDecimal(lexeme, realNumerator, realDecimal));
                        break;
                    }
                    case state === State.COMPLEX_END: {
                        tokens.push(this.makeComplex(lexeme, realType, realNumerator, realType === NumberType.DECIMAL ? realDecimal : realDenominator, imaginaryType, imaginaryNumerator, imaginaryType === NumberType.DECIMAL ? imaginaryDecimal : imaginaryDenominator));
                        break;
                    }
                    case state === State.STRING:
                    case state === State.ESCAPED_CHAR: {
                        this.error('expected a closing `"`');
                    }
                    case state === State.IMAGINARY_NUMERATOR:
                    case state === State.IMAGINARY_DENOMINATOR:
                    case state === State.IMAGINARY_DECIMAL:
                    case state === State.NAME: {
                        tokens.push(this.makeName(lexeme));
                        break;
                    }
                    case state === State.LINE_COMMENT:
                    case state === State.BLOCK_COMMENT:
                    case state === State.MAYBE_END_BLOCK_COMMENT: {
                        break;
                    }
                    default: {
                        throw new UnreachableCode();
                    }
                }
            }
            catch (err) {
                if (err instanceof Scanner.ScannerError) {
                    racket.error(err.msg);
                    return [];
                }
                else if (!(err instanceof Scanner.NextLexeme)) {
                    throw err;
                }
            }
        }
        tokens.push(new Token(TokenType.EOF, ''));
        return tokens;
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * Constructing Tokens
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    makeDecimal(lexeme, numeratorStr, decimalStr) {
        let numerator = BigInt(numeratorStr);
        if (numerator < 0n) {
            numerator = (10n ** BigInt(decimalStr.length)) * BigInt(numeratorStr) - BigInt(decimalStr);
        }
        else {
            numerator = (10n ** BigInt(decimalStr.length)) * BigInt(numeratorStr) + BigInt(decimalStr);
        }
        let denominator = 10n ** BigInt(decimalStr.length);
        let value = new RacketExactNumber(numerator, denominator);
        return new Token(TokenType.NUMBER, lexeme, value);
    }
    makeComplex(lexeme, realType, realNumerator, realPart, imaginaryType, imaginaryNumerator, imaginaryPart) {
        let real = this.makeReal(realType, realNumerator, realPart);
        let imaginary = this.makeReal(imaginaryType, imaginaryNumerator, imaginaryPart);
        if (imaginary.isZero()) {
            return new Token(TokenType.NUMBER, lexeme, real);
        }
        else {
            let complex = new RacketComplexNumber(real, imaginary);
            return new Token(TokenType.NUMBER, lexeme, complex);
        }
    }
    makeFraction(lexeme, numeratorStr, denominatorStr) {
        let numerator = BigInt(numeratorStr);
        let denominator = BigInt(denominatorStr);
        if (denominator === 0n) {
            this.error(`division by zero in \`${numerator}/${denominator}\``);
        }
        let value = new RacketExactNumber(numerator, denominator);
        return new Token(TokenType.NUMBER, lexeme, value);
    }
    makeInteger(lexeme, integerStr) {
        return this.makeFraction(lexeme, integerStr, '1');
    }
    makeName(lexeme) {
        if (lexeme === '+NaN.0')
            return new Token(TokenType.NUMBER, lexeme, new RacketInexactFloat(NaN));
        if (lexeme === '-NaN.0')
            return new Token(TokenType.NUMBER, lexeme, new RacketInexactFloat(NaN));
        if (lexeme === '+NaN.f')
            return new Token(TokenType.NUMBER, lexeme, new RacketInexactFloat(NaN));
        if (lexeme === '-NaN.f')
            return new Token(TokenType.NUMBER, lexeme, new RacketInexactFloat(NaN));
        if (lexeme === '+inf.0')
            return new Token(TokenType.NUMBER, lexeme, new RacketInexactFloat(Infinity));
        if (lexeme === '-inf.0')
            return new Token(TokenType.NUMBER, lexeme, new RacketInexactFloat(-Infinity));
        if (lexeme === '+inf.f')
            return new Token(TokenType.NUMBER, lexeme, new RacketInexactFloat(+Infinity));
        if (lexeme === '-inf.f')
            return new Token(TokenType.NUMBER, lexeme, new RacketInexactFloat(-Infinity));
        if (KEYWORDS.has(lexeme)) {
            // @ts-ignore
            return new Token(KEYWORDS.get(lexeme), lexeme);
        }
        else if (lexeme === 'true') {
            return new Token(TokenType.BOOLEAN, lexeme, RACKET_TRUE);
        }
        else if (lexeme === 'false') {
            return new Token(TokenType.BOOLEAN, lexeme, RACKET_FALSE);
        }
        else {
            return new Token(TokenType.IDENTIFIER, lexeme);
        }
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * Constructing Values
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    makeReal(realType, realNumerator, realPart) {
        if (realType === NumberType.INTEGER) {
            return new RacketExactNumber(BigInt(realNumerator), 1n);
        }
        else if (realType === NumberType.DECIMAL) {
            let numerator = (10n ** BigInt(realPart.length)) * BigInt(realNumerator) + BigInt(realPart);
            let denominator = 10n ** BigInt(realPart.length);
            return new RacketExactNumber(numerator, denominator);
        }
        else if (realType === NumberType.FRACTION) {
            let numerator = BigInt(realNumerator);
            let denominator = BigInt(realPart);
            if (denominator === 0n) {
                this.error(`division by zero in \`${numerator}/${denominator}\``);
            }
            return new RacketExactNumber(numerator, denominator);
        }
        else {
            throw new UnreachableCode();
        }
    }
    /* -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
     * Error Reporting
     * -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - */
    error(msg) {
        throw new Scanner.ScannerError(`read-syntax: ${msg}`);
    }
    nextLexeme() {
        throw new Scanner.NextLexeme();
    }
}
Scanner.ScannerError = class extends Error {
    constructor(msg) {
        super();
        this.msg = msg;
    }
};
Scanner.NextLexeme = class extends Error {
};
export default new Scanner();
