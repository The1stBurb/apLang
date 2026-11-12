export function logs(...args){
    args.forEach((arg)=>{
        if(typeof arg === 'object' && arg != null) console.dir(arg, {depth: null, colors: true, customInspect: true});
        else{
            console.log(arg);
        }
    })
}