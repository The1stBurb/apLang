import { evaluate } from '../interpreter.js';
import Env from '../env.js';
import { FuncVal, NullVal, NativeFuncVal, NumVal, ObjVal, RuntimeVal, BoolVal } from '../values.js';
import { logs } from '../../helps.js';
import { RuntimeRes, RuntimeErr, RuntimeFail, RuntimeSucc } from '../result.js';
// import fs from 'node:fs';

function eval_num_bin_expr(lhs, oper, rhs, node, env){
    const res = RuntimeRes('Eval Num Bin Expr');

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

    else{ return res.failure( RuntimeErr(
            `Expected Binary Operation Token (+, -, *, /, %, <, <=, >, >=, ==, !=) but received token '${oper}'. `,
            node.pos,
            env
        )); }
    
    result = RuntimeSucc(result);
    return res.check(result);
}

function eval_bool_logic_expr(lhs, oper, rhs, node, env){
    const res = RuntimeRes('Eval Bool Logic Expr');

    let result;
    if(oper == '&&') result = lhs.__and__(rhs);
    else if(oper == '||') result = lhs.__or__(rhs);

    else{ return res.failure( RuntimeErr(
        `Expected Boolean Operation Token (&&, ||) but received token '${oper}'. `,
        node.pos,
        env
    ) ); }

    result = RuntimeSucc(result);
    return res.check(result);
}

function eval_body(node, stmts, env, henv, scope){
    const res = RuntimeRes('Eval Body');

    if(stmts.length == 0){ return res.success( new NullVal() ); }
    if(!scope) scope = new Env(env, '', node.pos);

    for(const stmt of stmts){
        if(res.check( evaluate(stmt, scope, henv), stmt ).error) return res;
        if(res.func_ret) return res;

    }
    return res;
}

function get_member_expr(member, env, henv){
    const res = RuntimeRes('Get Member Expr');

    const Obj = member.obj, Prop = member.prop;

    let value = {};
    if(Obj.kind == 'Ident'){
        if( res.check( env.lookupVar(member, Obj.symbol) ).error) return res;
        value = res.value;
    }
    else{
        if(res.check( evaluate(Obj, env, henv) ).error) return res;
        value = res.value;
    }
    
    let prop = '';
    if(member.comp){
        if(res.check( evaluate(Prop, env, henv) ).error) return res;
        prop = res.value.get_value();
    }
    else{ prop = Prop.symbol; }

    return res.success([value,prop]);
}


//-------------------------------------//


export function eval_bin_expr(binop, env, henv){
    const res = RuntimeRes('Eval Binary Expr');

    const lhs = evaluate(binop.left, env, henv), rhs = evaluate(binop.right, env, henv);
    
    if(lhs.error) return res.failure(lhs.error, binop);
    if(rhs.error) return res.failure(rhs.error, binop);
    // console.log(lhs, rhs);
    
    return res.check( eval_num_bin_expr(lhs.value, binop.oper, rhs.value, binop, env) );
}

export function eval_logic_expr(binop, env, henv){
    const res = RuntimeRes('Eval Boolean Expr');
    
    const lhs = evaluate(binop.left, env, henv), rhs = evaluate(binop.right, env, henv);

    if(lhs.error) return res.failure(lhs.error);
    if(rhs.error) return res.failure(rhs.error);
    
    return res.check( eval_bool_logic_expr(lhs.value, binop.oper, rhs.value, binop, node) );
}

export function eval_not_expr(notop, env, henv){
    const res = RuntimeRes('Eval Not Expr');

    if(res.check( evaluate(notop.logic, env, henv) ) .error) return res;
    try{
        return res.success( res.value .__not__() );
    }
    catch{
        return res.failure( RuntimeErr(
            `Not Operation not valid on token ${res.value }. `,
            notop.pos,
            env
        ) );
    }
}


//-------------------------------------//


export function eval_ident(ident, env, henv){
    return RuntimeRes('Eval Ident').check( env.lookupVar(ident, ident.symbol) );
}

export function eval_assign(node, env, henv){
    const res = RuntimeRes('Eval Assign');

    if(res.check( evaluate(node.val, env, henv) ) .error) return res;
    const value = res.value;

    if(node.assigne.kind == 'Ident') return res.check( env.assignVar(node, node.assigne.symbol, value) );
    else if(node.assigne.kind == 'MemberExpr'){
        if(res.check(get_member_expr(node.assigne, env, henv) ).error) return res;

        const [obj, loc] = res.value;
        return res.check( obj.set_index(loc, value, node, env) );
    }
}

export function eval_bin_assign(node, env, henv){
    const res = RuntimeRes('Eval Bin Assign');
    const assigneRes = evaluate(node.assigne, env, henv), valueRes = evaluate(node.val, env, henv);

    if(assigneRes.error) return res.failure( assigneRes );
    if(valueRes.error) return res.failure( valueRes );
    
    if(res.check( eval_num_bin_expr(assigneRes.value, node.oper[0], valueRes.value, node, env) ).error) return res;
    const value = res.value;
    
    if(node.assigne.kind == 'Ident'){
        return res.check( env.assignVar(node, node.assigne.symbol, value) );
    }
    else if(node.assigne.kind == 'MemberExpr'){
        if(res.check( get_member_expr(node.assigne, env, henv) ).error) return res;

        const [obj, loc] = res.value;
        return res.check( obj.set_index(loc, value, node, env) );
    }
}


