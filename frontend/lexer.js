/**
 * @param {string[]} items
 * @returns {Object.<string, int>}
 */
function createEnum(...items){
    const obj = {};
    for(let i=0; i<items.length; i++){
        obj[items[i]] = i;
    }
    return Object.freeze(obj);
}

export const TokType = createEnum(
    'Num',
    'Ident',
    'Str',

    'Let',
    'Const',
    'Int',
    'String',
    'List',
    'Func',
    'Ret',

    'For',
    'While',

    'Import',
    
    'If',
    'Elif',
    'Else',
    
    'BinOp', 'BinEq',
    'LogicOp',
    'And', 'Or',
    'Eq', 'EqEq',
    'Not', 'nEq',

    'Comma',
    'Dot',
    'Colon',
    'Semicolon',
    'SQuote',

    'lPara', 'rPara',
    'lBrace', 'rBrace',
    'lBrack', 'rBrack',
    'lArrow', 'rArrow', 'Arrow',
    'lEq', 'gEq',
    'EOF',
    'Ampersand',
    'VertBar',

    'Comment',
);

/** @type {Object.<string, string>} */
const KEYWORDS = {
    let: TokType.Let,
    const: TokType.Const,
    int: TokType.Int,
    string: TokType.String,
    list: TokType.List,
    func: TokType.Func,
    import: TokType.Import,

    for: TokType.For,
    while: TokType.While,

    if: TokType.If,
    elif: TokType.Elif,
    else: TokType.Else,

    and: TokType.And, or: TokType.Or,

    ret: TokType.Ret,
};

export class Token{
    /** @param {string} value, @param {TokType} type */
    constructor(value, type){
        /** @type {string} */this.value = value
        /** @type {TokType} */this.type = type;
    }
};

/**
 * @param {string} value, @param {TokType} type
 * @returns {Token}
 */
function token(value, type){
    return new Token(value, type);
}

function isalpha(src) { return src.toUpperCase() != src.toLowerCase(); }
function isskippable(str) { return str == " " || str == "\n" || str == "\t" || str == "\r"; }
function isBinOp(str){ return str == '+' || str == '-' || str == '*' || str == '/' || str == '%';}
function isint(str) {
	const c = str.charCodeAt(0);
	const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
	return c >= bounds[0] && c <= bounds[1];
}

export function tokenize(sourceCode){
    const tokens = [];
    const src = sourceCode.split("");
    while (src.length > 0){
        const tok = src[0];
        if(tok == '(') tokens.push(token(src.shift(), TokType.lPara));
        else if(tok == ')') tokens.push(token( src.shift(), TokType.rPara ));
        else if(tok == '[') tokens.push(token( src.shift(), TokType.lBrack ));
        else if(tok == ']') tokens.push(token( src.shift(), TokType.rBrack ));
        else if(tok == '{') tokens.push(token( src.shift(), TokType.lBrace ));
        else if(tok == '}') tokens.push(token( src.shift(), TokType.rBrace ));
        else if(tok == '<') {
            src.shift();
            if(src[0] == '=') tokens.push(token('<' + src.shift(), TokType.BinOp ));
            else { tokens.push(token( '<', TokType.lArrow )); }
        }
        else if(tok == '>') {
            src.shift();
            if(src[0] == '=') tokens.push(token('>' + src.shift(), TokType.BinOp ));
            else { tokens.push(token( '>', TokType.rArrow )); }
        }

        else if(tok == '-') {
            src.shift();
            if(src[0] == '>') tokens.push(token(tok + src.shift(), TokType.Arrow ));
            else if(src[0] == '=') tokens.push(token(tok + src.shift(), TokType.BinEq));
            else if(isint(src[0])){
                let num = '';
                while(src.length > 0 && (isint(src[0]) || src[0] =='.')){
                    num += src.shift();
                }
                tokens.push(token(num, TokType.Num ))
            }
            else { tokens.push(token( tok, TokType.BinOp )); }
        }
        else if(tok == '+') {
            src.shift();
            if(src[0] == '=') tokens.push(token(tok + src.shift(), TokType.BinEq));
            else { tokens.push(token( tok, TokType.BinOp )); }
        }
        else if(tok == '/') {
            src.shift();
            if(src[0] == '/'){
                while(src.length > 0 && src[0]!= '\n'){
                    src.shift();
                }
            }
            else if(src[0] == '=') tokens.push(token(tok + src.shift(), TokType.BinEq));
            else { tokens.push(token( tok, TokType.BinOp )); }
        }
        else if(tok == '*') {
            src.shift();
            if(src[0] == '=') tokens.push(token(tok + src.shift(), TokType.BinEq));
            else { tokens.push(token( tok, TokType.BinOp )); }
        }
        else if(isBinOp(tok)) tokens.push(token( src.shift(), TokType.BinOp ));
        
        else if(tok == '=') {
            src.shift();
            if(src[0] == '=') tokens.push(token('=' + src.shift(), TokType.BinOp ));
            else { tokens.push(token( '=', TokType.Eq )); }
        }
        else if(tok == '!') {
            src.shift();
            if(src[0] == '=') tokens.push(token('!' + src.shift(), TokType.BinOp ));
            else { tokens.push(token( '!', TokType.Not )); }
        }
        else if(tok == '&') {
            src.shift();
            if(src[0] == '&') tokens.push(token('&' + src.shift(), TokType.LogicOp ));
            else { tokens.push(token( '&', TokType.Ampersand )); }
        }
        else if(tok == '|') {
            src.shift();
            if(src[0] == '|') tokens.push(token('|' + src.shift(), TokType.LogicOp ));
            else { tokens.push(token( '|', TokType.VertBar )); }
        }
        else if(tok == ';') tokens.push(token( src.shift(), TokType.Semicolon ));
        else if(tok == ':') tokens.push(token( src.shift(), TokType.Colon ));
        else if(tok == ',') tokens.push(token( src.shift(), TokType.Comma ));
        else if(tok == '.') tokens.push(token( src.shift(), TokType.Dot ));

        else if(tok == '\''){
            let str = '';
            src.shift();
            while(src.length > 0 && src[0] != '\''){
                if(src[0] == '\\'){ str += src.shift(); }
                str += src.shift();
            }
            src.shift();
            tokens.push(token(str.replaceAll('\\n', '\n'), TokType.Str ))
        }else if(tok == '\"'){
            let str = '';
            src.shift();
            while(src.length > 0 && src[0] != '\"'){
                if(src[0] == '\\'){ str += src.shift(); }
                str += src.shift();
            }
            src.shift();
            tokens.push(token(str.replaceAll('\\n', '\n'), TokType.Str ))
        }

        else if(isint(tok)){
            let num = '';
            while(src.length > 0 && (isint(src[0]) || src[0] =='.')){
                num += src.shift();
            }
            tokens.push(token(num, TokType.Num ))
        }
        else if(isalpha(tok)){
            let ident = '';
            while(src.length > 0 && ( isalpha(src[0]) || isint(src[0]) || src[0] == '_' )){
                ident += src.shift();
            }
            const res = KEYWORDS[ident];
            if(res) tokens.push(token(ident, res));
            else tokens.push(token(ident, TokType.Ident));
        }
        else if(isskippable(tok)) src.shift();

        else{
            console.error('Unrecgonized char found: \'' + tok + '\'');
        }

    }
    tokens.push(token(0, TokType.EOF));

    return tokens;
}