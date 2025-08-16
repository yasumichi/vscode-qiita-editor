// refer to https://qiita.com/Teach/items/3622e159782f2baecaf1
import * as vscode from 'vscode';
import { QiitaTreeItem } from './qiitaTreeItem';
import fs from 'fs';
import path from 'path';
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
                        const article = new QiitaTreeItem(json.title, uri.path);
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
                const filename = path.basename(e.fsPath);
                FrontMatterParser.parse(e).then(async (json) => {
                    let parent: QiitaTreeItem | undefined;
                    if (json.id) {
                        parent = this.published;
                    } else {
                        parent = this.drafts;
                    }
                    const article = new QiitaTreeItem(json.title, e.path);
                    parent.addChild(article);
                    if (parent === this.published) {
                        parent.children.sort((a, b) => a.updated_at.localeCompare(b.updated_at));
                    } else {
                        parent.children.sort((a, b) => a.name.localeCompare(b.name));
                    }
                    this.refresh();
                    const doc = await vscode.workspace.openTextDocument(e.path);
                    await vscode.window.showTextDocument(doc, vscode.ViewColumn.One, true);
                });
            });
            this.watcher.onDidChange((e) => {
                const filename = path.basename(e.fsPath);
                FrontMatterParser.parse(e).then((json) => {
                    if (filename.startsWith("new")) {
                        this.drafts.children.filter((value,index) => {
                            return value.path === e.path;
                        }).forEach((value,index) => {
                            value.name = json.title;
                            if (json.id) {
                                const newname = path.join(path.dirname(e.fsPath), json.id + ".md");
                                fs.renameSync(e.fsPath, newname);
                            }
                        });
                    } else {
                        this.published.children.filter((value,index) => {
                            return value.path === e.path;
                        }).forEach((value,index) => {
                            value.name = json.title;
                        });
                    }
                    this.refresh();
                });
            });
            this.watcher.onDidDelete((e) => {
                [this.published, this.drafts].forEach((parent, index) => {
                    parent.children.filter((value, index) => {
                        return value.path === e.path;
                    }).forEach(async (value, index) => {
                        parent.children.splice(index, 1);
                        const foundTab = vscode.window.tabGroups.all[0].tabs.filter(tab =>
                            (tab.input instanceof vscode.TabInputText) && (tab.input.uri.path === e.path)
                        );

                        if (foundTab.length === 1) {
                            await vscode.window.tabGroups.close(foundTab, false);
                        }
                    });
                });
                this.refresh();
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