//-------------------------------------//


export function eval_obj_expr(obj, env, henv){
    const res = RuntimeRes('Eval Obj Expr');

    const object = new ObjVal();
	for (const { key, value } of obj.props) {
        if(res.check( (value == undefined ? env.lookupVar(obj, key) : evaluate(value, env, henv) ) ).error) return res;

		object.props[key] = res.value;
	}

    return res.success( object );
}

export function eval_member_expr(member, env, henv){
    const res = RuntimeRes('Eval Memeber Expr');

    if(res.check( get_member_expr(member, env, henv) ).error) return res;

    const [value, prop] = res.value;
    return res.check( value.get_index(prop, member, env) );
}

export function eval_call_expr(expr, env, henv){
    const res = RuntimeRes('Eval Cell Expr');

    const args = [];
    for(const arg of expr.args){
        if(res.check( evaluate(arg, env, henv) ).error) return res;
        args.push(res.value);
    }

    if(res.check( evaluate(expr.caller, env, henv) ).error) return res;
    /** @type {FuncVal}*/const func = res.value;

    if(func.type == 'native-func'){
        res.check(
            RuntimeRes('Native Function Call').check( func.call(args, env, henv) )
        );
    }
    else if(func.type == 'func'){
        const scope = new Env(func.declEnv, func.name, func.pos);

        for (let i = 0; i < func.paras.length; i++) {
			const varname = func.paras[i];
			scope.declareVar(expr, varname, args[i] ? args[i] : new NullVal(), false);
		}
        
        res.check(
            RuntimeRes('Function Call').check( eval_body(func, func.body, env, henv, scope) )
        );
    }
    else if(func.type == 'arrow-func'){
        const scope = new Env(func.declEnv, func.name, func.pos);
        
        for (let i = 0; i < func.paras.length; i++) {
			const varname = func.paras[i];
			scope.declareVar(expr, varname, args[i], false);
		}
        
        res.check(
            RuntimeRes('Arrow Function Call').check( evaluate(func.body, scope, henv) )
        );
    }
    else{
        res.check(
            RuntimeRes('Unknown Function Call').failure( RuntimeErr(
                `What in the happened happened here, got func type: '${func.type}' which should not be possible!`,
                func.pos,
                env
            ) )
        );
    }
    // console.error(func);
    // throw new Error('splat');
    return res;
}

export function eval_ret_expr(expr, env, henv){
    return RuntimeRes().check_ret( evaluate(expr.value, env, henv) );
}

export function eval_import_expr(expr, env, henv){
    const val = expr.loc.value;
    // if(! val in henv){
    //     henv.declareVar( expr,
    //         val, 
    //         henv.lookupVar('parser').produceAST(
    //             fs.readFileSync(
    //                 henv.lookupVar('folder') + val,
    //                 'utf8'
    //             )
    //         )
    //     );
    // }
    // else{}
    // return new NullVal();
}


//-------------------------------------//


export function eval_if_expr(expr, env, henv){
    const res = RuntimeRes('If');

    if(res.check(evaluate(expr.logic, env, henv)) .error) return res;
    // const logicRes = res.value .get_value();
    
    if(res.value .get_value() == true){ return eval_body(expr, expr.body, env, henv); }
    else{
        const res = RuntimeRes('elif');
        for(const elif of expr.elifs){
            if(res.check( evaluate(elif.logic, env, henv) ) .error) return res;

            if(res.value .get_value() == true){ return res.check( eval_body(elif, elif.body, env, henv) ); }
        }

        return RuntimeRes('Else').check( eval_body(expr, expr.else, env, henv) );
    }
}

export function eval_elif_expr(expr, env, henv){
    return RuntimeFail( RuntimeErr(
        'Dude you should literly never get here! (eval_elif_expr)',
        expr,
        env
    ) );
}

export function eval_else_expr(expr, env, henv){
    return RuntimeFail( RuntimeErr(
        'Dude you should literly never get here! (eval_else_expr)', expr, env
    ) );
}

export function eval_for_expr(expr, env, henv){
    const res = RuntimeRes('For');

    if(res.check(evaluate(expr.var_decl, env, henv)) .error) return res;

    let steps = Math.pow(2,8);
    while(steps-- > 0){
        if(res.check( evaluate(expr.logic, env, henv) ).error) return res;
        if(!res.value .get_value()) break;
    
        const scope = new Env(env, 'for-loop', expr.pos);
        
        if(res.check( eval_body(expr, expr.body, env, henv, scope) ).error) return res;

        if(res.check( evaluate(expr.inc, env, henv) ).error) return res;
    }
    if(steps <= 1){
        throw new Error(`For loop is infinte maybe!! ${expr}`);
    }

    return res.success( new NullVal() );
}

export function eval_while_expr(expr, env, henv){
    const res = RuntimeRes('While');

    let steps = Math.pow(2,8);
    while(steps-- > 0){
        if(res.check( evaluate(expr.logic, env, henv) ) .error) return res;
        if(!res.value .get_value()) break;
    
        const scope = new Env(env, 'while-loop', expr.pos);
        if(res.check( eval_body(expr, expr.body, env, henv, scope) ) .error ) return res;;
    }
    if(steps <= 1){
        throw new Error(`while loop is infinte maybe!! ${expr}`);
    }

    return res.success( new NullVal() );
}