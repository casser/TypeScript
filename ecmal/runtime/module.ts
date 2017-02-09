import {Class} from "./reflect/class";
import {Interface} from "./reflect/interface";
import {Declaration} from "./reflect/declaration";

const REFLECT = Symbol('reflection');

declare global {
    interface Module extends Declaration {
        name:string;
        url: string;
        requires: string[];
        members: any;
        exports: any;
        parent: Module;
    }
}

export interface ModuleMap {
    [name:string]:Module;
}

export class Module extends Declaration implements Module {
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
    /**
     * @internal
     */
    static extend(a,b){
        return Class.extend(a,b);
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
        super(name);
        this.requires = requires;
        this.members = Object.create(null);
        this.exports = Object.create(null);
        this.exports[REFLECT] = this;
        this.definer = definer(system,this,system['jsx']);
    }
    /**
     * @internal
     */
    public define(type,value){
        value.__reflection = {type:type,module:this};
        switch(type){
            case 'class'    :
                this.members[value.name] = value;
                break;
            case 'function' :
                this.members[value.name] = value;
                break;
            case 'enum'     :
                this.members[value.constructor.name] = value;
                break;
            case 'interface' :
                this.members[value] = new Interface(this,value);
                this.exports[value] = this.members[value];
                break;
        }
    }
    private __export(name,value){
        Object.defineProperty(this.exports,name,{
            configurable    : true,
            value           : value
        })
    }
    private __exportAll(obj){
        Object.getOwnPropertyNames(obj).forEach(k=>{
            Object.defineProperty(this.exports,k,Object.getOwnPropertyDescriptor(obj,k));
        })
    }
    private __extends(d:Function, b:Function) {
        if(b){
            Object.setPrototypeOf(d, b);
            Object.setPrototypeOf(d.prototype, b.prototype);
        }
        Object.defineProperty(d.prototype, 'constructor', {
            configurable    : true,
            value           : d
        });
    }
    private __awaiter(thisArg, _arguments, P, generator) {
        return new Promise(function (resolve, reject) {
            function fulfilled(value) {
                try { 
                    step(generator.next(value)); 
                } catch (e) {
                    reject(e); 
                }
            }
            function rejected(value) { 
                try { 
                    step(generator["throw"](value)); 
                } catch (e) { 
                    reject(e); 
                } 
            }
            function step(result) {
                result.done ? resolve(result.value) : new Promise(function (resolve) {
                    resolve(result.value); 
                }).then(fulfilled, rejected); 
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    private __generator(thisArg, body) {
        var _:any = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
        return { next: verb(0), "throw": verb(1), "return": verb(2) };
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    private __class(target,init){
        if(typeof init=='function'){
            init();
        }
    }
    private __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect['decorate'] === "function") r = Reflect['decorate'](decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    private __metadata(k, v) {
        if (typeof Reflect === "object" && typeof Reflect['metadata'] === "function") return Reflect['metadata'](k, v);
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


