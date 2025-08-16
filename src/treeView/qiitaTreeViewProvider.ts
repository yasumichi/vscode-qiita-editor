// refer to https://qiita.com/Teach/items/3622e159782f2baecaf1
import * as vscode from 'vscode';
import { QiitaTreeItem } from './qiitaTreeItem';
import fs, { read } from 'fs';
import path from 'path';
import * as readline from 'readline';
import * as YAML from 'yaml';
import { FrontMatterParser } from './frontMatterParser';

export class QiitaTreeViewProvider implements vscode.TreeDataProvider<QiitaTreeItem>,Disposable {
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

    private rootItems: QiitaTreeItem[];
    private published: QiitaTreeItem;
    private drafts: QiitaTreeItem;
    private watcher: vscode.FileSystemWatcher | undefined;

    constructor() {
        this.published = new QiitaTreeItem("Published");
        this.drafts = new QiitaTreeItem("Drafts");
        this.rootItems = [
            this.published,
            this.drafts
        ];
        this.findArticles();
        this.watchFiles();
    }

    private findArticles() {
        vscode.workspace.findFiles("public/*.md").then(files => {
            files.forEach((uri, index) => {
                FrontMatterParser.parse(uri).then((json) => {
                    if (json.id) {
                        const article = new QiitaTreeItem(json.title, uri.path, json.updated_at);
                        this.published.addChild(article);
                    } else {
                        const article = new QiitaTreeItem(path.basename(uri.fsPath), uri.path);
                        this.drafts.addChild(article);
                    }
                });
            });
        });
    }

    private watchFiles() {
        if (vscode.workspace && vscode.workspace.workspaceFolders) {
            this.watcher = vscode.workspace.createFileSystemWatcher(
                new vscode.RelativePattern(vscode.workspace.workspaceFolders[0], "public/*.md")
            );
            this.watcher.onDidCreate(async (e) => {
                const article = new QiitaTreeItem(path.basename(e.fsPath), e.path);
                this.drafts.addChild(article);
                this.refresh();
                const doc = await vscode.workspace.openTextDocument(e.path);
                await vscode.window.showTextDocument(doc, vscode.ViewColumn.One, true);
            });
            this.watcher.onDidDelete((e) => {
                const filename = path.basename(e.fsPath);
                let parent: QiitaTreeItem | undefined;
                if (filename.startsWith("new")) {
                    parent = this.drafts;
                } else {
                    parent = this.published;
                }
                parent.children.filter((value, index) => {
                    return value.path === e.path;
                }).forEach((value,index) => {
                    parent.children.splice(index, 1);
                    this.refresh();
                });
            });
        }
    }

    public refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }

    [Symbol.dispose](): void {
        if(this.watcher) {
            this.watcher.dispose();
        }
    }

    getTreeItem(element: QiitaTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        //const collapsibleState = element.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
        const collapsibleState = element.parent ?  vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed;
        return new vscode.TreeItem(element.name, collapsibleState);
    }

    getChildren(element?: QiitaTreeItem | undefined): vscode.ProviderResult<QiitaTreeItem[]> {
        let children: vscode.ProviderResult<QiitaTreeItem[]>;

        if (element) {
            children = element.children;
            if (element === this.published) {
                children.sort((a, b) => a.updated_at.localeCompare(b.updated_at));
            } else {
                children.sort((a, b) => a.name.localeCompare(b.name));
            }
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