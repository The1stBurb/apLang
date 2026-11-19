import { Position, Pos } from './ast.js';
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
    /** @param {string} value, @param {TokType} type@param {Position} pos} */
    constructor(value, type, pos){
        /** @type {string} */this.value = value
        /** @type {TokType} */this.type = type;
        /** @type {Position} */this.pos = pos;
    }
};

/**
 * @param {string} value, @param {TokType} type
 * @returns {Token}
 */
function token(value, type, pos){
    return new Token(value, type, pos);
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
    var idx = 0, line = 0;;

    const shift = ()=>{ idx++; if(src[0] == '\n'){ line++; } return src.shift(); };
    const getPos = (len) => Pos(idx - (len ?? 1), idx - 1, line);
    const newTok = (value, tok, len)=>{
        tokens.push(
            token(
                value,
                tok,
                getPos(
                    value.length + (len ?? 0)
                )
            )
        );
    };

    while (src.length > 0){
        const tok = src[0];
        if(tok == '(') newTok(shift(), TokType.lPara);
        else if(tok == ')') newTok( shift(), TokType.rPara );
        else if(tok == '[') newTok( shift(), TokType.lBrack );
        else if(tok == ']') newTok( shift(), TokType.rBrack );
        else if(tok == '{') newTok( shift(), TokType.lBrace );
        else if(tok == '}') newTok( shift(), TokType.rBrace );
        else if(tok == '<') {
            shift();
            if(src[0] == '=') newTok('<' + shift(), TokType.BinOp );
            else { newTok( '<', TokType.lArrow ); }
        }
        else if(tok == '>') {
            shift();
            if(src[0] == '=') newTok('>' + shift(), TokType.BinOp );
            else { newTok( '>', TokType.rArrow ); }
        }

        else if(tok == '-') {
            shift();
            if(src[0] == '>') newTok(tok + shift(), TokType.Arrow );
            else if(src[0] == '=') newTok(tok + shift(), TokType.BinEq );
            else if(isint(src[0])){
                let num = '-';
                while(src.length > 0 && (isint(src[0]) || src[0] =='.')){
                    num += shift();
                }
                newTok( num, TokType.Num );
            }
            else { newTok( tok, TokType.BinOp ); }
        }
        else if(tok == '+') {
            shift();
            if(src[0] == '=') newTok(tok + shift(), TokType.BinEq );
            else { newTok( tok, TokType.BinOp ); }
        }
        else if(tok == '/') {
            shift();
            if(src[0] == '/'){
                while(src.length > 0 && src[0]!= '\n'){
                    shift();
                }
            }
            else if(src[0] == '=') newTok(tok + shift(), TokType.BinEq );
            else { newTok( tok, TokType.BinOp ); }
        }
        else if(tok == '*') {
            shift();
            if(src[0] == '=') newTok(tok + shift(), TokType.BinEq );
            else { newTok( tok, TokType.BinOp ) }
        }
        else if(isBinOp(tok)) newTok( shift(), TokType.BinOp )
        
        else if(tok == '=') {
            shift();
            if(src[0] == '=') newTok('=' + shift(), TokType.BinOp )
            else { newTok( '=', TokType.Eq ) }
        }
        else if(tok == '!') {
            shift();
            if(src[0] == '=') newTok('!' + shift(), TokType.BinOp )
            else { newTok( '!', TokType.Not ) }
        }
        else if(tok == '&') {
            shift();
            if(src[0] == '&') newTok('&' + shift(), TokType.LogicOp )
            else { newTok( '&', TokType.Ampersand ) }
        }
        else if(tok == '|') {
            shift();
            if(src[0] == '|') newTok('|' + shift(), TokType.LogicOp )
            else { newTok( '|', TokType.VertBar ) }
        }
        else if(tok == ';') newTok( shift(), TokType.Semicolon )
        else if(tok == ':') newTok( shift(), TokType.Colon )
        else if(tok == ',') newTok( shift(), TokType.Comma )
        else if(tok == '.') newTok( shift(), TokType.Dot )

        else if(tok == '\''){
            let str = '';
            shift();
            while(src.length > 0 && src[0] != '\''){
                if(src[0] == '\\'){ str += shift(); }
                str += shift();
            }
            shift();
            newTok(str, TokType.Str , 2);
        }else if(tok == '\"'){
            let str = '';
            shift();
            while(src.length > 0 && src[0] != '\"'){
                if(src[0] == '\\'){ str += shift(); }
                str += shift();
            }
            shift();
            newTok(str, TokType.Str, 2 );
        }

        else if(isint(tok)){
            let num = '';
            while(src.length > 0 && (isint(src[0]) || src[0] =='.')){
                num += shift();
            }
            newTok(num, TokType.Num );
        }
        else if(isalpha(tok)){
            let ident = '';
            while(src.length > 0 && ( isalpha(src[0]) || isint(src[0]) || src[0] == '_' )){
                ident += shift();
            }
            const res = KEYWORDS[ident];
            if(res) newTok(ident, res)
            else newTok(ident, TokType.Ident)
        }
        else if(isskippable(tok)) shift();

        else{
            console.error('Unrecgonized char found: \'' + tok + '\'');
        }

    }
    newTok('', TokType.EOF)

    return tokens;
}