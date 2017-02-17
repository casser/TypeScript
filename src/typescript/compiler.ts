/// <reference types="node" />
/// <reference path="../compiler/core.ts" />
/// <reference path="../server/shared.ts" />
/// <reference path="../server/session.ts" />

export type UnresolvedImports = ts.server.SortedReadonlyArray<string>;
export type TypeAcquisition = ts.TypeAcquisition;
export type ServerHost = ts.server.ServerHost;
export type HostCancellationToken = ts.HostCancellationToken;
export type FileWatcherCallback = ts.FileWatcherCallback;
export type FileWatcher = ts.FileWatcher;
export type DirectoryWatcherCallback = ts.DirectoryWatcherCallback;



export enum LogLevel {
    TERSE   = 0,
    NORMAL  = 1,
    TIME    = 2,
    VERBOSE = 3
}

export type Diagnostic = ts.Diagnostic;
export type Project = ts.server.Project;
export const Project = ts.server.Project;


export enum LogType {
    ERROR       = 1,
    INFO        = 2,
    TIME        = 0,
}

export class ProjectServiceLogger implements ts.server.Logger {
    private seq = 0;
    private inGroup = false;
    private firstInGroup = true;
    private level:ts.server.LogLevel;

    constructor(level: LogLevel) {
        switch(level){
            case LogLevel.TERSE:ts.server.LogLevel.terse;
            case LogLevel.NORMAL:ts.server.LogLevel.normal;
            case LogLevel.TIME:ts.server.LogLevel.requestTime;
            case LogLevel.VERBOSE:ts.server.LogLevel.verbose;
        }
    }
    /**@internal */
    static padStringRight(str: string, padding: string) {
        return (str + padding).slice(0, padding.length);
    }
    /**@internal */
    close() {
        this.log('End');
    }
    /**@internal */
    getLogFileName():string{
        return null;
    }
    /**@internal */
    perftrc(s: string):void {
        this.msg(s, ts.server.Msg.Perf);
    }

    info(s: string):void {
        this.msg(s, ts.server.Msg.Info);
    }

    startGroup():void {
        this.inGroup = true;
        this.firstInGroup = true;
    }
    
