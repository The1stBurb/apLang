import Env from './env.js';


function Val(type, value){
    switch(type){
        case 'bool': return new BoolVal(value);
        case 'number': return new NumVal(value);
        case 'object': return new ObjVal();

        case 'null':
        default:
            return new NullVal();
    }
}

export class RuntimeVal{
    constructor(type){
        this.type = type;
    }
    get_value(){ return this.value; }
    set_value(value){ this.value = value; return this.get_value(); }

    get_index(idx){ return this.value[idx]; }
    set_index(idx,value){ this.value[idx] = value; return this.get_index(idx); }

    copy(){ return Val(this.type, this.value); }

    __add__(other){ return new NullVal(); }
    __sub__(other){ return new NullVal(); }
    __mult__(other){ return new NullVal(); }
    __div__(other){ return new NullVal(); }
    __mod__(other){ return new NullVal(); }

    __less__(other){ return new BoolVal(this.get_value() < other.get_value()); }
    __leq__(other){ return new BoolVal(this.get_value() <= other.get_value()); }
    __great__(other){ return new BoolVal(this.get_value() > other.get_value()); }
    __geq__(other){ return new BoolVal(this.get_value() >= other.get_value()); }
    __eq__(other){ return new BoolVal(this.get_value() == other.get_value()); }
    __neq__(other){ return new BoolVal(this.get_value() != other.get_value()); }

    __not__(){ return new BoolVal(!this.get_value()); }
    __and__(other){ return new BoolVal(this.get_value() && other.get_value()); }
    __or__(other){ return new BoolVal(this.get_value() || other.get_value()); }

    str__(){ return `${this.get_value()}`; }
    // __func__ => arg1 func arg2, i.e. __add__ => arg1 + arg2
    // __func => arg1.func, i.e. __length => list.length
    // func__ => func(arg1), i.e. str__ => str(arg1)
}

export class NullVal extends RuntimeVal{
    constructor(){
        super('null');
        this.value = 'null';
    }
}

export class BoolVal extends RuntimeVal{
    constructor(value){
        super('bool');
        this.value = value;
    }

    __add__(other){
        if(other instanceof BoolVal){ return new BoolVal(this.get_value() + other.get_value()); }
        else if(other instanceof NumVal){ return new BoolVal(this.get_value() + other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() + other.get_value()); }
        else{ return new NullVal(); }
    }
    __sub__(other){
        if(other instanceof BoolVal){ return new BoolVal(this.get_value() - other.get_value()); }
        else if(other instanceof NumVal){ return new BoolVal(this.get_value() - other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() - other.get_value()); }
        else{ return new NullVal(); }
    }
    __mult__(other){
        if(other instanceof BoolVal){ return new BoolVal(this.get_value() * other.get_value()); }
        else if(other instanceof NumVal){ return new BoolVal(this.get_value() * other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() * other.get_value()); }
        else{ return new NullVal(); }
    }
    __div__(other){
        if(other instanceof BoolVal){ return new BoolVal(this.get_value() / other.get_value()); }
        else if(other instanceof NumVal){ return new BoolVal(this.get_value() / other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() / other.get_value()); }
        else{ return new NullVal(); }
    }
    __mod__(other){
        if(other instanceof BoolVal){ return new BoolVal(this.get_value() % other.get_value()); }
        else if(other instanceof NumVal){ return new BoolVal(this.get_value() % other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() % other.get_value()); }
        else{ return new NullVal(); }
    }

}

export class NumVal extends RuntimeVal{
    constructor(value){
        super('number');
        this.value = value;
    }
    
    __add__(other){
        if(other instanceof BoolVal){ return new NumVal(this.get_value() + other.get_value()); }
        else if(other instanceof NumVal){ return new NumVal(this.get_value() + other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() + other.get_value()); }
        else{ return new NullVal(); }
    }
    __sub__(other){
        if(other instanceof BoolVal){ return new NumVal(this.get_value() - other.get_value()); }
        else if(other instanceof NumVal){ return new NumVal(this.get_value() - other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() - other.get_value()); }
        else{ return new NullVal(); }
    }
    __mult__(other){
        if(other instanceof BoolVal){ return new NumVal(this.get_value() * other.get_value()); }
        else if(other instanceof NumVal){ return new NumVal(this.get_value() * other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() * other.get_value()); }
        else{ return new NullVal(); }
    }
    __div__(other){
        if(other instanceof BoolVal){ return new NumVal(this.get_value() / other.get_value()); }
        else if(other instanceof NumVal){ return new NumVal(this.get_value() / other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() / other.get_value()); }
        else{ return new NullVal(); }
    }
    __mod__(other){
        if(other instanceof BoolVal){ return new NumVal(this.get_value() % other.get_value()); }
        else if(other instanceof NumVal){ return new NumVal(this.get_value() % other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() % other.get_value()); }
        else{ return new NullVal(); }
    }
}

