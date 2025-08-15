// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { QiitaTreeViewProvider } from './treeView/qiitaTreeViewProvider';
import { QiitaTreeItem } from './treeView/qiitaTreeItem';
import { QiitaCli } from './qiitacli/qiitaCli';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	let cli = new QiitaCli();
	const qiitaTreeViewProvider = new QiitaTreeViewProvider();
	//vscode.window.registerTreeDataProvider("qiita", qiitaTreeViewProvider);
	var treeView = vscode.window.createTreeView("qiita", { treeDataProvider: qiitaTreeViewProvider });
	treeView.onDidChangeSelection((ev) => {
		ev.selection.forEach(async (val,index) => {
			console.log(val.path);
			if (val.path.length > 0) {
				try {
					const doc = await vscode.workspace.openTextDocument(val.path);
					return await vscode.window.showTextDocument(doc, vscode.ViewColumn.One, true);
				} catch (e) {
					// 選択したファイルがテキストではない場合
					console.log(e);
				}
			}
		});
	});

	vscode.commands.executeCommand('setContext', 'qiita-editor.activated', true);

	context.subscriptions.push(
		vscode.commands.registerCommand("qiita-editor.create-new", () => {
			vscode.window.showInformationMessage("qiita-editor.create-new called.");
			cli.new_article();
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
