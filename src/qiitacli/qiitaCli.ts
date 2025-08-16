import * as vscode from "vscode";
import * as childProcess from "child_process";
import which from "which";
import * as process from "process";
import path, { basename } from "path";

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
                qiitaProcess.stdout.setEncoding('utf-8');
                qiitaProcess.on("error", (err) => {
                    console.log(err);
                });
                qiitaProcess.stdout.on("data", (data) => {
                    vscode.window.showInformationMessage(data);
                });
                clearInterval(intervalId);
            }
        }, 1000);
    }

    public publish() {
        if (vscode.window.activeTextEditor && vscode.workspace.workspaceFolders) {
            vscode.window.activeTextEditor.document.save();
            const filebase = basename(vscode.window.activeTextEditor.document.uri.fsPath, ".md");
            const qiitaProcess = childProcess.spawn(this.npxPath, ["qiita", "publish", filebase], {
                cwd: vscode.workspace.workspaceFolders[0].uri.fsPath,
                shell: process.platform === 'win32',
                windowsHide: true,
                stdio: ["pipe", "pipe", "pipe"]
            });
            qiitaProcess.stdout.setEncoding('utf-8');
            qiitaProcess.stderr.setEncoding('utf-8');
            qiitaProcess.on("error", (err) => {
                vscode.window.showErrorMessage(err.message);
            });
            qiitaProcess.stdout.on("data", (data) => {
                vscode.window.showInformationMessage(data);
            });
            qiitaProcess.stderr.on("data", (data) => {
                vscode.window.showErrorMessage(data);
            });
        }
    }
}