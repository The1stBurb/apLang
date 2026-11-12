import {
    Stmt, Program,
    VarDecl, VarDeclMult, FuncDecl, ArrowFuncDecl, 

    Expr, AssignExpr, BinAssignExpr, CallExpr, MemberExpr, RetExpr, ImportExpr,
    BinaryExpr, LogicExpr, NotExpr, BoolExpr,
    IfExpr, ElifExpr, ElseExpr, ForExpr, WhileExpr,

    Ident, NumLiteral, StrLiteral, Property, ObjLiteral, ListLiteral,
} from "./ast.js";
import { Token, tokenize, TokType } from './lexer.js';
import { logs } from '../helps.js';

export default class Parser{
    constructor(){
        /** @type {Token[]} */this.toks = [];
        /** @type {Program} */this.program;
    }

    not_eof(){ return this.toks.length!=0 && this.toks[0].type != TokType.EOF; }
    /** @returns {Token} */
    at(){ return this.toks[0]; }
    /** @returns {Token} */
    eat(){ return this.toks.shift(); }
    /**
     * @param {TokType} type, @param {string} err
     * @returns {Token}
    */
    expect(type, err){
        const t = this.eat();
        if(!t || 
            !(typeof type === 'object' ? type.includes(t.type) : t.type == type )
        ){
            console.log('toks:',this.toks);
            throw ['prarse err:\n', err, 'expected', type, 'but got', t.type].join(' ');

        }
        return t;
    }
    isat(type){ return this.at().type == type; }

    produceAST(sourceCode){
        this.toks = tokenize(sourceCode);
        this.program = new Program([]);
        while(this.not_eof()){
            this.program.body.push(this.parse_stmt());
            if(this.isat(TokType.Semicolon)){
                this.eat();
            }
        }

        return this.program;
    }

    parse_stmt(){
        switch(this.at().type){
            case TokType.Let: case TokType.Const: case TokType.Int: case TokType.String: case TokType.List:
                return this.parse_var_decl();
            
            case TokType.Func:
                return this.parse_func_decl();
            case TokType.Ret:
                return this.parse_ret_expr();
            
            case TokType.If:
                return this.parse_if_expr();
            
            case TokType.Import:
                return this.parse_import_expr();
            
            case TokType.For:
                return this.parse_for_expr();
            case TokType.While:
                return this.parse_while_expr();
            
            default:
                return this.parse_expr();
        }
    }

    parse_import_expr(){
        this.eat();
        const loc = this.expect([TokType.Str, TokType.Ident], 'Expected String or Identity');
        this.expect(TokType.Semicolon, 'Expected Semicolon')
        return new ImportExpr(loc);
    }

    parse_for_expr(){
        this.eat();

        this.expect(TokType.lPara, "Expected open para");

        const init = this.parse_var_decl();
        
        const logic = this.parse_bool_expr();
        this.expect(TokType.Semicolon, "expected semicolon");

        const inc = this.parse_assign_expr();
        this.expect(TokType.rPara, "expected close para");

        this.expect(TokType.lBrace, "expected open brace");
        const body = [];
        while(this.not_eof() && this.at().type != TokType.rBrace){
            body.push(this.parse_stmt());
        }
        this.expect(TokType.rBrace, "expected right brace to end for loop");

        return new ForExpr(init, logic, inc, body);
    }

    parse_while_expr(){
        this.eat();

        this.expect(TokType.lPara, "Expected open para");
        const logic = this.parse_bool_expr();
        this.expect(TokType.rPara, "expected close para");

        this.expect(TokType.lBrace, "expected open brace");
        const body = [];
        while(this.not_eof() && this.at().type != TokType.rBrace){
            body.push(this.parse_stmt());
        }
        this.expect(TokType.rBrace, "expected right brace to end for loop");

        return new WhileExpr(logic, body);
    }

