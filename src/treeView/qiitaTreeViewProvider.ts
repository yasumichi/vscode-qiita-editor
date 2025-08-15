// refer to https://qiita.com/Teach/items/3622e159782f2baecaf1
import * as vscode from 'vscode';
import { QiitaTreeItem } from './qiitaTreeItem';
import fs, { read } from 'fs';
import path from 'path';
import * as readline from 'readline';
import * as YAML from 'yaml';

export class QiitaTreeViewProvider implements vscode.TreeDataProvider<QiitaTreeItem> {
    private rootItems: QiitaTreeItem[];

    constructor() {
        const published = new QiitaTreeItem("Published");
        const drafts = new QiitaTreeItem("Drafts");
        this.rootItems = [
            published,
            drafts
        ];
        vscode.workspace.findFiles("public/*.md").then(files => {
            files.forEach((val, index) => {
                const uri = val.path;
                const fullpath = val.path.slice(1);
                const rs = fs.createReadStream(fullpath, 'utf-8');
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
                        const result = YAML.parse(yaml);
                        if(result.id) {
                            const article = new QiitaTreeItem(result.title, uri);
                            published.addChild(article);
                        } else {
                            const article = new QiitaTreeItem(path.basename(fullpath) , uri);
                            drafts.addChild(article);
                        }
                    }
                });
            });
        });
    }

    onDidChangeTreeData?: vscode.Event<void | QiitaTreeItem | QiitaTreeItem[] | null | undefined> | undefined;

    getTreeItem(element: QiitaTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        //const collapsibleState = element.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
        const collapsibleState = element.parent ?  vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed;
        return new vscode.TreeItem(element.name, collapsibleState);
    }

    getChildren(element?: QiitaTreeItem | undefined): vscode.ProviderResult<QiitaTreeItem[]> {
        return element ? element.children : this.rootItems;
    }

    getParent?(element: QiitaTreeItem): vscode.ProviderResult<QiitaTreeItem> {
        throw new Error('Method not implemented.');
    }

    resolveTreeItem?(item: vscode.TreeItem, element: QiitaTreeItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error('Method not implemented.');
    }

}