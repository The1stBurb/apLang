import { NumVal, StrVal, ListVal } from './values.js';
import Env from './env.js';
import { eval_func_decl, eval_program, eval_var_decl, eval_var_decl_mult, eval_arrow_func_decl } from './eval/stmts.js'
import { eval_assign, eval_bin_expr, eval_call_expr, eval_ident, eval_obj_expr, eval_ret_expr, eval_for_expr, eval_import_expr, eval_member_expr, eval_logic_expr, eval_not_expr, eval_if_expr, eval_elif_expr, eval_else_expr, eval_while_expr, eval_bin_assign } from './eval/exprs.js';
import { logs } from '../helps.js';

/**
 * @param {Stmt} astNode, @param {Env} env
 * @returns {RuntimeVal}
 */
export function evaluate(astNode, env, programs){
    if(!astNode){
        throw new Error('ast node doesnt exist?');
    }
    try{
        let func = (node, env, programs)=>{
            throw `ast node not implemetned ${JSON.stringify(astNode)}`;
        };

        switch(astNode.kind){
            //-------------------------------------//
            case "Program":
                func = eval_program;
                break;
            

            //-------------------------------------//
            case "NumLiteral":
                return new NumVal(astNode.value);
        
            case "StrLiteral":
                return new StrVal(astNode.value);

            case "ListLiteral":
                return new ListVal(astNode.values.map(val => evaluate(val, env, programs)));

            case "Ident":
                func = eval_ident;
                break;

            case "ObjLiteral":
                func = eval_obj_expr;
                break;
            

            //-------------------------------------//
            case "AssignExpr":
                func = eval_assign;
                break;

            case "BinAssignExpr":
                func = eval_bin_assign;
                break;

            case "CallExpr":
                func = eval_call_expr;
                break;

            case 'MemberExpr':
                func = eval_member_expr;
                break;


            case "RetExpr":
                func = eval_ret_expr;
                break;

            case 'ImportExpr':
                func = eval_import_expr;
                break;
            

            //-------------------------------------//
            case "BinaryExpr":
                func = eval_bin_expr;
                break;

            case "LogicExpr":
                func = eval_logic_expr;
                break;

            case "NotExpr":
                func = eval_not_expr;
                break;
            

            //-------------------------------------//
            case "IfExpr":
                func = eval_if_expr;
                break;

            case "ElifExpr":
                func = eval_elif_expr;
                break;

            case "ElseExpr":
                func = eval_else_expr;
                break;

            case "ForExpr":
                func = eval_for_expr;
                break;

            case "WhileExpr":
                func = eval_while_expr;
                break;
            

            //-------------------------------------//
            case "VarDecl":
                func = eval_var_decl;
                break;

            case "VarDeclMult":
                func = eval_var_decl_mult;
                break;

            case "FuncDecl":
                func = eval_func_decl;
                break;
                
            case "ArrowFuncDecl":
                func = eval_arrow_func_decl;
                break;    
        }
        return func(astNode, env, programs);
    }
    catch(e){
        if(astNode.kind != 'Program'){
            console.log('something went wrong at this stmt');
            logs(astNode);
        }
        throw e;
    }
}