namespace ts {
    let projectJsons:{[s:string]:any} = Object.create({});

    export function getEcmalProjectJson(options: CompilerOptions):any{
        let configPath = options.configFilePath;
        let configJson = projectJsons[configPath];
        if(!configJson){
            configJson = projectJsons[configPath] = parseConfigFileTextToJson(configPath,sys.readFile(configPath));
        }
        return configJson.config;
    }

    export function getEcmalModuleName(host: EmitHost, file: SourceFile){
        let projectName  = getEcmalProjectJson(host.getCompilerOptions()).name;
        if(projectName){
            return projectName+'/'+getExternalModuleNameFromPath(host, file.fileName);
        }else{
            return getExternalModuleNameFromPath(host, file.fileName)
        }
    }
    

    export function ecmalModuleNameResolver(moduleName: string, containingFile: string, compilerOptions: CompilerOptions, host: ModuleResolutionHost, cache?: ModuleResolutionCache): ResolvedModuleWithFailedLookupLocations {
        let result = classicNameResolver(moduleName, containingFile, compilerOptions, host, cache)
        //console.info("ECMAL",compilerOptions.baseUrl,moduleName,containingFile,result);
        
        return result;
    }
}