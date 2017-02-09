namespace ts {
    export function ecmalModuleNameResolver(moduleName: string, containingFile: string, compilerOptions: CompilerOptions, host: ModuleResolutionHost, cache?: ModuleResolutionCache): ResolvedModuleWithFailedLookupLocations {
        let result = classicNameResolver(moduleName, containingFile, compilerOptions, host, cache)
        //console.info("ECMAL",compilerOptions.baseUrl,moduleName,containingFile,result);
        
        return result;
    }
}