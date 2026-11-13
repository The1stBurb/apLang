import { NativeFuncVal, NullVal, ObjVal, NumVal, StrVal, BoolVal, ListVal } from './values.js';
import { Graphics } from './graphics.js';
import promptSync from 'prompt-sync';


function retType(n){
    if(n == 'null') return NullVal;
    else if(typeof n === 'string') return StrVal;
    else if(typeof n === 'number') return NumVal;
    else if(typeof n === 'boolean') return BoolVal;
    else{ return NullVal; }
}

function handleFunc(args, func, Ret){
    args = args.map(arg => arg.get_value());
    return new Ret( func(...args) );
}

function handleOverloadFunc(args, funcs, defFunc){
    for(const func of funcs){
        let win = true;
        if(args.length > func.args.length){ continue; }
        for(let i = 0; i < func.args.length; i++){
            if(
                (i >= args.length && !func.args[i].default) ||
                ( args.type != func.args[i].type && func.args[i].type != 'any' )
            ){
                win = false;
                break;
            }
        }
        if(win){
            args = args.map(arg => arg. get_value());
            if(args.length != func.args.length){
                for(let i = args.length; i < func.args.length; i++){
                    args.push(func.args[i].default);
                }
            }
            return new func.Ret( func.func(...args) )
        }
    }
    return handleFunc(args, defFunc.func, defFunc.Ret);
}
function olf(args, func, Ret){ 
    if(typeof args === 'number'){
        const targs = [];
        for(let i=0; i<args; i++){
            targs.push(oarg('any'));
        }
        args = targs;
    }
    return {args, func, Ret};
}
function odf(func, Ret){ return {func, Ret}; }
function oarg(type, _default){ return {type, default: _default ?? false}; }

function createOldFunc(defaultFunc, ...funcs){ return new NativeFuncVal( (args, scope) => handleOverloadFunc(args, funcs, defaultFunc )); }
function createOlFunc(...funcs){ return new NativeFuncVal( (args, scope) => handleOverloadFunc(args, funcs, odf(()=>'null', NullVal) )); }
function createFunc(func, Ret){ return new NativeFuncVal( (args, scope) => handleFunc(args, func, Ret) ); }

const create = {
    old: createOldFunc,
    ol: createOldFunc,
    func: createFunc,
};
function randint(min, max){ return Math.round( min + Math.random() * (max - min) ); }

export function createGlobalEnv(parent, name){
    const env = new Env(parent, name);

    env.declareVar('__graphics__', new Graphics() );
    env.declareVar('__prompt__', promptSync({ sigint: true }) )

    env.declareVar('print', new NativeFuncVal((args, scope)=>{
        console.log(...args.map(arg => arg.str__()));
        return new NullVal();
    }), true);
    
    env.declareVar('input', new NativeFuncVal((args, scope)=>new StrVal(
        env.lookupVar('__prompt__')(args.map(arg => arg.str__()).join(' '))
    )), true);
    

    
    env.declareVar('Math', new ObjVal({
        'floor': create.func(Math.floor, NumVal),
        'ceil': create.func(Math.ceil, NumVal),
        'min': create.func(Math.min,NumVal),
        'max': create.func(Math.max, NumVal),
        'abs': create.func(Math.abs, NumVal),
        'sqrt': create.func(Math.sqrt, NumVal),
        'root': create.func((root, value) => Math.pow(value, 1 / root), NumVal),
        'frac': create.func((value) => value - Math.floor(value), NumVal),
        'round': create.ol(
            olf(1, Math.round, NumVal),
            olf(2, (n, digit) => Math.round(n * Math.pow(10, digit)) / Math.pow(10, digit), NumVal)
        ),


        'PI': new NumVal(Math.PI),
    }), true);
    env.declareVar('Rand', new ObjVal({
        'random': create.ol(
            olf(0, Math.random, NumVal),
            olf(1, (n) => Math.random() * n, NumVal),
            olf(2, randint, NumVal)
        ),
        'randint': create.func(randint, NumVal),
        'choice': new NativeFuncVal((args, scope) => {
            if(args[0].type != 'list'){ return new NullVal(); }
            /** @type {ListVal} */let arg = args[0];
            let n = randint(0, arg.values.length - 1);
            return arg.get_index(n);
        }),
    }), true);

    env.declareVar('Screen', new ObjVal({
        'fill': new NativeFuncVal( (args, scope) => {
            env.lookupVar('__graphics__').setFill(...args.map(arg => arg.get_value()) );
            return new NullVal();
        }),
        'background': new NativeFuncVal( (args, scope) => {
            env.lookupVar('__graphics__').setBackground(...args.map(arg => arg.get_value()) );
            return new NullVal();
        }),
        // 'color': new NativeFuncVal( (arg, scope) => new NumVal(
        //     Math.floor( arg[0].get_value() ))
        // ),

        'rect': new NativeFuncVal( (args, scope) => {
            env.lookupVar('__graphics__').createRect(...args.map(arg => arg.get_value()) );
            return new NullVal();
        }),
        'ellipse': new NativeFuncVal( (args, scope) => {
            env.lookupVar('__graphics__').createEllipse(...args.map(arg => arg.get_value()) );
            return new NullVal();
        }),

        'draw': new NativeFuncVal( (args, scope) => {
            env.lookupVar('__graphics__').draw();
            return new NullVal();
        }),
    }), true);

    
    env.declareVar('true', new BoolVal(true));
    env.declareVar('false', new BoolVal(false));
    env.declareVar('null', new BoolVal(null));

    return env;
}
export function createHighEnv(){
    const env = new High_Env();
    return env;
}

export default class Env{
    /** @param {Env?} parentEnv@param {string?} name*/constructor(parentEnv, name){
        this.parent = parentEnv;
        this.name = name;
        this.vars = {};
        this.consts = [];
    }

    declareVar(name, value, const_){
        if(name in this.vars) throw `cannot re-init ${name} in ${this.name} as it exit`;
        this.vars[name] = value;
        if(const_) this.consts.push(name);
        return value;
    }

    assignVar(name, value){
        const env = this.resolve(name, 'assignVar');

        if(env.consts.includes(name)) throw `cannot re-assign to ${name} in ${this.name} as it is const`;
        env.vars[name] = value;
        return value;
    }

    lookupVar(name){
        const env = this.resolve(name, 'lookupVar');
        return env.vars[name];
    }

    resolve(name, lookup){
        if(name in this.vars) return this;

        if( !this.parent) throw `var ${name} no exist in ${this.name} when doing ${lookup ?? 'spaghetti'}`;
        
        return this.parent.resolve(name, '', this);
    }

}
export class High_Env{
    /** @param {Env?} parentEnv@param {string?} name*/constructor(){
        this.name = 'High Env';
        this.vars = {};
    }

    declareVar(name, value, const_){
        if(name in this.vars) throw `cannot re-init ${name} in ${this.name} as it exit`;
        this.vars[name] = value;
        return value;
    }

    assignVar(name, value){
        throw `cannot re-assign to ${name} in the High Env`;
    }

    lookupVar(name){
        return this.vars[name];
    }

    resolve(name, lookup, child){
        // return child;
        throw `You shouldnt be looking in ${this.name}!`;
    }

}