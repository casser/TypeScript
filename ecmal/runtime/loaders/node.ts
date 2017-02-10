import {Loader} from "./base";

export class NodeLoader extends Loader {
    constructor(){
        super();
        Object.defineProperty(system,'loader',{
            configurable:true,
            value:this
        });
        var nodeModules = [];
        Object.keys(system.modules).forEach((k) =>{
            system.modules[k].requires.forEach((k) =>{
                if (k.indexOf('node/') == 0 && nodeModules.indexOf(k)<0) {
                    nodeModules.push(k);
                }
            });
        });
        if (nodeModules.length) {
            nodeModules.forEach((k)=>{
                this.evalModule(k, system.url, this.nodeModule(k));
            });
            this.doDefineModules();
        }
    }

    private static get fs():any {
        return Object.defineProperty(this,'fs',<any>{
            value:system.node.require('fs')
        }).fs;
    }
    private static get vm():any {
        return Object.defineProperty(this,'vm',<any>{
            value:system.node.require('vm')
        }).vm;
    }

    protected get runtime():string {
        return __filename;
    }
    protected detectRoot(){
        Object.defineProperty(system,'url',{
            enumerable      : true,
            configurable    : false,
            writable        : false,
            value           : this.runtime
        });
    }
    protected loadModule(id:string,url:string):Promise<any>{
        return new Promise<any>((accept,reject)=>{
            if(id.indexOf('node/')==0){
                this.evalModule(id,url,this.nodeModule(id))
                accept(this.registrations[id]||system.module[id])
            }else{
                NodeLoader.fs.readFile(url, 'utf8', (err, data)=> {
                    this.evalModule(id,url,data.toString())
                    if (err) {
                        reject(err)
                    } else {
                        accept(this.registrations[id]||system.module[id])
                    }
                });
            }
        });
    }
    protected nodeModule(id){
        return `system.register("${id}",[], function(system,module) {
            __export(name,system.node.require("${id.substr(5)}"))
        })`
    }
    protected evalModule(id:string,url:string,data:string){
        NodeLoader.vm.runInThisContext(data,{
            filename : url
        });
    }
}

