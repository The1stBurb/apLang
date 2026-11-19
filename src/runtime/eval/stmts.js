import { evaluate } from '../interpreter.js';
import { FuncVal, NullVal, RuntimeVal, ArrowFuncVal} from '../values.js';
import { logs } from '../../helps.js';
import { VarDecl } from '../../frontend/ast.js';
import { RuntimeRes, RuntimeSucc, RuntimeFail } from '../result.js';

export function eval_program(program, env, programs){
    const res = RuntimeRes('Eval Program');
    
    for(const stmt of program.body){
        if(res.check( evaluate(stmt, env, programs) ).error) return res;
    }

    return res.success( new NullVal() );
}

/** @param {VarDecl} decl */
export function eval_var_decl(decl, env, programs){
    const res = RuntimeRes('Eval Var Decl');

    if(res.check(
        decl.value ?
        evaluate(decl.value, env, programs) :
        RuntimeSucc( new NullVal() )
    ) .error) return res;

    return res.check( env.declareVar(decl, decl.ident, res.value, decl.const) );
}
/** @param {VarDecl} decl */
export function eval_var_decl_mult(mult, env, programs){
    const res = RuntimeRes('Eval Var Decl Mult');
    
    for(let decl of mult.decls){
        if(res.check( eval_var_decl(decl, env, programs) ).error ) return res;
    }

    return res.success( new NullVal() );
}

/** @param {FuncDecl} decl */
export function eval_func_decl(decl, env, programs){
    const res = RuntimeRes('Eval Func Decl');

    const func = new FuncVal(decl.name, decl.para, env, decl.body);

    return res.check( env.declareVar(decl, decl.name, func, true) );
}

/** @param {ArrowFuncDecl} decl */
export function eval_arrow_func_decl(decl, env, programs){
    const res = RuntimeRes('Eval Arrow Func Decl');

    const func = new ArrowFuncVal(decl.name, decl.para, env, decl.body);

    return res.check( env.declareVar(decl, decl.name, func, true) );
}
