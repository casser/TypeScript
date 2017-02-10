/// <reference path="internals.ts"/>

interface Module {

}
interface System {
    started:Date;
    modules:{[name:string]:Module}
    register(name,requires,definer);
}

declare var module : Module;
var system : System = <any> Object.create({
    import(module):Promise<any>{
        return this.init().then((cb)=>{
            return this.loader.import(module).then(
                m=>{
                    cb(true);
                    return m;
                },
                e=>{
                    cb(false);
                    throw e;
                }
            );
        })
    },
    init():Promise<any>{
        return new Promise((accept,reject)=>{
            if(!this.promises){
                this.promises = [{accept,reject}]
            }else{
                this.promises.push({accept,reject});
            }
        })
    },
    on(event,callback){
        if(!this.events){
            this.events = {};
        }
        this.events[event] = callback;
    },
    register(name,requires,definer){
        __module(name,requires,definer);
    }
});

