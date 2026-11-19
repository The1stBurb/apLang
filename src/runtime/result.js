
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
        this.success(value);
        this.func_ret = true;
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
    for(let i = start; i >= Math.max(start - 50, 0); i--){
        if(src[i] == '\n'){
            start = i;
            break;
        }
    }
    for(let i = end; i <= Math.min(end + 50, src.length - 1); i++){
        if(src[i] == '\n'){
            end = i;
            break;
        }
    }
    let s = src.substring(start + 1, end);
    return s += '\n      ' + ' '.repeat(s.indexOf(sub)) + '^'.repeat(sub.length);
}