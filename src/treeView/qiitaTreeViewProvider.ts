// refer to https://qiita.com/Teach/items/3622e159782f2baecaf1
import * as vscode from 'vscode';
import { QiitaTreeItem } from './qiitaTreeItem';
import fs, { read } from 'fs';
import path from 'path';
import * as readline from 'readline';
import * as YAML from 'yaml';

export class QiitaTreeViewProvider implements vscode.TreeDataProvider<QiitaTreeItem> {
    private rootItems: QiitaTreeItem[];
    private published: QiitaTreeItem;
    private drafts: QiitaTreeItem;

    constructor() {
        this.published = new QiitaTreeItem("Published");
        this.drafts = new QiitaTreeItem("Drafts");
        this.rootItems = [
            this.published,
            this.drafts
        ];
        vscode.workspace.findFiles("public/*.md").then(files => {
            files.forEach((val, index) => {
                const uri = val.path;
                const fullpath = val.fsPath;
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
                            const article = new QiitaTreeItem(result.title, uri, result.updated_at);
                            this.published.addChild(article);
                        } else {
                            const article = new QiitaTreeItem(path.basename(fullpath) , uri);
                            this.drafts.addChild(article);
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
        let children: vscode.ProviderResult<QiitaTreeItem[]>;

        if (element) {
            children = element.children;
            children.sort((a, b) => a.updated_at.localeCompare(b.updated_at));
        } else {
            children = this.rootItems;
        }

        return children;
    }

    getParent?(element: QiitaTreeItem): vscode.ProviderResult<QiitaTreeItem> {
        return element.parent;
    }

    resolveTreeItem?(item: vscode.TreeItem, element: QiitaTreeItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error('Method not implemented.');
    }

}