    endGroup():void {
        this.inGroup = false;
        this.seq++;
        this.firstInGroup = true;
    }
    /**@internal */
    loggingEnabled():boolean {
        return true;
    }
    /**@internal */
    hasLevel(level: ts.server.LogLevel.terse):boolean{
        return this.loggingEnabled() && this.level >= level;
    }
    /**@internal */
    msg(s: string, type: ts.server.Msg.Types = ts.server.Msg.Err):void {
        s = s + "\n";
        const prefix = ProjectServiceLogger.padStringRight(type + " " + this.seq.toString(), "          ");
        if (this.firstInGroup) {
            s = prefix + s;
            this.firstInGroup = false;
        }
        if (!this.inGroup) {
            this.seq++;
            this.firstInGroup = true;
        }
        this.log(s);
    }
    log(message:string){
        ts.noop.call(this,message);
    }
}
export class ProjectServiceEventHandler {
    onContext(project:Project,filename:string){
        ts.noop.call(this,project,filename);    
    }
    onConfigDiagnostics(configFile:string,triggeredfile:string,diagnostics:Diagnostic[]){
        ts.noop.call(this,configFile,triggeredfile,diagnostics);
    }
    onServiceState(project:Project,enabled:boolean){
        ts.noop.call(this,project,enabled);
    }
}
export class ProjectServiceHost implements ServerHost {
    get args(): string[]{
        return ts.sys.args;
    }
    get newLine(): string{
        return ts.sys.newLine;
    }
    get useCaseSensitiveFileNames(): boolean{
        return ts.sys.useCaseSensitiveFileNames;
    }
    write(s: string): void{
        ts.sys.write(s);
    }
    readFile(path: string, encoding?: string): string{
        return ts.sys.readFile(path,encoding);
    }
    getFileSize(path: string): number{
        return ts.sys.getFileSize(path);
    }
    writeFile(path: string, data: string, writeByteOrderMark?: boolean): void{
        return ts.sys.writeFile(path,data,writeByteOrderMark);
    }
    watchFile(path: string, callback: FileWatcherCallback, pollingInterval?: number): FileWatcher{
        return ts.sys.watchFile(path,callback,pollingInterval);
    }
    watchDirectory(path: string, callback: DirectoryWatcherCallback, recursive?: boolean): FileWatcher{
        return ts.sys.watchDirectory(path,callback,recursive);
    }
    resolvePath(path: string): string{
        return ts.sys.resolvePath(path);
    }
    fileExists(path: string): boolean{
        return ts.sys.fileExists(path);
    }
    directoryExists(path: string): boolean{
        return ts.sys.directoryExists(path);
    }
    createDirectory(path: string): void{
        return ts.sys.createDirectory(path);
    }
    getExecutingFilePath(): string{
        return ts.sys.getExecutingFilePath();
    }
    getCurrentDirectory(): string{
        return ts.sys.getExecutingFilePath();
    }
    getDirectories(path: string): string[]{
        return ts.sys.getDirectories(path);
    }
    readDirectory(path: string, extensions?: string[], exclude?: string[], include?: string[]): string[]{
        return ts.sys.readDirectory(path,extensions,exclude,include);
    }
    getModifiedTime(path: string): Date{
        return ts.sys.getModifiedTime(path);
    }
    createHash(data: string): string{
        return ts.sys.createHash(data);
    }
    getMemoryUsage(): number{
        return ts.sys.getMemoryUsage();
    }
    exit(exitCode?: number): void{
        return ts.sys.exit(exitCode);
    }
    realpath(path: string): string{
        return ts.sys.realpath(path);
    }
    getEnvironmentVariable(name: string): string{
        return ts.sys.getEnvironmentVariable(name);
    }
    tryEnableSourceMapsForHost(): void{
        return ts.sys.tryEnableSourceMapsForHost();
    }
    setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): any{
        return ts.sys.setTimeout(callback,ms,args);
    }
    clearTimeout(timeoutId: any): void{
        return ts.sys.clearTimeout(timeoutId);
    }
    setImmediate(callback: (...args: any[]) => void, ...args: any[]): any{
        return ts.sys.setTimeout(callback,0,...args);
    }
    clearImmediate(timeoutId: any): void{
        return ts.sys.clearTimeout(timeoutId);
    }
    gc(): void{}
    trace(s: string): void{
        ts.noop.call(s)
    }
}
export class ProjectServiceTypeingsInstaller implements ts.server.ITypingsInstaller {
    public enqueueInstallTypingsRequest(p:Project, typeAcquisition: TypeAcquisition, unresolvedImports:UnresolvedImports): void{
        ts.noop.call(p,typeAcquisition,unresolvedImports);
    }
    public attach(projectService: ts.server.ProjectService): void {
        ts.noop.call(projectService);
    }
    public onProjectClosed(p: ts.server.Project): void {
        ts.noop.call(p);
    }
    get globalTypingsCacheLocation():string{
        return null;
    }
}
export class ProjectService extends ts.server.ProjectService {
    constructor(
        host                        : ProjectServiceHost,
        logger                      : ProjectServiceLogger, 
        useSingleInferredProject    : boolean,
        typingsInstaller            : ProjectServiceTypeingsInstaller,
        eventHandler?               : ProjectServiceEventHandler
    ){
        let cancellationToken = {
            isCancellationRequested:()=>{
                return this.isCancellationRequested();
            }
        }
        let internalEvenetHandler = eventHandler?(e:ts.server.ProjectServiceEvent)=>{
            function onContextEvent(e:ts.server.ContextEvent){
                eventHandler.onContext(e.data.project,e.data.fileName,);
            }
            function onProjectServiceStateEvent(e:ts.server.ProjectLanguageServiceStateEvent){
                eventHandler.onServiceState(e.data.project,e.data.languageServiceEnabled);
            }
            function onConfigFileDiagEvent(e:ts.server.ConfigFileDiagEvent){
                eventHandler.onConfigDiagnostics(e.data.configFileName,e.data.triggerFile,e.data.diagnostics);
            }
            switch(e.eventName){
                case ts.server.ContextEvent : onContextEvent(<ts.server.ContextEvent>e);break;
                case ts.server.ConfigFileDiagEvent : onConfigFileDiagEvent(<ts.server.ConfigFileDiagEvent>e);break;
                case ts.server.ProjectLanguageServiceStateEvent : onProjectServiceStateEvent(<ts.server.ProjectLanguageServiceStateEvent>e);break;
            }
        }:void 0;
        
        super(host,logger,cancellationToken,useSingleInferredProject,typingsInstaller,internalEvenetHandler);
    }

    isCancellationRequested(){
        return false;
    }
    
}