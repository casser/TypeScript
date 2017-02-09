require("./built/ecmal/runtime/package");
system.import('elp/cli').then(Module=>{
    console.info(Module);
},ex=>console.error(ex))