    parse_if_expr(){
        this.eat();
        this.expect(TokType.lPara, 'if requires left Para');

        const logic = this.parse_expr();
        this.expect(TokType.rPara,'expected right para after if logic');
        this.expect(TokType.lBrace, 'Expected a left brace after logic if');
        
        const body = [];
        while(this.not_eof() && this.at().type != TokType.rBrace){
            body.push(this.parse_stmt());
        }
        this.expect(TokType.rBrace, 'If should end in a right brace');

        const elifs = [];
        while(this.not_eof() && this.isat(TokType.Elif)){
            elifs.push(this.parse_elif_expr());
        }

        let else_ = [];
        if(this.isat(TokType.Else)){ else_ = this.parse_else_expr(); }
        
        return new IfExpr(logic, body, elifs, else_);
    }
    parse_elif_expr(){
        this.expect(TokType.Elif, 'An elif should begin in an elif token!!!');
        this.expect(TokType.lPara, 'elif requires left Para');

        const logic = this.parse_expr();
        this.expect(TokType.rPara,'expected right para after elif logic');
        this.expect(TokType.lBrace, 'Expected a left brace after logic elif');
        
        const body = [];
        while(this.not_eof() && this.at().type != TokType.rBrace){
            body.push(this.parse_stmt());
        }
        this.expect(TokType.rBrace, 'Elif should end in a right brace');
        
        return new ElifExpr(logic, body);
    }
    parse_else_expr(){
        this.expect(TokType.Else, 'An else should begin in an else token!!!');
        this.expect(TokType.lBrace, 'Expected a left brace after else');

        const body = [];
        while(this.not_eof() && this.at().type != TokType.rBrace){
            body.push(this.parse_stmt());
        }
        this.expect(TokType.rBrace, 'Else should end in a right brace');

        return body;
    }

    parse_func_decl(){
        this.eat();

        const name = this.expect(TokType.Ident, "Expected Ident after func decl").value;
        const args = this.parse_args();
        const params = [];
        for(const arg of args){
            if(arg.kind != 'Ident' && arg.kind != 'AssignExpr'){
                console.log(arg);
                throw "expected ident as an arg";
            }
            params.push(arg.symbol);
        }
        if(this.isat(TokType.Arrow)){
            this.eat();
            const val = this.parse_expr();
            this.expect(TokType.Semicolon, "expected semicolon after arrow func");
            return new ArrowFuncDecl(name, params, val);
        }
        else{
            this.expect(TokType.lBrace, "expected lBrace followng func def");
            const body = [];
            while(this.not_eof() && this.at().type != TokType.rBrace){
                body.push(this.parse_stmt());
            }
            this.expect(TokType.rBrace, "expected rBrace to end func def");
            return new FuncDecl(name, params, body);
        }
    }

    parse_ret_expr(){
        this.expect(TokType.Ret, "Expected Return token!");
        let value = null;
        if(!this.isat(TokType.Semicolon)) value = this.parse_expr();

        this.expect(TokType.Semicolon, "Expected semicolon!");
        return new RetExpr(value);
    }

    parse_var_decl(){
        const isConst = this.eat().type == TokType.Const;
        const decls = [];

        while(this.not_eof()){
            const ident = this.expect(TokType.Ident, "expected ident after var decl").value;

            if(this.isat(TokType.Semicolon)){
                this.eat();
                if(isConst){ throw new Error('const needs a value'); }
                decls.push(new VarDecl(false, ident));

                break;
            }
            else if(this.isat(TokType.Comma)){
                this.eat();
                if(isConst){ throw new Error('const needs a value'); }

                decls.push(new VarDecl(false, ident));
            }
            else{
                this.expect(TokType.Eq, 'Expected tok "=" after Identifier Token');

                decls.push( new VarDecl(isConst, ident, this.parse_expr()) );

                const tok = this.expect([TokType.Comma, TokType.Semicolon], 'Expected tok "," or ";" after Value Token for Variable Decleration.').type;
                if(tok == TokType.Semicolon){ break; }
            }

        }
        if(decls.length == 1){ return decls[0]; }
        else{ return new VarDeclMult(decls); }return new VarDeclMult(decls);
    }

    parse_expr(){ return this.parse_assign_expr(); }
    parse_assign_expr(){
        const left = this.parse_obj_expr();

        if(this.isat(TokType.Eq)){
            this.eat();
            return new AssignExpr(left, this.parse_assign_expr());
        }
        else if(this.isat(TokType.BinEq)){
            return new BinAssignExpr(left, this.eat().value, this.parse_assign_expr());
        }

        return left;
    }

    parse_obj_expr(){
        if(this.isat(TokType.lBrack)) return this.parse_list_expr();
        if(!this.isat(TokType.lBrace)) return this.parse_maths_expr();

        this.eat();
        const props = [];
        
        while(this.not_eof() && !this.isat(TokType.rBrace)){
            const key = this.expect(TokType.Ident, "expected literal key").value;

            if(this.isat(TokType.Comma)){
                this.eat();
                props.push(new Property(key));
                continue;
            }
            else if(this.isat(TokType.rBrace)){
                props.push(new Property(key));
                continue;
            }

            this.expect(TokType.Colon, "expects a colon after literl key");
            const value = this.parse_expr();
            props.push(new Property(key, value));
            if(!this.isat(TokType.rBrace)) this.expect(TokType.Comma, "Needs comma after obj key value pair");
        }

        this.expect(TokType.rBrace, "needs rBrace to end obj");
        return new ObjLiteral(props);
    }

