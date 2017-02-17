/// <reference types="node" />
/// <reference path="../compiler/core.ts" />
/// <reference path="../compiler/sys.ts" />
/// <reference path="../compiler/program.ts" />
/// <reference path="../compiler/commandLineParser.ts" />

namespace ts {
    export interface SourceFile {
        fileWatcher?: FileWatcher;
    }
}

namespace elp {
    import sys = ts.sys;
    import createGetCanonicalFileName = ts.createGetCanonicalFileName;

    import FileWatcher = ts.FileWatcher;
    import FormatDiagnosticsHost = ts.FormatDiagnosticsHost;
    
    
    import Diagnostic = ts.Diagnostic;
    import getNormalizedAbsolutePath = ts.getNormalizedAbsolutePath;
    import Program = ts.Program;
    import forEach = ts.forEach;
    import getLineStarts = ts.getLineStarts;
    import createCompilerDiagnostic = ts.createCompilerDiagnostic;
    import DiagnosticCategory = ts.DiagnosticCategory;
    import getLineAndCharacterOfPosition = ts.getLineAndCharacterOfPosition;
    import convertToRelativePath = ts.convertToRelativePath;
    import getPositionOfLineAndCharacter = ts.getPositionOfLineAndCharacter;
    import flattenDiagnosticMessageText = ts.flattenDiagnosticMessageText;
    import parseCommandLine = ts.parseCommandLine;
    import CompilerOptions = ts.CompilerOptions;
    import CompilerHost = ts.CompilerHost;
    import Map = ts.Map;
    import Diagnostics = ts.Diagnostics;
    import ExitStatus = ts.ExitStatus;
    import normalizePath = ts.normalizePath;
    import combinePaths = ts.combinePaths;
    import isWatchSet = ts.isWatchSet;
    import ParsedCommandLine = ts.ParsedCommandLine;
    import getDirectoryPath = ts.getDirectoryPath;
    import parseConfigFileTextToJson = ts.parseConfigFileTextToJson;
    import parseJsonConfigFileContent = ts.parseJsonConfigFileContent;
    import createCompilerHost = ts.createCompilerHost;
    import createMap = ts.createMap;
    import ScriptTarget = ts.ScriptTarget;
    import contains = ts.contains;
    import SourceFile = ts.SourceFile;
    import unorderedRemoveItem = ts.unorderedRemoveItem;
    import arrayIsEqualTo = ts.arrayIsEqualTo;
    import performance = ts.performance;
    import createProgram = ts.createProgram;
    import sortAndDeduplicateDiagnostics = ts.sortAndDeduplicateDiagnostics;
    

    interface Statistic {
        name: string;
        value: string;
    }
    const redForegroundEscapeSequence = "\u001b[91m";
    const yellowForegroundEscapeSequence = "\u001b[93m";
    const blueForegroundEscapeSequence = "\u001b[93m";
    const gutterStyleSequence = "\u001b[100;30m";
    const gutterSeparator = " ";
    const resetEscapeSequence = "\u001b[0m";
    const ellipsis = "...";
    const defaultFormatDiagnosticsHost: FormatDiagnosticsHost = {
        getCurrentDirectory: () => sys.getCurrentDirectory(),
        getNewLine: () => sys.newLine,
        getCanonicalFileName: createGetCanonicalFileName(sys.useCaseSensitiveFileNames)
    };
    let reportDiagnosticWorker = reportDiagnosticSimply;

    function reportDiagnostic(diagnostic: Diagnostic, host: FormatDiagnosticsHost) {
        reportDiagnosticWorker(diagnostic, host || defaultFormatDiagnosticsHost);
    }

    function reportDiagnostics(diagnostics: Diagnostic[], host: FormatDiagnosticsHost): void {
        for (const diagnostic of diagnostics) {
            reportDiagnostic(diagnostic, host);
        }
    }

    function reportEmittedFiles(files: string[]): void {
        if (!files || files.length == 0) {
            return;
        }

        const currentDir = sys.getCurrentDirectory();

        for (const file of files) {
            const filepath = getNormalizedAbsolutePath(file, currentDir);

            sys.write(`TSFILE: ${filepath}${sys.newLine}`);
        }
    }

