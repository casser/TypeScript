import {Emitter} from "./events";

const REFLECT = Symbol('reflection');

declare global {
    interface Module extends Emitter {
        name:string;
        url: string;
        requires: string[];
        members: any;
        exports: any;
        parent: Module;
    }
}

export class Module extends Emitter implements Module {
    /**
     * @internal
     */
    static add(name,requires,definer):Module{
        var m = new Module(name,requires,definer);
        Object.defineProperty(system.modules,name,{
            writable     : false,
            enumerable   : true,
            configurable : false,
            value        : m
        });
        system.emit('module',m);
        return m;
    }
    /**
     * @internal
     */
    static get(name):Module{
        return <Module>system.modules[name];
    }

    public name:string;
    public url:string;
    public requires:string[];
    public members:any;
    public exports:any;
    public parent:Module;

    /**
     * @internal
     */
    public definer:any;
    /**
     * @internal
     */
    public constructor(name,requires,definer){
        super();
        this.name = name;
        this.requires = requires;
        this.members = Object.create(null);
        this.exports = Object.create(null);
        this.exports[REFLECT] = this;
        this.definer = definer(system,this,system['jsx']);
    }
    

    /**
     * @internal
     */
    public execute(){
        if(this.definer){
            var definer = this.definer;
            delete this.definer;
            if(this.requires && this.requires.length){
                this.requires.forEach((r,i)=>{
                    var m:Module = Module.get(r);
                    if(m && m.execute){
                        definer.setters[i](m.execute());
                    }
                });
            }
            try{
                definer.execute();
                this.emit('execute');
            }catch(ex){
                var error = new Error(`module "${this.name}" execution error`);
                error.stack +=`\ncause : \n${ex.stack}`;
                throw error;
            }
        }
        return this.exports;
    }
    public toString(){
        return `Module(${this.name})`
    }
    private inspect(){
        return this.toString();
    }
}


