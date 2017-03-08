/* @internal */
namespace ts {
    export function convertPackageJsonToTsConfig(json:any){
        let dirs = assign({
            src  : './src',
            out  : './node_modules'
        },json.directories||{});
        let options = assign({
            name                    : json.name,
            module                  : "system",
            noEmitHelpers           : true,
            stripInternal           : true,
            removeComments          : true,
            declaration             : true,
            target                  : "es5",
            lib                     : ["es2016"],
            emitDecoratorMetadata   : true,
            experimentalDecorators  : true,
            baseUrl                 : dirs.out,
            rootDir                 : dirs.src,
            outFile                 : normalizePath(`${dirs.out}/./${json.name}/${json.main||'index.js'}`),
            paths                   : {
                [`${json.name}/*`] : [`./${json.name}/*`,`./${json.name}/index.d.ts`]
            }
        },json.compilerOptions||{});
        if(!json.bundle){
            options.outDir = getDirectoryPath(options.outFile);
            delete options.outFile;
        }else{
            delete options.outDir;
        }
        for(let i in json.dependencies){
            options.paths[`${i}/*`]=[`./${i}/*`,`./${i}/index.d.ts`]
        }
        json.compilerOptions = options;
        return json;
    }
    export function convertProjectOptionsToLibConfig(configParseResult:ParsedCommandLine){
           let options = JSON.parse(JSON.stringify(configParseResult.options));
        let project = JSON.parse(JSON.stringify(configParseResult.raw));
        let outDir  = options.outDir;
        if(!outDir){
            outDir = getDirectoryPath(options.outFile);
        }
        options.paths[`${project.name}/*`] = [`./${project.name}/*`,`./${project.name}/index.d.ts`];
        let fileName = normalizePath(combinePaths(outDir, "package.json"));
        delete options.outDir;
        delete options.outFile;
        delete options.project;
        delete options.configFilePath;
        options.baseUrl = "../..";
        options.rootDir = ".";
        project.compilerOptions = options;
        return {file:fileName,json:project};
    }
}