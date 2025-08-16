// from https://github.com/negokaz/vscode-zenn-editor/blob/main/src/extension/treeView/markdownMeta.ts
import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';
import * as readline from 'readline';
import * as YAML from 'yaml';
import { rejects } from 'assert';

export class FrontMatterParser {
    public static async parse(uri: vscode.Uri): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const rs = fs.createReadStream(uri.fsPath, 'utf-8');
            const rl = readline.createInterface(rs);

            var yaml: string = "";
            var onMeta = false;
            var complete = false;

            rl.on('line', (line) => {
                if (line.match(/^---$/)) {
                    if (onMeta) {
                        complete = true;
                        onMeta = false;
                        rl.close();
                    } else {
                        onMeta = true;
                    }
                } else {
                    if (onMeta) {
                        yaml = yaml + line + "\n";
                    }
                }
            });
            rl.on('close', () => {
                rs.close();
                if (complete) {
                    try {
                        resolve(YAML.parse(yaml));
                    } catch(e) {
                        reject(new Error("failed parse FrontMatter"));
                    }
                } else {
                    reject(new Error("failed parse FrontMatter"));
                }
            });
        });
    }
}