    function countLines(program: Program): number {
        let count = 0;
        forEach(program.getSourceFiles(), file => {
            count += getLineStarts(file).length;
        });
        return count;
    }

 
    function reportDiagnosticSimply(diagnostic: Diagnostic, host: FormatDiagnosticsHost): void {
        sys.write(ts.formatDiagnostics([diagnostic], host));
    }

    function getCategoryFormat(category: DiagnosticCategory): string {
        switch (category) {
            case DiagnosticCategory.Warning: return yellowForegroundEscapeSequence;
            case DiagnosticCategory.Error: return redForegroundEscapeSequence;
            case DiagnosticCategory.Message: return blueForegroundEscapeSequence;
        }
    }

    function formatAndReset(text: string, formatStyle: string) {
        return formatStyle + text + resetEscapeSequence;
    }

    function reportDiagnosticWithColorAndContext(diagnostic: Diagnostic, host: FormatDiagnosticsHost): void {
        let output = "";

        if (diagnostic.file) {
            const { start, length, file } = diagnostic;
            const { line: firstLine, character: firstLineChar } = getLineAndCharacterOfPosition(file, start);
            const { line: lastLine, character: lastLineChar } = getLineAndCharacterOfPosition(file, start + length);
            const lastLineInFile = getLineAndCharacterOfPosition(file, file.text.length).line;
            const relativeFileName = host ? convertToRelativePath(file.fileName, host.getCurrentDirectory(), fileName => host.getCanonicalFileName(fileName)) : file.fileName;

            const hasMoreThanFiveLines = (lastLine - firstLine) >= 4;
            let gutterWidth = (lastLine + 1 + "").length;
            if (hasMoreThanFiveLines) {
                gutterWidth = Math.max(ellipsis.length, gutterWidth);
            }

            output += sys.newLine;
            for (let i = firstLine; i <= lastLine; i++) {
                // If the error spans over 5 lines, we'll only show the first 2 and last 2 lines,
                // so we'll skip ahead to the second-to-last line.
                if (hasMoreThanFiveLines && firstLine + 1 < i && i < lastLine - 1) {
                    output += formatAndReset(padLeft(ellipsis, gutterWidth), gutterStyleSequence) + gutterSeparator + sys.newLine;
                    i = lastLine - 1;
                }

                const lineStart = getPositionOfLineAndCharacter(file, i, 0);
                const lineEnd = i < lastLineInFile ? getPositionOfLineAndCharacter(file, i + 1, 0) : file.text.length;
                let lineContent = file.text.slice(lineStart, lineEnd);
                lineContent = lineContent.replace(/\s+$/g, "");  // trim from end
                lineContent = lineContent.replace("\t", " ");    // convert tabs to single spaces

                // Output the gutter and the actual contents of the line.
                output += formatAndReset(padLeft(i + 1 + "", gutterWidth), gutterStyleSequence) + gutterSeparator;
                output += lineContent + sys.newLine;

                // Output the gutter and the error span for the line using tildes.
                output += formatAndReset(padLeft("", gutterWidth), gutterStyleSequence) + gutterSeparator;
                output += redForegroundEscapeSequence;
                if (i === firstLine) {
                    // If we're on the last line, then limit it to the last character of the last line.
                    // Otherwise, we'll just squiggle the rest of the line, giving 'slice' no end position.
                    const lastCharForLine = i === lastLine ? lastLineChar : undefined;

                    output += lineContent.slice(0, firstLineChar).replace(/\S/g, " ");
                    output += lineContent.slice(firstLineChar, lastCharForLine).replace(/./g, "~");
                }
                else if (i === lastLine) {
                    output += lineContent.slice(0, lastLineChar).replace(/./g, "~");
                }
                else {
                    // Squiggle the entire line.
                    output += lineContent.replace(/./g, "~");
                }
                output += resetEscapeSequence;

                output += sys.newLine;
            }

            output += sys.newLine;
            output += `${ relativeFileName }(${ firstLine + 1 },${ firstLineChar + 1 }): `;
        }

        const categoryColor = getCategoryFormat(diagnostic.category);
        const category = DiagnosticCategory[diagnostic.category].toLowerCase();
        output += `${ formatAndReset(category, categoryColor) } TS${ diagnostic.code }: ${ flattenDiagnosticMessageText(diagnostic.messageText, sys.newLine) }`;
        output += sys.newLine + sys.newLine;

        sys.write(output);
    }

