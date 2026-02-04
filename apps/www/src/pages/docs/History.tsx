import {
  DocsH1,
  DocsH2,
  DocsH3,
  DocsP,
  DocsList,
  DocsListItem,
  DocsOrderedList,
  DocsNote,
  DocsLink,
  Strong,
  NextPage,
  RelatedPages,
} from "./components";

export function History() {
  return (
    <>
      <DocsH1>履歴機能</DocsH1>

      <DocsP>
        surasuraは音声入力の結果をすべて履歴として保存します。
        過去の文字起こしを確認したり、再度コピーしたりできます。
      </DocsP>

      <DocsH2>履歴の確認</DocsH2>

      <DocsH3>履歴画面を開く</DocsH3>
      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>「履歴」タブを選択</DocsListItem>
      </DocsOrderedList>

      <DocsP>
        履歴は新しい順に表示され、テキストの内容、言語、日時を確認できます。
      </DocsP>

      <DocsH3>履歴の検索</DocsH3>
      <DocsP>
        履歴画面上部の検索ボックスから、過去の文字起こしをテキストで検索できます。
      </DocsP>

      <DocsH2>履歴からの操作</DocsH2>

      <DocsP>
        各履歴アイテムにカーソルを合わせると、操作ボタンが表示されます。
      </DocsP>

      <DocsH3>テキストをコピー</DocsH3>
      <DocsP>
        コピーボタンをクリックすると、その履歴のテキストをクリップボードにコピーできます。
      </DocsP>

      <DocsH3>詳細を表示</DocsH3>
      <DocsP>
        詳細ボタンをクリックすると、以下の情報を確認できます。
      </DocsP>
      <DocsList>
        <DocsListItem>文字起こしの全文</DocsListItem>
        <DocsListItem>録音した音声の再生</DocsListItem>
        <DocsListItem>音声ファイルのダウンロード</DocsListItem>
      </DocsList>

      <DocsH3>履歴の削除</DocsH3>
      <DocsP>
        削除ボタンをクリックすると、その履歴を削除できます。
        関連する音声ファイルも同時に削除されます。
      </DocsP>
      <DocsP>
        複数の履歴をチェックボックスで選択し、一括で削除することもできます。
      </DocsP>

      <DocsH2>履歴ペースト</DocsH2>

      <DocsP>
        直前に整形したテキストを再度ペーストしたい場合は、履歴ペースト機能が便利です。
      </DocsP>

      <DocsH3>使い方</DocsH3>
      <DocsOrderedList>
        <DocsListItem>
          <DocsLink to="/docs/settings">設定画面</DocsLink>で履歴ペーストのショートカットを設定（デフォルトは未設定）
        </DocsListItem>
        <DocsListItem>設定したショートカットキーを押す</DocsListItem>
        <DocsListItem>直前の文字起こし結果がペーストされる</DocsListItem>
      </DocsOrderedList>

      <DocsH3>活用シーン</DocsH3>
      <DocsList>
        <DocsListItem>同じ内容を複数の場所に入力したい時</DocsListItem>
        <DocsListItem>ペースト先を間違えた時のやり直し</DocsListItem>
        <DocsListItem>整形結果を確認してから別の場所にも使いたい時</DocsListItem>
      </DocsList>

      <DocsH2>履歴の自動削除</DocsH2>

      <DocsP>
        ストレージを圧迫しないよう、履歴は自動的に整理されます。
      </DocsP>

      <DocsList>
        <DocsListItem><Strong>保存期間</Strong>: 30日間</DocsListItem>
        <DocsListItem><Strong>最大件数</Strong>: 500件</DocsListItem>
      </DocsList>

      <DocsP>
        30日を過ぎた履歴、または500件を超えた古い履歴は、アプリ起動時に自動で削除されます。
      </DocsP>

      <DocsNote>
        <Strong>注意</Strong>: 履歴を削除すると、関連する音声ファイルも削除されます。
        大切な音声は詳細画面からダウンロードして保存しておくことをおすすめします。
      </DocsNote>

      <NextPage current="history" />

      <RelatedPages
        links={[
          { to: "/docs/recording-modes", title: "音声入力モード", description: "音声入力の使い方" },
          { to: "/docs/settings", title: "設定", description: "ショートカットキーの設定" },
        ]}
      />
    </>
  );
}