export class StrVal extends RuntimeVal{
    constructor(value){
        super('string');
        this.value = value;
    }
    
    __add__(other){
        if(other instanceof BoolVal){ return new StrVal(this.get_value() + other.get_value()); }
        else if(other instanceof NumVal){ return new StrVal(this.get_value() + other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() + other.get_value()); }
        else{ return new NullVal(); }
    }
    __sub__(other){
        if(other instanceof BoolVal){ return new StrVal(this.get_value() - other.get_value()); }
        else if(other instanceof NumVal){ return new StrVal(this.get_value() - other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() - other.get_value()); }
        else{ return new NullVal(); }
    }
    __mult__(other){
        if(other instanceof BoolVal){ return new StrVal(this.get_value() * other.get_value()); }
        else if(other instanceof NumVal){ return new StrVal(this.get_value().repeat(other.get_value()) ); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() * other.get_value()); }
        else{ return new NullVal(); }
    }
    __div__(other){
        if(other instanceof BoolVal){ return new StrVal(this.get_value() / other.get_value()); }
        else if(other instanceof NumVal){ return new StrVal(this.get_value() / other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() / other.get_value()); }
        else{ return new NullVal(); }
    }
    __mod__(other){
        if(other instanceof BoolVal){ return new StrVal(this.get_value() % other.get_value()); }
        else if(other instanceof NumVal){ return new StrVal(this.get_value() % other.get_value()); }
        else if(other instanceof StrVal){ return new StrVal(this.get_value() % other.get_value()); }
        else{ return new NullVal(); }
    }
}

export class ListVal extends RuntimeVal{
    constructor(values){
        super('list');
        this.values = values ?? [];
    }
    get_value(){ return this.values; }
    get_index(idx){
        if(typeof idx === 'number'){ return this.values[idx]; }
        else{ return this['__'+idx](); }
    }
    set_index(idx, value){
        if(typeof idx === 'number'){ this.values[idx] = value; return this.get_index(idx); }
        else{ return new NullVal(); }
    }
    str__(){
        let s = '[';
        for(let i = 0; i<this.values.length; i++){
            s += this.values[i].get_value();
            if(i < this.values.length - 1) s += ', ';
        }
        return s + ']';
    }
    __length(){ return new NumVal(this.values.length); }
    __push(){ return new NativeFuncVal((args,scope)=>{ this.values.push(args[0]); }); }

    copy(){
        const props = [];
        for(const prop of this.props){
            props.push(prop.copy());
        }
        return new ObjVal(props);
    }
}

export class ObjVal extends RuntimeVal{
    constructor(props){
        super('object');
        this.props = props ?? {};
    }
    get_value(){ return this; }

    get_index(idx){ return this.props[idx]; }
    set_index(idx, value){ this.props[idx] = value; return this.get_index(); }

    copy(){
        const props = [];
        for(const prop of this.props){
            props.push(prop.copy());
        }
        return new ObjVal(props);
    }
}

/**
 * @callback FuncCall
 * @param {RuntimeVal[]} args
 * @param {Env} env
 * @returns {RuntimeVal}
 */

export class NativeFuncVal extends RuntimeVal{
    /** @param {FuncCall} call */constructor(call){
        super('native-func');
        /** @type {FuncCall}*/this.call = call;
    }
}

export class FuncVal extends RuntimeVal{
    /**
     * @param {string} name
     * @param {string[]} paras
     * @param {Env} declEnv
     * @param {Stmt[]} body
     */
    constructor(name, paras, declEnv, body){
        super('func');
        /**@type {string}*/this.name = name;
        /**@type {string[]}*/this.paras = paras;
        /**@type {Env}*/this.declEnv = declEnv;
        /**@type {Stmt[]}*/this.body = body;
    }
}

export class ArrowFuncVal extends RuntimeVal{
    /**
     * @param {string} name
     * @param {string[]} paras
     * @param {Env} declEnv
     * @param {Expr} body
     */
    constructor(name, paras, declEnv, body){
        super('arrow-func');
        /**@type {string}*/this.name = name;
        /**@type {string[]}*/this.paras = paras;
        /**@type {Env}*/this.declEnv = declEnv;
        /**@type {Expr}*/this.body = body;
    }
}

// export class ForVal extends RuntimeVal{
//     /**
//      * @param {Expr} decl
//      * @param {Expr} logic
//      * @param {Expr} inc
//      * @param {Env} declEnv
//      * @param {Stmt[]} body
//      */
//     constructor(decl, logic, inc, declEnv, body){
//         super('for-loop');
//         /**@type {Expr}*/this.decl = decl;
//         /**@type {Expr}*/this.logic = logic;
//         /**@type {Expr}*/this.inc = inc;
//         /**@type {Expr}*/this.declEnv = declEnv;
//         /**@type {Stmt[]}*/this.body = body;
//     }
// }
