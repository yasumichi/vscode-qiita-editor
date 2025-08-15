// refer to https://qiita.com/Teach/items/3622e159782f2baecaf1
import * as vscode from 'vscode';

export class QiitaTreeItem {
    private _children: QiitaTreeItem[];
    private _parent: QiitaTreeItem | undefined | null;

    constructor(public name: string, public path: string = "", public updated_at: string = "") {
        this._children = [];
    }

    get parent(): QiitaTreeItem | undefined | null {
        return this._parent;
    }

    get children(): QiitaTreeItem[] {
        return this._children;
    }

    addChild(child: QiitaTreeItem) {
        child.parent?.removeChild(child);
        this._children.push(child);
        child._parent = this;
    }

    removeChild(child: QiitaTreeItem) {
        const childIndex = this._children.indexOf(child);
        if (childIndex >= 0) {
            this._children.splice(childIndex, 1);
            child._parent = null;
        }
    }
}