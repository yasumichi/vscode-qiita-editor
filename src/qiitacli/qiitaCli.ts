import * as vscode from "vscode";
import * as childProcess from "child_process";
import which from "which";
import * as process from "process";
import path from "path";

export class QiitaCli {
    private npxPath: string = "";

    constructor() {
        const env = Object.assign({}, process.env);
        which("npx", { path: env.PATH}).then((value) => {
            this.npxPath = value;
        }).catch((reason) => {
            console.log(reason);
        });       
    }

    public new_article() {
        let intervalId = setInterval(() => {
            if (this.npxPath.length > 0 && vscode.workspace.workspaceFolders) {
                const qiitaProcess = childProcess.spawn(this.npxPath, ["qiita", "new"], {
                    cwd: vscode.workspace.workspaceFolders[0].uri.fsPath,
                    shell: process.platform === 'win32',
                    windowsHide: true,
                    stdio: ["pipe", "pipe", "inherit"]
                });
                qiitaProcess.on("error", (err) => {
                    console.log(err);
                });
                qiitaProcess.stdout.on("data", (data) => {
                    console.log(data);
                });
                clearInterval(intervalId);
            }
        }, 1000);
    }
}