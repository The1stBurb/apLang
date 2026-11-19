import { NativeFuncVal, NullVal, ObjVal, NumVal, StrVal, BoolVal, ListVal } from './values.js';
import { Graphics } from './graphics.js';
// import promptSync from 'prompt-sync';
import { RuntimeRes, RuntimeErr, RuntimeFail, RuntimeSucc } from './result.js';
import { Pos } from '../frontend/ast.js';
import { global, logToConsole } from '../index.js';


function retType(n){
    if(n == 'null') return NullVal;
    else if(typeof n === 'string') return StrVal;
    else if(typeof n === 'number') return NumVal;
    else if(typeof n === 'boolean') return BoolVal;
    else{ return NullVal; }
}

function handleFunc(args, func, Ret){
    args = args.map(arg => arg.get_value());
    return RuntimeSucc( new Ret(func(...args)) );
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

    env.declareVar(null, '__graphics__', new Graphics(), true, true );
    // env.declareVar('__prompt__', promptSync({ sigint: true }), true, true )

    env.declareVar(null, 'print', new NativeFuncVal((args, scope)=>{
        global.lines.push
        // logToConsole
        (args.map(
            arg => arg
                .str__()
                .get_value()
                .replaceAll('\\n', '\n')
        ).join(' '));
        return RuntimeSucc( new NullVal() );
    }), true, true);
    
    // env.declareVar(null, 'input', new NativeFuncVal((args, scope)=>new StrVal(
    //     env.lookupVar('__prompt__')(args.map(arg => arg.str__()).join(' '))
    // )), true);
    

    
    env.declareVar(null, 'Math', new ObjVal({
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
    }), true, true);
    env.declareVar(null, 'Rand', new ObjVal({
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
            return arg.get_index(n, Pos(), scope);
        }),
    }), true, true);

    env.declareVar(null, 'Screen', new ObjVal({
        'fill': new NativeFuncVal( (args, scope) => {
            env.lookupVar('__graphics__').value .setFill(...args.map(arg => arg.get_value()) );
            return RuntimeSucc( new NullVal() );
        }),
        'background': new NativeFuncVal( (args, scope) => {
            env.lookupVar('__graphics__').value .setBackground(...args.map(arg => arg.get_value()) );
            return RuntimeSucc( new NullVal() );
        }),
        // 'color': new NativeFuncVal( (arg, scope) => new NumVal(
        //     Math.floor( arg[0].get_value() ))
        // ),

        'rect': new NativeFuncVal( (args, scope) => {
            env.lookupVar('__graphics__').value .createRect(...args.map(arg => arg.get_value()) );
            return RuntimeSucc( new NullVal() );
        }),
        'ellipse': new NativeFuncVal( (args, scope) => {
            env.lookupVar('__graphics__').value .createEllipse(...args.map(arg => arg.get_value()) );
            return RuntimeSucc( new NullVal() );
        }),

        'draw': new NativeFuncVal( (args, scope) => {
            env.lookupVar('__graphics__').value .draw();
            return RuntimeSucc( new NullVal() );
        }),
    }), true, true);

    
    env.declareVar(null, 'true', new BoolVal(true), true, true);
    env.declareVar(null, 'false', new BoolVal(false), true, true);
    env.declareVar(null, 'null', new BoolVal(null), true, true);

    return env;
}
export function createHighEnv(){
    const env = new High_Env();
    return env;
}

export default class Env{
    /** @param {Env?} parentEnv@param {string?} name*/constructor(parentEnv, name, init_pos){
        this.parent = parentEnv;
        this.name = name;
        this.vars = {};
        
        this.consts = [];
        this.builts = [];

        this.pos = init_pos ?? 0;
    }
    
    clear(){
        for(let i in this.vars){
            if(! this.builts.includes(i)){
                delete this.vars[i];
            }
        }
    }

    declareVar(node, name, value, const_, builtIn){
        const res = RuntimeRes(`Declare Var in ${this.name}`);

        if(name in this.vars){
            return res.failure( RuntimeErr(
                `Cannot re-define variable '${name}'.`,
                node.pos,
                this
            ) );
        }

        this.vars[name] = value;
        
        if(const_) this.consts.push(name);
        if(builtIn) this.builts.push(name);
        
        return res.success(value);
    }

    assignVar(node, name, value){
        const res = RuntimeRes(`Assign Var in ${this.name}`);

        if(res.check( this.resolve(node, name, 'assignVar') ) .error) return res;

        if(res.value .consts.includes(name)) return res.failure( RuntimeErr(
            `Cannot re-assign to variable '${name}' as it is a Constant.`,
            node.pos,
            this
        ) );
        
        res.value .vars[name] = value;
        
        return res.success(value);
    }

    lookupVar(node, name){
        const res = RuntimeRes(`Lookup Var in ${this.name}`);
        if(res.check( this.resolve(node, name, 'lookupVar') ) .error) return res;

        return res.success(res.value .vars[name]);
    }

    resolve(node, name, lookup){
        const res = RuntimeRes(`Resolve Env in ${this.name}`);
        if(name in this.vars) return res.success(this);

        if( !this.parent) {
            return res.failure( RuntimeErr(
                `Variable '${name}' is not defined.`,
                node.pos,
                this
            ) );
        }
        
        return res.check( this.parent.resolve(node, name, '', this) );
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