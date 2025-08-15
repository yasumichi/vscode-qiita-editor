# VS Code Qiita Editor

[Qiita CLI](https://qiita.com/Qiita/items/666e190490d0af90a92b) を VS Code に統合する非公式の拡張です。

[VS Code Zenn Editor](https://marketplace.visualstudio.com/items?itemName=negokaz.zenn-editor) を参考に開発しています。

開発の取っ掛かりについて、以下に記事を書きました。

- [qiita-cli を VSCode に統合する拡張機能が欲しい #Markdown - Qiita](https://qiita.com/yasumichi/items/dffcff0287e8efc11a3d)

## Features

- 投稿記事を `title` で一覧表示できます
- 投稿記事を作成できます

## Usage

### 編集する投稿コンテンツをタイトルで選択する

Explorer にある「QIITA CONTENTS」ビューで投稿コンテンツの一覧を確認できます。

コンテンツをクリックするとテキストエディタが開きます。

![](docs/images/PublishedList.png)

### 新規記事の作成

QIITA CONTENTS ビュー上の紙のアイコンをクリックするか、コマンドパレットから `Qiita Editor: Create New` を実行します。

![](docs/images/DraftsList.png)

新規作成されたファイルは、`Drafts` に追加され、テキストエディタが開きます。

## Requirements

[Qiita CLI](https://qiita.com/Qiita/items/666e190490d0af90a92b) がインストールされているフォルダで有効化されます。

※今のところ、`qiita.config.json` が存在すれば、有効化されます。

## Extension Settings

今のところ、設定項目は存在しません。
