import { evaluate } from '../interpreter.js';
import { FuncVal, NullVal, RuntimeVal, ArrowFuncVal} from '../values.js';
import { logs } from '../../helps.js';
import { VarDecl } from '../../frontend/ast.js';

export function eval_program(program, env, programs){
    let res = new NullVal();
    for(const stmt of program.body){
        res = evaluate(stmt, env, programs);
    }
    return res;
}

/** @param {VarDecl} decl */
export function eval_var_decl(decl, env, programs){
    const val = decl.value ? evaluate(decl.value, env, programs) : new NullVal();
    const res = env.declareVar(decl.ident, val, decl.const);
    // logs(env);
    return res;
}
/** @param {VarDecl} decl */
export function eval_var_decl_mult(mult, env, programs){
    for(let decl of mult.decls){
        eval_var_decl(decl, env, programs);
    }
    return new NullVal();
}

/** @param {FuncDecl} decl */
export function eval_func_decl(decl, env, programs){
    const func = new FuncVal(decl.name, decl.para, env, decl.body);
    const res = env.declareVar(decl.name, func, true);
    // logs(env);
    return res;
}

/** @param {ArrowFuncDecl} decl */
export function eval_arrow_func_decl(decl, env, programs){
    const func = new ArrowFuncVal(decl.name, decl.para, env, decl.body);
    const res = env.declareVar(decl.name, func, true);
    // logs(env);
    return res;
}