    parse_list_expr(){
        this.expect(TokType.lBrack, 'there *really* should be an [ here!');
        const values = this.parse_args_list();
        this.expect(TokType.rBrack, 'Lists should end in brackets!');
        return new ListLiteral(values);
    }
    
    parse_maths_expr(){ return this.parse_logic_or_expr(this); }

    
    parse_logic_or_expr(loc){
        let left = this.parse_logic_and_expr();
        while(this.at().value == '||'){
            left = new LogicExpr(left, this.eat().value, this.parse_logic_and_expr())
        }
        return left;
    }
    parse_logic_and_expr(loc){
        let left = this.parse_logic_expr();
        while(this.at().value == '&&'){
            left = new LogicExpr(left, this.eat().value, this.parse_logic_expr())
        }
        return left;
    }
    parse_not_large_expr(){
        if(this.isat(TokType.Not)){
            this.eat();
            return new NotExpr(this.parse_not_large_expr());
        }
        return this.parse_logic_expr();
    }
    parse_logic_expr(){
        return this.parse_bool_expr();
    }

    parse_bool_expr(){
        let left = this.parse_add_expr();
        while(this.at().value == ">" || this.at().value == "<" || this.at().value == '>=' || this.at().value == '<=' || this.at().value == '==' || this.at().value == '!='){
            left = new BinaryExpr(left, this.eat().value, this.parse_add_expr())
        }
        return left;
        
    }

    parse_add_expr(){
        let left = this.parse_mult_expr();
        while(this.at().value == "+" || this.at().value == "-"){
            left = new BinaryExpr(left, this.eat().value, this.parse_mult_expr());
        }
        return left;
    }

    parse_mult_expr(){
        let left = this.parse_not_small_expr();
        while(this.at().value == "*" || this.at().value == "/" || this.at().value == "%"){
            left = new BinaryExpr(left, this.eat().value, this.parse_not_small_expr())
        }
        return left;
    }

    parse_not_small_expr(){
        if(this.isat(TokType.Not)){
            this.eat();
            return new NotExpr(this.parse_not_small_expr());
        }
        return this.parse_call_member_expr();
    }
    parse_call_member_expr(){
        const member = this.parse_member_expr();
        if(this.isat(TokType.lPara)) return this.parse_call_expr(member);
        return member;
    }

    parse_call_expr(caller){
        let call_expr = new CallExpr(caller, this.parse_args());
        
        if(this.isat(TokType.lPara)) call_expr = this.parse_call_expr(call_expr);
        return call_expr;
    }

    parse_args(){
        this.expect(TokType.lPara, "Expected open para");
        const args = this.isat(TokType.rPara) ? [] : this.parse_args_list();

        this.expect(TokType.rPara, "expeceted close para");

        return args;
    }
    parse_args_list(){
        const args = [this.parse_assign_expr()];
        while(this.not_eof() && this.isat(TokType.Comma) && this.eat()){
            args.push(this.parse_assign_expr());
        }
        return args;
    }

    parse_member_expr(){
        let obj = this.parse_primary_expr();
        while(this.not_eof() && (this.isat(TokType.Dot) || this.isat(TokType.lBrack))){
            const oper = this.eat();
            let prop, comp;
            if(oper.type == TokType.Dot){
                comp = false;
                prop = this.parse_primary_expr();
                
                if(prop.kind != "Ident"){
                    throw "cannot use dot operator without right hand beign a dot";
                }
            }
            else{
                comp = true;
                prop = this.parse_expr();
                this.expect(TokType.rBrack, "expected right bracket");
            }
            obj = new MemberExpr(obj, prop, comp);
        }
        return obj;
    }

    parse_primary_expr(){
        const tk = this.at().type;

        switch(tk){
            case TokType.Ident:
                return new Ident(this.eat().value);
            case TokType.Num:
                return new NumLiteral(parseFloat(this.eat().value));
            case TokType.Str:
                return new StrLiteral(this.eat().value);

            case TokType.lPara:
                this.eat();
                const value = this.parse_expr();
                this.expect(TokType.rPara, "expected right para");
                return value;
            // case TokType.Semicolon:
                // this.eat();
                // break;

            default:
                logs(this.program, this.toks);
                throw "unexpeceted error token found during parsing" + JSON.stringify(this.at());
        }
    }
};