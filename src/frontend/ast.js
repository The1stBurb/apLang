import util from 'node:util';


export class Stmt{
    constructor(kind){
        /** @type {string} */ this.kind = kind;
    }
};
export class Program extends Stmt{
    /** @param {Stmt[]} body */
    constructor(body){
        super("Program");

        /** @type {Stmt[]} */ this.body = body;
    }
};


//-------------------------------------//


export class VarDecl extends Stmt{
    /** @param {bool} const_ @param {string} ident @param {Expr?} value */
    constructor(const_, ident, value){
        super('VarDecl');

        /** @type {bool} */ this.const = const_;
        /** @type {string} */ this.ident = ident;
        /** @type {Expr?} */ this.value = value;
    }
    
    [util.inspect.custom](depth, options, inspect) { return `VD[ ${this.const ? 'const ' : ''}${this.ident} = ${inspect(this.value, options)} ]`; }
};

export class VarDeclMult extends Stmt{
    /** @param {VarDecl[]} decls */
    constructor(decls){
        super('VarDeclMult');

        /** @type {VarDecl[]} */ this.decls = decls;
    }
    
    [util.inspect.custom](depth, options, inspect) { return `VDM${inspect(this.decls, options)}`; }
};

export class ArrowFuncDecl extends Stmt{
    /** @param {string} name, @param {string[]} para, @param {Stmt} body*/constructor(name, para, body){
        super('ArrowFuncDecl');

        /** @type {string} */this.name = name;
        /** @type {string[]} */this.para = para;
        /** @type {Stmt} */this.body = body;
    }
};

export class FuncDecl extends Stmt{
    /** @param {string} name, @param {string[]} para, @param {Stmt[]} body*/constructor(name, para, body){
        super('FuncDecl');

        /** @type {string} */this.name = name;
        /** @type {string[]} */this.para = para;
        /** @type {Stmt[]} */this.body = body;
    }
};


//-------------------------------------//


export class Expr extends Stmt{};

export class AssignExpr extends Expr{
    /** @param {Expr} assigne, @param {Expr} val*/ constructor(assigne, val){
        super('AssignExpr');
        
        /** @type {Expr} */this.assigne = assigne;
        /** @type {Expr} */this.val = val;
    }
    
    [util.inspect.custom](depth, options, inspect) { return `AE[ ${inspect(this.assigne, options)} = ${inspect(this.val, options)} ]`; }
};
export class BinAssignExpr extends Expr{
    /** @param {Expr} assigne, @param {string} oper @param {Expr} val*/ constructor(assigne, oper, val){
        super('BinAssignExpr');
        
        /** @type {Expr} */this.assigne = assigne;
        /** @type {string} */this.oper = oper;
        /** @type {Expr} */this.val = val;
    }
    
    [util.inspect.custom](depth, options, inspect) { return `BAE[ ${inspect(this.assigne, options)} ${this.oper} ${inspect(this.val, options)} ]`; }
};

export class CallExpr extends Expr{
    /** @param {Expr} caller, @param {Expr[]} args */constructor(caller, args){
        super('CallExpr');
        
        /** @type {Expr} */this.caller = caller;
        /** @type {Expr[]} */this.args = args;
    }
    [util.inspect.custom](depth, options, inspect) { return `${inspect(this.caller, options)}<=${inspect(this.args, options)}`; }
};

export class MemberExpr extends Expr{
    /** @param {Expr} obj, @param {Expr} prop, @param {bool} comp */
    constructor(obj, prop, comp){
        super('MemberExpr');
        
        /** @type {Expr} */this.obj = obj;
        /** @type {Expr} */this.prop = prop;
        /** @type {bool} */this.comp = comp;
    }
    [util.inspect.custom](depth, options, inspect) { return `${inspect(this.obj, options)}.${inspect(this.prop, options)} `; }
};

export class RetExpr extends Expr{
    /** @param {Expr?} value */constructor(value){
        super('RetExpr');
        /** @type {Expr?} */ this.value = value;
    }
};

export class ImportExpr extends Expr{
    /** @param {string} loc */ constructor(loc){
        super('ImportExpr');

        /** @type {string} */this.loc = loc;
    }
};


//-------------------------------------//


export class BinaryExpr extends Expr{
    /**  @param {Expr} left, @param {string} oper, @param {Expr} right */constructor(left, oper, right){
        super('BinaryExpr');
        
        /** @type {Expr} */this.left = left;
        /** @type {Expr} */this.right = right;
        /** @type {string} */this.oper = oper;
    }
    [util.inspect.custom](depth, options, inspect) { return `( ${inspect(this.left, options)} ${this.oper} ${inspect(this.right, options)} )`; }
};

