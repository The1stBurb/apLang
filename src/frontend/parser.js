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
    /** @returns {Token} */
    posat(){ return this.toks[0].pos; }

    produceAST(sourceCode){
        this.toks = tokenize(sourceCode);
        // console.log(this.toks, `'${sourceCode.substring(285, 293 + 1)}'`);

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
        const start_pos = this.eat().pos;
        
        const loc = this.expect([TokType.Str, TokType.Ident], 'Expected String or Identity');

        const end_pos = this.expect(TokType.Semicolon, 'Expected Semicolon').pos;
        return new ImportExpr(loc)
            .set_pos(start_pos, end_pos);
    }

    parse_for_expr(){
        const start = this.eat().pos;

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
        const end = this.expect(TokType.rBrace, "expected right brace to end for loop").pos;

        return new ForExpr(init, logic, inc, body)
            .set_pos(start, end);
    }

    parse_while_expr(){
        const start = this.eat().pos;

        this.expect(TokType.lPara, "Expected open para");
        const logic = this.parse_bool_expr();
        this.expect(TokType.rPara, "expected close para");

        this.expect(TokType.lBrace, "expected open brace");
        const body = [];
        while(this.not_eof() && this.at().type != TokType.rBrace){
            body.push(this.parse_stmt());
        }
        const end = this.expect(TokType.rBrace, "expected right brace to end for loop").pos;

        return new WhileExpr(logic, body)
            .set_pos(start, end);
    }

    parse_if_expr(){
        const start = this.eat().pos;
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
        const end = this.posat().start - 1;
        
        return new IfExpr(logic, body, elifs, else_)
            .set_pos(start, end);
    }
    parse_elif_expr(){
        const start = this.expect(TokType.Elif, 'An elif should begin in an elif token!!!').pos;
        this.expect(TokType.lPara, 'elif requires left Para');

        const logic = this.parse_expr();
        this.expect(TokType.rPara,'expected right para after elif logic');
        this.expect(TokType.lBrace, 'Expected a left brace after logic elif');
        
        const body = [];
        while(this.not_eof() && this.at().type != TokType.rBrace){
            body.push(this.parse_stmt());
        }
        const end = this.expect(TokType.rBrace, 'Elif should end in a right brace').pos;
        
        return new ElifExpr(logic, body)
            .set_pos(start, end);
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
        const start = this.eat().pos;

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
            const end = this.expect(TokType.Semicolon, "expected semicolon after arrow func").pos;
            return new ArrowFuncDecl(name, params, val)
                .set_pos(start, end);
        }
        else{
            this.expect(TokType.lBrace, "expected lBrace followng func def");
            const body = [];
            while(this.not_eof() && this.at().type != TokType.rBrace){
                body.push(this.parse_stmt());
            }
            const end = this.expect(TokType.rBrace, "expected rBrace to end func def").pos;
            return new FuncDecl(name, params, body)
                .set_pos(start, end);
        }
    }

    parse_ret_expr(){
        const start = this.expect(TokType.Ret, "Expected Return token!").pos;
        let value = null;
        if(!this.isat(TokType.Semicolon)) value = this.parse_expr();

        const end = this.expect(TokType.Semicolon, "Expected semicolon!").pos;
        return new RetExpr(value)
            .set_pos(start, end);
    }

    parse_var_decl(){
        const start = this.posat(),
            isConst = this.eat().type == TokType.Const,
            decls = [];

        while(this.not_eof()){
            const ident = this.expect(TokType.Ident, "expected ident after var decl");

            if(this.isat(TokType.Semicolon)){
                const end = this.eat().pos;
                if(isConst){ throw new Error('const needs a value'); }
                decls.push(new VarDecl(false, ident.value) .set_pos(ident.pos, end))

                break;
            }
            else if(this.isat(TokType.Comma)){
                const end = this.eat().pos;
                if(isConst){ throw new Error('const needs a value'); }

                decls.push(new VarDecl(false, ident.value)) .set_pos(ident.pos, end);
            }
            else{
                this.expect(TokType.Eq, 'Expected tok "=" after Identifier Token');

                const value = this.parse_expr();

                const tok = this.expect([TokType.Comma, TokType.Semicolon], 'Expected tok "," or ";" after Value Token for Variable Decleration.');

                decls.push( new VarDecl(isConst, ident.value, value) .set_pos(start, tok.pos) );
                if(tok.type == TokType.Semicolon){ break; }
            }

        }
        if(decls.length == 1){ return decls[0]; }
        else{ return new VarDeclMult(decls)
            .set_pos(start, this.posat().start - 1); }return new VarDeclMult(decls);
    }

    parse_expr(){ return this.parse_assign_expr(); }
    parse_assign_expr(){
        const start = this.posat();

        const left = this.parse_obj_expr();

        if(this.isat(TokType.Eq)){
            const end = this.eat().pos;
            return new AssignExpr(left, this.parse_assign_expr())
                .set_pos(start, end);
        }
        else if(this.isat(TokType.BinEq)){
            const tok = this.eat();
            return new BinAssignExpr(left, tok.value, this.parse_assign_expr())
                .set_pos(start, tok.pos);
        }

        return left;
    }

    parse_obj_expr(){
        if(this.isat(TokType.lBrack)) return this.parse_list_expr();
        if(!this.isat(TokType.lBrace)) return this.parse_maths_expr();

        const start = this.eat().pos;
        const props = [];
        
        while(this.not_eof() && !this.isat(TokType.rBrace)){
            const key = this.expect(TokType.Ident, "expected literal key");

            if(this.isat(TokType.Comma)){
                this.eat();
                props.push(new Property(key.value)).set_pos(key.pos, key.pos);
                continue;
            }
            else if(this.isat(TokType.rBrace)){
                props.push(new Property(key.value)).set_pos(key.pos, key.pos);
                continue;
            }

            this.expect(TokType.Colon, "expects a colon after literl key");
            const value = this.parse_expr();
            props.push(new Property(key.value, value).set_pos(key.pos, this.posat()));
            if(!this.isat(TokType.rBrace)) this.expect(TokType.Comma, "Needs comma after obj key value pair");
        }

        const end = this.expect(TokType.rBrace, "needs rBrace to end obj").pos;
        return new ObjLiteral(props)
            .set_pos(start, end);
    }

    parse_list_expr(){
        const start = this.expect(TokType.lBrack, 'there *really* should be an [ here!').pos;
        
        const values = this.parse_args_list();
        
        const end = this.expect(TokType.rBrack, 'Lists should end in brackets!').pos;
        return new ListLiteral(values)
            .set_pos(start, end);
    }
    
    parse_maths_expr(){ return this.parse_logic_or_expr(this); }

    
    parse_logic_or_expr(loc){
        let left = this.parse_logic_and_expr();

        const start = left.pos;
        while(this.at().value == '||'){
            left = new LogicExpr(left, this.eat().value, this.parse_logic_and_expr())
                .set_pos(start, this.posat());
        }
        return left;
    }
    parse_logic_and_expr(loc){
        let left = this.parse_logic_expr();

        const start = left.pos;
        while(this.at().value == '&&'){
            left = new LogicExpr(left, this.eat().value, this.parse_logic_expr())
                .set_pos(start, this.posat());
        }
        return left;
    }
    parse_not_large_expr(){
        if(this.isat(TokType.Not)){
            const start = this.eat().pos;
            return new NotExpr(this.parse_not_large_expr())
                .set_pos(start, this.posat());
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
                .set_pos(left.pos, this.posat());
        }
        return left;
        
    }

    parse_add_expr(){
        let left = this.parse_mult_expr();
        while(this.at().value == "+" || this.at().value == "-"){
            left = new BinaryExpr(left, this.eat().value, this.parse_mult_expr())
            .set_pos(left.pos, this.posat());
        }
        return left;
    }

    parse_mult_expr(){
        let left = this.parse_not_small_expr();
        while(this.at().value == "*" || this.at().value == "/" || this.at().value == "%"){
            left = new BinaryExpr(left, this.eat().value, this.parse_not_small_expr())
                .set_pos(left.pos, this.posat());
        }
        return left;
    }

    parse_not_small_expr(){
        if(this.isat(TokType.Not)){
            const start = this.eat().pos;
            return new NotExpr(this.parse_not_small_expr())
                .set_pos(start, this.posat());
        }
        return this.parse_call_member_expr();
    }
    parse_call_member_expr(){
        const member = this.parse_member_expr();
        if(this.isat(TokType.lPara)) return this.parse_call_expr(member);
        return member;
    }

    parse_call_expr(caller){
        let call_expr = new CallExpr(caller, this.parse_args())
            .set_pos(caller.pos, this.posat());
        
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
            obj = new MemberExpr(obj, prop, comp)
                .set_pos(obj.pos, this.posat());
        }
        return obj;
    }

    parse_primary_expr(){
        const tk = this.at().type;
        const start = this.posat();
        switch(tk){
            case TokType.Ident:
                return new Ident(this.eat().value)
                    .set_pos(start, start);
            case TokType.Num:
                return new NumLiteral(parseFloat(this.eat().value))
                    .set_pos(start, start);
            case TokType.Str:
                return new StrLiteral(this.eat().value)
                    .set_pos(start, start);

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