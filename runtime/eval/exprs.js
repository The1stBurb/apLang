import { evaluate } from '../interpreter.js';
import Env from '../env.js';
import { FuncVal, NullVal, NativeFuncVal, NumVal, ObjVal, RuntimeVal, BoolVal } from '../values.js';
import { logs } from '../../helps.js';
import fs from 'node:fs';

function eval_num_bin_expr(lhs, oper, rhs){
    let result;

    if(oper == '+') result = lhs.__add__(rhs);
    else if(oper == '-') result = lhs.__sub__(rhs);
    else if(oper == '*') result = lhs.__mult__(rhs);
    else if(oper == '/') result = lhs.__div__(rhs);
    else if(oper == '%') result = lhs.__mod__(rhs);

    else if(oper == '<') result = lhs.__less__(rhs);
    else if(oper == '<=') result = lhs.__leq__(rhs);
    else if(oper == '>') result = lhs.__great__(rhs);
    else if(oper == '>=') result = lhs.__geq__(rhs);
    else if(oper == '==') result = lhs.__eq__(rhs);
    else if(oper == '!=') result = lhs.__neq__(rhs);
    
    return result;
}

function eval_bool_logic_expr(lhs, oper, rhs){
    let result;
    if(oper == '&&') result = lhs.__and__(rhs);
    else if(oper == '||') result = lhs.__or__(rhs);

    return result;
}

function eval_body(stmts, env, henv, scope){
    if(stmts.length == 0){ return new NullVal(); }
    if(!scope) scope = new Env(env);

    let res = new NullVal();
    for(const stmt of stmts){
        res = evaluate(stmt, scope, henv);
    }
    return res;
}

function get_member_expr(member, env, henv){
    const Obj = member.obj, Prop = member.prop;

    let value = {};
    if(Obj.kind == 'Ident'){ value = env.lookupVar(Obj.symbol); }
    else{ value = evaluate(Obj, env, henv); }
    
    let prop = '';
    if(member.comp){ prop = evaluate(Prop, env, henv).get_value(); }
    else{ prop = Prop.symbol; }

    return [value,prop];
}


//-------------------------------------//


export function eval_bin_expr(binop, env, henv){
    const lhs = evaluate(binop.left, env, henv), rhs = evaluate(binop.right, env, henv);
    
    return eval_num_bin_expr(lhs, binop.oper, rhs);
}

export function eval_logic_expr(binop, env, henv){
    const lhs = evaluate(binop.left, env, henv), rhs = evaluate(binop.right, env, henv);
    
    return eval_bool_logic_expr(lhs, binop.oper, rhs);
}

export function eval_not_expr(notop, env, henv){
    return evaluate(notop.logic, env, henv).__not__();
}


//-------------------------------------//


export function eval_ident(ident, env, henv){
    return env.lookupVar(ident.symbol);
}

export function eval_assign(node, env, henv){
    const value = evaluate(node.val, env, henv);

    if(node.assigne.kind == 'Ident') return env.assignVar(node.assigne.symbol, value);
    else if(node.assigne.kind == 'MemberExpr'){
        const [obj, loc] = get_member_expr(node.assigne, env, henv);
        return obj.set_index(loc, value);
    }
}

export function eval_bin_assign(node, env, henv){
    const value = eval_num_bin_expr(evaluate(node.assigne, env, henv), node.oper[0], evaluate(node.val, env, henv));

    if(node.assigne.kind == 'Ident') return env.assignVar(node.assigne.symbol, value);
    else if(node.assigne.kind == 'MemberExpr'){
        const [obj, loc] = get_member_expr(node.assigne, env, henv);
        return obj.set_index(loc, value);
    }
}


//-------------------------------------//


export function eval_obj_expr(obj, env, henv){
    const object = new ObjVal();
	for (const { key, value } of obj.props) {
		const runtimeVal = (value == undefined ? env.lookupVar(key) : evaluate(value, env, henv) );
		object.props[key] = runtimeVal;
	}

    return object;
}

export function eval_member_expr(member, env, henv){
    const [value, prop] = get_member_expr(member, env, henv);
    return value.get_index(prop);
}

export function eval_call_expr(expr, env, henv){
    const args = expr.args.map((arg)=>evaluate(arg, env, henv));
    /** @type {FuncVal}*/const func = evaluate(expr.caller, env, henv);

    if(func.type == 'native-func'){
        try{
            return func.call(args, env, henv);
        }
        catch(e){
            console.log('broke, args:',args, expr.args);
            throw e;
        }
    }
    else if(func.type == 'func'){
        const scope = new Env(func.declEnv, func.name);

        for (let i = 0; i < func.paras.length; i++) {
			const varname = func.paras[i];
			scope.declareVar(varname, args[i] ? args[i] : new NullVal(), false);
		}
        
        return eval_body(func.body, env, henv, scope);
    }
    else if(func.type == 'arrow-func'){
        const scope = new Env(func.declEnv, func.name);
        
        for (let i = 0; i < func.paras.length; i++) {
			const varname = func.paras[i];
			scope.declareVar(varname, args[i], false);
		}
        
        return evaluate(func.body, scope, henv);
    }
}

export function eval_ret_expr(expr, env, henv){
    return evaluate(expr.value, env, henv);
}

export function eval_import_expr(expr, env, henv){
    const val = expr.loc.value;
    if(! val in henv){
        henv.declareVar(
            val, 
            henv.lookupVar('parser').produceAST(
                fs.readFileSync(
                    henv.lookupVar('folder') + val,
                    'utf8'
                )
            )
        );
    }
    else{}
    return new NullVal();
}


//-------------------------------------//


export function eval_if_expr(expr, env, henv){
    const res = evaluate(expr.logic, env, henv).get_value();
    
    if(res == true){ return eval_body(expr.body, env, henv); }
    else{
        for(const elif of expr.elifs){
            const res = evaluate(elif.logic, env, henv).get_value();

            if(res == true){ return eval_body(elif.body, env, henv); }
        }

        return eval_body(expr.else, env, henv);
    }
}

export function eval_elif_expr(expr, env, henv){
    throw new Error('Dude you should literly never get here! (eval_elif_expr)');
}

export function eval_else_expr(expr, env, henv){
    throw new Error('Dude you should literly never get here! (eval_else_expr)');
}

export function eval_for_expr(expr, env, henv){
    // const forl = new ForVal(decl.var_decl, decl.logic, decl.inc, env, decl.body);
    evaluate(expr.var_decl, env, henv);

    let steps = Math.pow(2,8);
    while(steps-- > 0){
        const res = evaluate(expr.logic, env, henv).get_value();
        if(!res) break;
    
        const scope = new Env(env, 'for-loop');
        eval_body(expr.body, env, henv, scope);
        evaluate(expr.inc, env, henv);
    }
    if(steps <= 1){
        throw new Error(`For loop is infinte maybe!! ${expr}`);
    }

    return new NullVal();
}

export function eval_while_expr(expr, env, henv){

    let steps = Math.pow(2,8);
    while(steps-- > 0){
        const res = evaluate(expr.logic, env, henv).get_value();
        if(!res) break;
    
        const scope = new Env(env, 'while-loop');
        eval_body(expr.body, env, henv, scope);
    }
    if(steps <= 1){
        throw new Error(`while loop is infinte maybe!! ${expr}`);
    }

    return new NullVal();
}