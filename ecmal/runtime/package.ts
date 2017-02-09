interface Module {}
interface System {}

declare var module : Module;
/**
 * @internal
 */
declare var global,process,require,__filename:string,__dirname:string;
var system:System = <any> Object.create({
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
        var executed = false;
        if(!this.modules){
            this.started = Date.now();
            this.modules = Object.create(null);
            initNodeJsDefaults();
            if(typeof setTimeout=='function'){
                setTimeout(bootstrap);
            }
        }
        this.modules[name] = {name,requires,definer};
        return bootstrap;
        function initNodeJsDefaults(){
            if(
                typeof module  != 'undefined' &&
                typeof global  != 'undefined' &&
                typeof process != 'undefined'
            ){
                global.system = system;
                global.__dirname = __dirname;
                global.__filename = __filename;
                global.process = process;
                system.node     = {
                    module      : module,
                    require     : require,
                    process     : process,
                    dirname     : __dirname,
                    filename    : __filename
                };
            }
        }
        function executeModule(name,system):any{
            var m = system.modules[name];
            if(m.definer){
                var definer = m.definer;
                delete m.definer;
                if(m.requires && m.requires.length){
                    m.requires.forEach((r,i)=>{
                        definer.setters[i](executeModule(r,system));
                    });
                }
                definer.execute();
                delete m.init;
            }
            return m.exports;
        }
        function createModule(system,m){
            var module:any = Object.create({
                __class(target,parent,initializer){
                    return target;
                },
                __export(name,value){
                    Object.defineProperty(this.exports,name,{
                        configurable    : true,
                        value           : value
                    })
                },
                __exportAll(obj){
                    Object.getOwnPropertyNames(obj).forEach(k=>{
                        Object.defineProperty(this.exports,k,Object.getOwnPropertyDescriptor(obj,k));
                    })
                },
                __extends(d:Function, b:Function) {
                    if(b){
                        Object.setPrototypeOf(d, b);
                        Object.setPrototypeOf(d.prototype, b.prototype);
                    }
                    Object.defineProperty(d.prototype, 'constructor', {
                        configurable    : true,
                        value           : d
                    });
                }            
            });
            module.name      = m.name;
            module.exports   = Object.create(null);
            module.requires  = m.requires;
            module.definer   = m.definer(system,module);
            return module;
        }
        function bootstrap(process){
            if(executed){
                return;
            }
            executed=true;
            var modules = system.modules;
            for(let n in modules){
                modules[n] = createModule(system,modules[n]);
            }
            let Module = executeModule('runtime/module', system).Module;
            let System = executeModule('runtime/system', system).System;
            Object.setPrototypeOf(system,System.prototype);
            for(let n in modules){
                executeModule(n,system)
            }
            for(let n in modules){
                Object.setPrototypeOf(modules[n],Module.prototype);
            }
            System.call(system,process);
        }
    }
});
