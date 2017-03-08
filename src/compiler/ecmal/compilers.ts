/* @internal */
namespace ts {
    export function rootFileChanged(fileName:string,compilerHost:CompilerHost,compilerOptions:CompilerOptions){
        sys.write(`COPY : ${fileName} ${compilerOptions.outDir} ${compilerHost.getNewLine()}`);
    }
}