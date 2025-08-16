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
			cli.new_article();
		}),
		vscode.commands.registerCommand("qiita-editor.publish", () => {
			cli.publish();
		}),
		vscode.commands.registerCommand("qiita-editor.open-file-uploader", () => {
			vscode.env.openExternal(vscode.Uri.parse('https://qiita.com/settings/uploading_images'));
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => onDidChangeActiveTextEditor(editor))
	);
	onDidChangeActiveTextEditor(vscode.window.activeTextEditor);
}

// This method is called when your extension is deactivated
export function deactivate() { }

function onDidChangeActiveTextEditor(editor: vscode.TextEditor | undefined): any {
	if (editor && vscode.workspace.workspaceFolders) {
		const uri = editor.document.uri;
		const regexp = /.*\/public\/.*\.md$/;
		if (regexp.test(uri.path)) {
			vscode.commands.executeCommand('setContext', 'qiita-editor.publishable', true);
		} else {
			vscode.commands.executeCommand('setContext', 'qiita-editor.publishable', false);
		}
	}
}

