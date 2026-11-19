
export class RuntimeResult{
    constructor(name){
        /** @type {Error} */this.error = null;
        /** @type {RuntimeVal} */this.value = null;
        this.name = name;
        this.func_ret = false;
    }
    success(value, ret){
        if(value instanceof RuntimeResult){ throw new Error('this no allowed'); }
        this.reset();

        this.value = value;
        this.func_ret = ret ?? false;
        return this;
    }
    success_ret(value){
        this.success(value, true);
        return this;
    }

    failure(error){
        this.reset();

        this.error = error;
        return this;
    }

    check(res){
        if(res.error) return this.failure(res.error);
        return this.success(res.value, res.func_ret);
    }
    check_ret(res){
        if(res.error) return this.failure(res.error);
        return this.success_ret(res.value);
    }

    reset(){
        this.error = null;
        this.value = null;
        this.func_ret = false;
    }

    repr(srcCode){
        console.log('Runtime Result: ')
        if(this.error){
            console.log('  Error:', this.error.msg);
            console.log('  At:', printSection(srcCode, this.error.pos.start, this.error.pos.end));
            console.log('  Traceback:', this.error.traceback().join('\n  '));
        }
        else{
            console.log('  Value:', this.value)
        }
    }
}
export function RuntimeRes(name){ return new RuntimeResult(name); }

export function RuntimeFail(error){ return new RuntimeResult().failure(error); }
export function RuntimeSucc(value){ return new RuntimeResult().success(value); }


export class RuntimeError{
    constructor(message, pos, env){
        this.msg = message;
        this.pos = pos;
        this.env = env;
    }
    new_loc(name){
        this.loc.push(name);
        return this;
    }
    traceback(){
        const traces = [];
        let env = this.env;
        while(env){
            traces.push(`${env.name} at index ${env.pos.line}`);
            env = env.parent;
        }
        return traces;
    }
}

/**
 * @param {string} message
 * @param {Position} location
 */
export function RuntimeErr(message, pos, env){ return new RuntimeError(message, pos, env); }


function printSection(src, start, end){
    let sub = src.substring(start, end + 1);
    let ss, se;
    for(let i = start; i >= Math.max(start - 50, 0); i--){
        if(src[i] == '\n'){
            ss = i;
            break;
        }
    }
    if(!ss)ss = Math.max(start - 50, 0)
    for(let i = end; i <= Math.min(end + 50, src.length - 1); i++){
        if(src[i] == '\n'){
            se = i;
            console.log(src[i].replaceAll('\n', '\\n'), i)
            break;
        }
    }
    if(!se)se = Math.min(end + 50, src.length - 1);
    let s = src.substring(ss + 1, se);
    return s += '\n      ' + ' '.repeat(s.indexOf(sub)) + '^'.repeat(sub.length);
}