    function reportWatchDiagnostic(diagnostic: Diagnostic) {
        let output = new Date().toLocaleTimeString() + " - ";
        if (diagnostic.file) {
            const loc = getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
            output += `${ diagnostic.file.fileName }(${ loc.line + 1 },${ loc.character + 1 }): `;
        }
        output += `${ flattenDiagnosticMessageText(diagnostic.messageText, sys.newLine) }${sys.newLine}`;
        sys.write(output);
    }

    function padLeft(s: string, length: number) {
        while (s.length < length) {
            s = " " + s;
        }
        return s;
    }

    function padRight(s: string, length: number) {
        while (s.length < length) {
            s = s + " ";
        }

        return s;
    }



    function executeCommandLine(args: string[]): void {
        const commandLine = parseCommandLine(args);
        let configFileName: string;                                 // Configuration file name (if any)
        let cachedConfigFileText: string;                           // Cached configuration file text, used for reparsing (if any)
        let configFileWatcher: FileWatcher;                         // Configuration file watcher
        let directoryWatcher: FileWatcher;                          // Directory watcher to monitor source file addition/removal
        let cachedProgram: Program;                                 // Program cached from last compilation
        let rootFileNames: string[];                                // Root fileNames for compilation
        let compilerOptions: CompilerOptions;                       // Compiler options for compilation
        let compilerHost: CompilerHost;                             // Compiler host
        let hostGetSourceFile: typeof compilerHost.getSourceFile;   // getSourceFile method from default host
        let timerHandleForRecompilation: any;                    // Handle for 0.25s wait timer to trigger recompilation
        let timerHandleForDirectoryChanges: any;                 // Handle for 0.25s wait timer to trigger directory change handler

        // This map stores and reuses results of fileExists check that happen inside 'createProgram'
        // This allows to save time in module resolution heavy scenarios when existence of the same file might be checked multiple times.
        let cachedExistingFiles: Map<boolean>;
        let hostFileExists: typeof compilerHost.fileExists;

        const projectCmd = process.argv[2];
        const projectFile = normalizePath(process.argv[3]||process.cwd());
        console.info(projectFile);
        const fileOrDirectory = projectFile;
        if (sys.directoryExists(fileOrDirectory)) {
            configFileName = combinePaths(fileOrDirectory, "package.json");
            if (!sys.fileExists(configFileName)) {
                reportDiagnostic(createCompilerDiagnostic(Diagnostics.Cannot_find_a_tsconfig_json_file_at_the_specified_directory_Colon_0, projectFile), /* host */ undefined);
                return sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
        } else {
            configFileName = fileOrDirectory;
            if (!sys.fileExists(configFileName)) {
                reportDiagnostic(createCompilerDiagnostic(Diagnostics.The_specified_path_does_not_exist_Colon_0, projectFile), /* host */ undefined);
                return sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
        }
        if(projectCmd=='watch'){
            if (configFileName) {
                configFileWatcher = sys.watchFile(configFileName, configFileChanged);
            }
            if (sys.watchDirectory && configFileName) {
                const directory = ts.getDirectoryPath(configFileName);
                directoryWatcher = sys.watchDirectory(
                    // When the configFileName is just "tsconfig.json", the watched directory should be
                    // the current directory; if there is a given "project" parameter, then the configFileName
                    // is an absolute file name.
                    directory == "" ? "." : directory,
                    watchedDirectoryChanged, /*recursive*/ true);
            }
            performCompilation();
        }else
        if(projectCmd=='compile'){
            performCompilation();
            return sys.exit(ExitStatus.Success);
        }else{
            reportDiagnostic(createCompilerDiagnostic({
                 code: 5058, 
                 category: DiagnosticCategory.Error, 
                 key: "Invalid_command_0_5058", 
                 message: "Invalid command '{0}'" 
            }, projectFile), /* host */ undefined);
            return sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
        }

        

        function parseConfigFile(): ParsedCommandLine {
            if (!cachedConfigFileText) {
                try {
                    cachedConfigFileText = sys.readFile(configFileName);
                } catch (e) {
                    const error = createCompilerDiagnostic(Diagnostics.Cannot_read_file_0_Colon_1, configFileName, e.message);
                    reportWatchDiagnostic(error);
                    sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
                    return;
                }
            }
            if (!cachedConfigFileText) {
                const error = createCompilerDiagnostic(Diagnostics.File_0_not_found, configFileName);
                reportDiagnostics([error], /* compilerHost */ undefined);
                sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
                return;
            }

            const result = parseConfigFileTextToJson(configFileName, cachedConfigFileText);
            const configObject = result.config;
            console.info(configObject);
            if (!configObject) {
                reportDiagnostics([result.error], /* compilerHost */ undefined);
                sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
                return;
            }
            const cwd = sys.getCurrentDirectory();
            const configParseResult = parseJsonConfigFileContent(configObject, sys, getNormalizedAbsolutePath(getDirectoryPath(configFileName), cwd), commandLine.options, getNormalizedAbsolutePath(configFileName, cwd));
            if (configParseResult.errors.length > 0) {
                reportDiagnostics(configParseResult.errors, /* compilerHost */ undefined);
                sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
                return;
            }
            if (isWatchSet(configParseResult.options)) {
                if (!sys.watchFile) {
                    reportDiagnostic(createCompilerDiagnostic(Diagnostics.The_current_host_does_not_support_the_0_option, "--watch"), /* host */ undefined);
                    sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
                }

                if (!directoryWatcher && sys.watchDirectory && configFileName) {
                    const directory = ts.getDirectoryPath(configFileName);
                    directoryWatcher = sys.watchDirectory(
                        // When the configFileName is just "tsconfig.json", the watched directory should be
                        // the current directory; if there is a given "project" parameter, then the configFileName
                        // is an absolute file name.
                        directory == "" ? "." : directory,
                        watchedDirectoryChanged, /*recursive*/ true);
                };
            }
            return configParseResult;
        }

        // Invoked to perform initial compilation or re-compilation in watch mode
        function performCompilation() {

            if (!cachedProgram) {
                if (configFileName) {
                    const configParseResult = parseConfigFile();
                    rootFileNames = configParseResult.fileNames;
                    compilerOptions = configParseResult.options;
                }
                else {
                    rootFileNames = commandLine.fileNames;
                    compilerOptions = commandLine.options;
                }
                compilerHost = createCompilerHost(compilerOptions);
                hostGetSourceFile = compilerHost.getSourceFile;
                compilerHost.getSourceFile = getSourceFile;

                hostFileExists = compilerHost.fileExists;
                compilerHost.fileExists = cachedFileExists;
            }

            if (compilerOptions.pretty) {
                reportDiagnosticWorker = reportDiagnosticWithColorAndContext;
            }

            // reset the cache of existing files
            cachedExistingFiles = createMap<boolean>();

            const compileResult = compile(rootFileNames, compilerOptions, compilerHost);

            if (!isWatchSet(compilerOptions)) {
                return sys.exit(compileResult.exitStatus);
            }

            setCachedProgram(compileResult.program);
            reportWatchDiagnostic(createCompilerDiagnostic(Diagnostics.Compilation_complete_Watching_for_file_changes));
        }

        function cachedFileExists(fileName: string): boolean {
            let fileExists = cachedExistingFiles.get(fileName);
            if (fileExists === undefined) {
                cachedExistingFiles.set(fileName, fileExists = hostFileExists(fileName));
            }
            return fileExists;
        }

        function getSourceFile(fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void) {
            // Return existing SourceFile object if one is available
            if (cachedProgram) {
                const sourceFile = cachedProgram.getSourceFile(fileName);
                // A modified source file has no watcher and should not be reused
                if (sourceFile && sourceFile.fileWatcher) {
                    return sourceFile;
                }
            }
            // Use default host function
            const sourceFile = hostGetSourceFile(fileName, languageVersion, onError);
            if (sourceFile && isWatchSet(compilerOptions) && sys.watchFile) {
                // Attach a file watcher
                sourceFile.fileWatcher = sys.watchFile(sourceFile.fileName, (_fileName: string, removed?: boolean) => sourceFileChanged(sourceFile, removed));
            }
            return sourceFile;
        }

        // Change cached program to the given program
        function setCachedProgram(program: Program) {
            if (cachedProgram) {
                const newSourceFiles = program ? program.getSourceFiles() : undefined;
                forEach(cachedProgram.getSourceFiles(), sourceFile => {
                    if (!(newSourceFiles && contains(newSourceFiles, sourceFile))) {
                        if (sourceFile.fileWatcher) {
                            sourceFile.fileWatcher.close();
                            sourceFile.fileWatcher = undefined;
                        }
                    }
                });
            }
            cachedProgram = program;
        }

        // If a source file changes, mark it as unwatched and start the recompilation timer
        function sourceFileChanged(sourceFile: SourceFile, removed?: boolean) {
            sourceFile.fileWatcher.close();
            sourceFile.fileWatcher = undefined;
            if (removed) {
                unorderedRemoveItem(rootFileNames, sourceFile.fileName);
            }
            startTimerForRecompilation();
        }

        // If the configuration file changes, forget cached program and start the recompilation timer
        function configFileChanged() {
            setCachedProgram(undefined);
            cachedConfigFileText = undefined;
            startTimerForRecompilation();
        }

        function watchedDirectoryChanged(fileName: string) {
            if (fileName && !ts.isSupportedSourceFileName(fileName, compilerOptions)) {
                return;
            }
            startTimerForHandlingDirectoryChanges();
        }

        function startTimerForHandlingDirectoryChanges() {
            if (!sys.setTimeout || !sys.clearTimeout) {
                return;
            }

            if (timerHandleForDirectoryChanges) {
                sys.clearTimeout(timerHandleForDirectoryChanges);
            }
            timerHandleForDirectoryChanges = sys.setTimeout(directoryChangeHandler, 250);
        }

        function directoryChangeHandler() {
            const parsedCommandLine = parseConfigFile();
            const newFileNames = ts.map(parsedCommandLine.fileNames, compilerHost.getCanonicalFileName);
            const canonicalRootFileNames = ts.map(rootFileNames, compilerHost.getCanonicalFileName);

            // We check if the project file list has changed. If so, we just throw away the old program and start fresh.
            if (!arrayIsEqualTo(newFileNames && newFileNames.sort(), canonicalRootFileNames && canonicalRootFileNames.sort())) {
                setCachedProgram(undefined);
                startTimerForRecompilation();
            }
        }

        // Upon detecting a file change, wait for 250ms and then perform a recompilation. This gives batch
        // operations (such as saving all modified files in an editor) a chance to complete before we kick
        // off a new compilation.
        function startTimerForRecompilation() {
            if (!sys.setTimeout || !sys.clearTimeout) {
                return;
            }

            if (timerHandleForRecompilation) {
                sys.clearTimeout(timerHandleForRecompilation);
            }
            timerHandleForRecompilation = sys.setTimeout(recompile, 250);
        }

        function recompile() {
            timerHandleForRecompilation = undefined;
            reportWatchDiagnostic(createCompilerDiagnostic(Diagnostics.File_change_detected_Starting_incremental_compilation));
            performCompilation();
        }
    }

    function compile(fileNames: string[], compilerOptions: CompilerOptions, compilerHost: CompilerHost) {
        const hasDiagnostics = compilerOptions.diagnostics || compilerOptions.extendedDiagnostics;
        let statistics: Statistic[];
        if (hasDiagnostics) {
            performance.enable();
            statistics = [];
        }

        const program = createProgram(fileNames, compilerOptions, compilerHost);
        const exitStatus = compileProgram();

        if (compilerOptions.listFiles) {
            forEach(program.getSourceFiles(), file => {
                sys.write(file.fileName + sys.newLine);
            });
        }

        if (hasDiagnostics) {
            const memoryUsed = sys.getMemoryUsage ? sys.getMemoryUsage() : -1;
            reportCountStatistic("Files", program.getSourceFiles().length);
            reportCountStatistic("Lines", countLines(program));
            reportCountStatistic("Nodes", program.getNodeCount());
            reportCountStatistic("Identifiers", program.getIdentifierCount());
            reportCountStatistic("Symbols", program.getSymbolCount());
            reportCountStatistic("Types", program.getTypeCount());

            if (memoryUsed >= 0) {
                reportStatisticalValue("Memory used", Math.round(memoryUsed / 1000) + "K");
            }

            const programTime = performance.getDuration("Program");
            const bindTime = performance.getDuration("Bind");
            const checkTime = performance.getDuration("Check");
            const emitTime = performance.getDuration("Emit");
            if (compilerOptions.extendedDiagnostics) {
                performance.forEachMeasure((name, duration) => reportTimeStatistic(`${name} time`, duration));
            }
            else {
                // Individual component times.
                // Note: To match the behavior of previous versions of the compiler, the reported parse time includes
                // I/O read time and processing time for triple-slash references and module imports, and the reported
                // emit time includes I/O write time. We preserve this behavior so we can accurately compare times.
                reportTimeStatistic("I/O read", performance.getDuration("I/O Read"));
                reportTimeStatistic("I/O write", performance.getDuration("I/O Write"));
                reportTimeStatistic("Parse time", programTime);
                reportTimeStatistic("Bind time", bindTime);
                reportTimeStatistic("Check time", checkTime);
                reportTimeStatistic("Emit time", emitTime);
            }
            reportTimeStatistic("Total time", programTime + bindTime + checkTime + emitTime);
            reportStatistics();

            performance.disable();
        }

        return { program, exitStatus };

        function compileProgram(): ExitStatus {
            let diagnostics: Diagnostic[];

            // First get and report any syntactic errors.
            diagnostics = program.getSyntacticDiagnostics();

            // If we didn't have any syntactic errors, then also try getting the global and
            // semantic errors.
            if (diagnostics.length === 0) {
                diagnostics = program.getOptionsDiagnostics().concat(program.getGlobalDiagnostics());

                if (diagnostics.length === 0) {
                    diagnostics = program.getSemanticDiagnostics();
                }
            }

            // Otherwise, emit and report any errors we ran into.
            const emitOutput = program.emit();
            diagnostics = diagnostics.concat(emitOutput.diagnostics);

            reportDiagnostics(sortAndDeduplicateDiagnostics(diagnostics), compilerHost);

            reportEmittedFiles(emitOutput.emittedFiles);

            if (emitOutput.emitSkipped && diagnostics.length > 0) {
                // If the emitter didn't emit anything, then pass that value along.
                return ExitStatus.DiagnosticsPresent_OutputsSkipped;
            }
            else if (diagnostics.length > 0) {
                // The emitter emitted something, inform the caller if that happened in the presence
                // of diagnostics or not.
                return ExitStatus.DiagnosticsPresent_OutputsGenerated;
            }
            return ExitStatus.Success;
        }

        function reportStatistics() {
            let nameSize = 0;
            let valueSize = 0;
            for (const { name, value } of statistics) {
                if (name.length > nameSize) {
                    nameSize = name.length;
                }

                if (value.length > valueSize) {
                    valueSize = value.length;
                }
            }

            for (const { name, value } of statistics) {
                sys.write(padRight(name + ":", nameSize + 2) + padLeft(value.toString(), valueSize) + sys.newLine);
            }
        }

        function reportStatisticalValue(name: string, value: string) {
            statistics.push({ name, value });
        }

        function reportCountStatistic(name: string, count: number) {
            reportStatisticalValue(name, "" + count);
        }

        function reportTimeStatistic(name: string, time: number) {
            reportStatisticalValue(name, (time / 1000).toFixed(2) + "s");
        }
    }

    

    executeCommandLine(ts.sys.args);
}