/**
 * @internal
 */
declare var global,process,require,__filename:string,__dirname:string;

/**
 * @internal
 */
function __module(name,requires,definer){
    if(system.started){
        system.register(name,requires,definer)
    }
    var modules = system.modules;
    var executed = false;
    if(!modules){
        modules = Object.create(null);
        system.modules = modules;
        initNodeJsDefaults();
        if(typeof setTimeout=='function'){
            setTimeout(bootstrap);
        }
    }
    modules[name] = <any>{name,requires,definer};
    return bootstrap;
    function initNodeJsDefaults(){
        if(
            typeof module  != 'undefined' &&
            typeof global  != 'undefined' &&
            typeof process != 'undefined'
        ){
            global.system       = system        ;
            global.process      = process       ;
            global.__dirname    = __dirname     ;
            global.__filename   = __filename    ;
            global.__module     = __module      ;
            global.__export     = __export      ;
            global.__extends    = __extends     ;
            global.__class      = __class       ;
            global.__awaiter    = __awaiter     ;
            global.__generator  = __generator   ;
            global.__decorate   = __decorate    ;
            global.__metadata   = __metadata    ;
            system.node     = {
                module      : module,
                require     : require,
                process     : process,
                dirname     : __dirname,
                filename    : __filename,               
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
        var module:any = Object.create({});
        module.name      = m.name;
        module.exports   = Object.create(null);
        module.requires  = m.requires;
        module.definer   = m.definer(system,module);
        return module;
    }
    function bootstrap(){
        if(executed){
            return;
        }
        executed=true;
        system.started = new Date();
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
        System.call(system);
    }
}
/**
 * @internal
 */
function __export(module,key,value){
    if(module && module.exports){
        if(typeof key == 'string'){
            module.exports[key] = value;
        } else
        if(typeof key == 'object'){
            for(var i in key){
                __export(module,i,key[i]);
            }
        }
    }
}
/**
 * @internal
 */
function __extends(d:Function, b:Function) {
    if(b){
        Object.setPrototypeOf(d, b);
        Object.setPrototypeOf(d.prototype, b.prototype);
    }
    Object.defineProperty(d.prototype, 'constructor', {
        configurable    : true,
        value           : d
    });
}
/**
 * @internal
 */   
function __class(target,initializer){
    if(typeof initializer=='function'){
        initializer();
    }
    return target;
}
/**
 * @internal
 */
function __awaiter(thisArg, _arguments, P, generator) {
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
/**
 * @internal
 */
function __generator(thisArg, body):any {
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
/**
 * @internal
 */
function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect['decorate'] === "function") r = Reflect['decorate'](decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
/**
 * @internal
 */
function __metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect['metadata'] === "function") return Reflect['metadata'](k, v);
}