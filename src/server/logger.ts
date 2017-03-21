/// <reference path="../compiler/core.ts" />

namespace ts.server {
    declare var require: Function, console: any, process: any;

    export enum LogLevel {
        FATAL = 60,
        ERROR = 50,
        WARN  = 40,
        INFO  = 30,
        DEBUG = 20,
        TRACE = 10,
        NONE  = 0
    }
    export interface LogEntry extends MapLike<any> {
        msg?: string;
        level?: number;
        name?: string;
        hostname?: string;
        pid?: number;
        time?: Date;
        v?: number;
    }
    export interface LogTarget {
        write(text: string): void;
    }
    export class LoggerFileTarget implements LogTarget {
        private descriptor: number;
        private get fs(): any{
            let fs;
            try {
                fs = require("fs");
            } catch (e) {
                fs = void 0;
            }
            return Object.defineProperty(this, "fs", {
                value: fs
            }).fs;
        }
        public filename: string;
        constructor(filename: string) {
            try {
                this.filename = filename;
                this.descriptor = this.fs.openSync(filename, "w");
            } catch (e) {
                this.descriptor = -1;
            }
        }
        write(text: string): void {
            if (this.fs && this.descriptor >= 0) {
                this.fs.writeSync(this.descriptor, text + "\n");
            } else {
                console.info(this.filename);
            }
        }
        close(): void {
            this.fs.close(this.descriptor);
        }
    }
    export class LoggerConsoleTarget implements LogTarget {
        write(text: string): void {
            console.warn(text);
        }
    }
    export class Logger  {
        static default: Logger;
        static init(level: LogLevel, console?: boolean, filename?: string): Logger {
            let hostname = "host";
            let pid = 0;
            try {
                hostname = require("os").hostname();
            } catch (e) {}
            try { pid = process.pid; } catch (e) {}
            if (!this.default) {
                Object.defineProperty(this, "default", {
                    value : new Logger({
                        v        : 0,
                        pid      : pid,
                        hostname : hostname,
                        name     : "default",
                        level    : level
                    }, void 0, console, filename)
                });
            }
            return this.default;
        }
        static get(name: string): Logger {
            if (!this.default) {
                this.init(LogLevel.NONE);
            }
            return this.default.child({ name });
        }
        private options: LogEntry;
        private parent: Logger;
        private children: Logger[];
        private file: LoggerFileTarget;
        private console: LoggerConsoleTarget;
        public get filename(){
            return this.file.filename;
        }
        public get enabled() {
            return !!(this.file || this.console || this.options.level > 0);
        }
        constructor (options: LogEntry, parent?: Logger, console?: boolean, filename?: string) {
            if (parent) {
                this.file = parent.file;
                this.console = parent.console;
                this.parent = parent;
                this.options = Object.assign({}, parent.options, options);
            } else
            if (options.level > 0) {
                this.options = Object.assign({}, options);
                if (console) {
                    this.console = new LoggerConsoleTarget();
                }
                if (filename) {
                    this.file = new LoggerFileTarget(filename);
                }
            }
            this.children = [];
            Object.freeze(this.options);
            Object.freeze(this);
        }
        child(options: LogEntry): Logger {
            const child = new Logger(options, this);
            this.children.push(child);
            return child;
        }
        fatal(msg: string, data?: any): number[] {
            return this.log({ level: LogLevel.FATAL, msg }, data);
        }
        error(msg: string, data?: any): number[] {
            return this.log({ level: LogLevel.ERROR, msg }, data);
        }
        warn(msg: string, data?: any): number[] {
            return this.log({ level: LogLevel.WARN, msg }, data);
        }
        info(msg: string, data?: any): number[] {
            return this.log({ level: LogLevel.INFO, msg }, data);
        }
        debug(msg: string, data?: any): number[] {
            return this.log({ level: LogLevel.DEBUG, msg }, data);
        }
        trace(msg: string, data?: any): number[] {
            return this.log({ level: LogLevel.TRACE, msg }, data);
        }
        log(entry: LogEntry, extra?: any): number[] {
            const self: LogEntry = this.options;
            function formatMiliseconds(time: number[]): number {
                const seconds = time[0];
                const nanoseconds = time[1];
                return ((1e9 * seconds) + nanoseconds) / 1000000.0;
            }
            function formatInstruction(name: string, data: any): any {
                const value = extra[name];
                const pair  = name.split("$");
                const key = pair[0];
                const inst =  pair[1].toUpperCase();
                if (inst == "TIME" && Array.isArray(value)) {
                    data[key] = formatMiliseconds(process.hrtime(value as [number, number]));
                } else {
                    const level = (LogLevel as any)[inst];
                    if (level && level >= self.level) {
                        data[key] = typeof(value) == "function" ? value() : value;
                    }
                }
            }
            function formatData() {
                const data: LogEntry = {
                    v           : self.v,
                    hostname    : self.hostname,
                    pid         : self.pid,
                    name        : entry.name  || self.name,
                    level       : entry.level || self.level,
                    msg         : entry.msg   || "Message",
                };
                for (const i in extra) {
                    if (i.indexOf("$") > 0) {
                        formatInstruction(i, data);
                    } else {
                        data[i] = extra[i];
                    }
                }
                data.time = new Date();
                return data;
            }
            if (this.enabled) {
                if (entry.level >= this.options.level) {
                    this.write(JSON.stringify(formatData()));
                    return process.hrtime();
                }
            }
        }
        close() {
            if (this.file) {
                this.file.close();
            }
        }
        hasLevel(level: LogLevel) {
            return level > 0;
            // return this.enabled && this.options.level >= level;
        }
        write(text: string) {
            if (this.file) {
                this.file.write(text);
            }
            if (this.console) {
                this.console.write(text);
            }
        }
        getLogFileName(): string {
            return this.filename;
        }
    }
}