export class LogicExpr extends Expr{
    /**  @param {Expr} left, @param {string} oper, @param {Expr} right */constructor(left, oper, right){
        super('LogicExpr');
        
        /** @type {Expr} */this.left = left;
        /** @type {Expr} */this.right = right;
        /** @type {string} */this.oper = oper;
    }
    [util.inspect.custom](depth, options, inspect) { return `[ ${inspect(this.left, options)} ${this.oper} ${inspect(this.right, options)} ]`; }
};

export class NotExpr extends Expr{
    /**  @param {Expr} logic */constructor(logic){
        super('NotExpr');
        
        /** @type {Expr} */this.logic = logic;
    }
    [util.inspect.custom](depth, options, inspect) { return `NOT:${inspect(this.logic, options)}`; }
};

export class BoolExpr extends Expr{
    /**  @param {Expr} left, @param {string} oper, @param {Expr} right */constructor(left, oper, right){
        super('BoolExpr');
        
        /** @type {Expr} */this.left = left;
        /** @type {Expr} */this.right = right;
        /** @type {string} */this.oper = oper;
    }
};


//-------------------------------------//


export class IfExpr extends Expr{
    /**  @param {Expr} logic, @param {Stmt[]} body, @param {ElifExpr[]?} elifs, @param {Stmt[]?} _else */constructor(logic, body, elifs, _else){
        super('IfExpr');
        
        /** @type {Expr} */this.logic = logic;
        /** @type {Stmt[]} */this.body = body;
        /** @type {ElifExpr[]?} */this.elifs = elifs;
        /** @type {Stmt[]?} */this.else = _else;
    }
};

export class ElifExpr extends Expr{
    /**  @param {Expr} logic, @param {Stmt[]} body */constructor(logic, body){
        super('ElifExpr');
        
        /** @type {Expr} */this.logic = logic;
        /** @type {Stmt[]} */this.body = body;
    }
};

export class ElseExpr extends Expr{
    /**  @param {Stmt[]} body */constructor(body){
        super('ElseExpr');
        
        /** @type {Stmt[]} */this.body = body;
    }
};

export class ForExpr extends Expr{
    /**  @param {Expr} var_decl, @param {Expr} logic, @param {Expr} inc, @param {Expr[]} body */constructor(var_decl, logic, inc, body){
        super('ForExpr');
        
        /** @type {Expr} */this.var_decl = var_decl;
        /** @type {Expr} */this.logic = logic;
        /** @type {Expr} */this.inc = inc;
        /** @type {Expr[]} */this.body = body;
    }
};

export class WhileExpr extends Expr{
    /**  @param {Expr} logic, @param {Expr[]} body */constructor(logic, body){
        super('WhileExpr');
        
        /** @type {Expr} */this.logic = logic;
        /** @type {Expr[]} */this.body = body;
    }
};


//-------------------------------------//


export class Ident extends Expr{
    /** @param {string} symbol, */constructor(symbol){
        super('Ident');
        /** @type {string} */ this.symbol = symbol;
    }
    [util.inspect.custom](depth, options, inspect) { return `${inspect(this.symbol, options)}`; }
};

export class NumLiteral extends Expr{
    /** @param {number} value, */constructor(value){
        super('NumLiteral');
        /** @type {number} */ this.value = value;
    }
    [util.inspect.custom](depth, options, inspect) { return `${inspect(this.value, options)}`; }
};

export class StrLiteral extends Expr{
    /** @param {string} value, */constructor(value){
        super('StrLiteral');
        /** @type {string} */ this.value = value;
    }
    [util.inspect.custom](depth, options, inspect) { return `${inspect(this.value, options)}`.replaceAll("'", '"'); }
};

export class ListLiteral extends Expr{
    /** @param {any[]} values, */constructor(values){
        super('ListLiteral');
        /** @type {any[]} */ this.values = values;
    }
    
    [util.inspect.custom](depth, options, inspect) {
        let s = '';
        for(let i = 0; i<this.values.length; i++){
            s += inspect(this.values[i], options);
            if(i < this.values.length - 1) s += ', ';
        }
        return `[ ${s} ]`;
    }
};

export class Property extends Expr{
    /** @param {string} key, @param {Expr?} value */constructor(key, value){
        super('Property');
        /** @type {string} */ this.key = key;
        /** @type {Expr?} */ this.value = value;
    }
};

export class ObjLiteral extends Expr{
    /** @param {Property[]} props, */constructor(props){
        super('ObjLiteral');
        /** @type {Property[]} */ this.props = props;
    }
    
    // [util.inspect.custom](depth, options, inspect) { return `ObjL:${inspect(this.logic, options)} )`; }
};


//-------------------------------------//



