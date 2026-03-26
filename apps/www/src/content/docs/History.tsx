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
        過去の文字起こしの確認、テキストのコピー、音声の再生、削除などが行えます。
      </DocsP>

      <DocsH2>履歴の確認</DocsH2>

      <DocsH3>履歴画面を開く</DocsH3>
      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>左サイドバーの「履歴」を選択</DocsListItem>
      </DocsOrderedList>

      <DocsP>
        履歴は新しい順に表示され、テキストの内容、日時、言語を確認できます。
        画面上部には全件数と保存上限（最大500件 / 30日間）が表示されます。
      </DocsP>

      <DocsH3>ページネーション</DocsH3>
      <DocsP>
        履歴は1ページ20件ずつ表示されます。
        画面下部の「前へ」「次へ」ボタンでページを移動できます。
      </DocsP>

      <DocsH3>履歴の検索</DocsH3>
      <DocsP>
        画面上部の検索ボックスから、テキスト内容で履歴を絞り込めます。
        大文字・小文字を区別せずに検索されます。
      </DocsP>

      <DocsH2>履歴からの操作</DocsH2>

      <DocsP>
        各履歴アイテムにカーソルを合わせると、右側に操作ボタンが表示されます。
      </DocsP>

      <DocsH3>詳細を表示</DocsH3>
      <DocsP>
        目のアイコンをクリックすると、詳細ダイアログが開きます。以下の情報を確認できます。
      </DocsP>
      <DocsList>
        <DocsListItem><Strong>整形後テキスト</Strong>: プリセットで整形された最終テキスト</DocsListItem>
        <DocsListItem><Strong>整形前テキスト</Strong>: 音声認識のそのままの結果（「整形前を表示」で切り替え）</DocsListItem>
        <DocsListItem><Strong>音声再生</Strong>: 録音した音声をその場で再生・一時停止</DocsListItem>
        <DocsListItem><Strong>メタデータ</Strong>: 日時、言語、使用した音声認識モデル、プリセット名、整形モデル</DocsListItem>
      </DocsList>

      <DocsH3>テキストをコピー</DocsH3>
      <DocsP>
        コピーボタンをクリックすると、整形済みテキストをクリップボードにコピーできます。
      </DocsP>

      <DocsH3>音声ファイルの保存</DocsH3>
      <DocsP>
        詳細ダイアログから、録音した音声ファイルをFinderやエクスプローラーで表示したり、
        任意の場所にダウンロード保存することができます。
      </DocsP>

      <DocsH2>履歴の削除</DocsH2>

      <DocsH3>単件削除</DocsH3>
      <DocsP>
        各アイテムのゴミ箱アイコンをクリックすると、確認後に削除されます。
        関連する音声ファイルも同時に削除されます。
      </DocsP>

      <DocsH3>複数選択して削除</DocsH3>
      <DocsOrderedList>
        <DocsListItem>各アイテム左側のチェックボックスで選択（ヘッダーのチェックボックスで全選択も可能）</DocsListItem>
        <DocsListItem>「○件を削除」ボタンをクリック</DocsListItem>
        <DocsListItem>確認ダイアログで「削除」を選択</DocsListItem>
      </DocsOrderedList>

      <DocsH3>すべて削除</DocsH3>
      <DocsP>
        画面右上の「すべて削除」ボタンから、全履歴を一括削除できます。
      </DocsP>

      <DocsH2>履歴ペースト</DocsH2>

      <DocsP>
        直前の文字起こし結果を再度ペーストしたい場合は、ショートカットキーが便利です。
      </DocsP>

      <DocsH3>使い方</DocsH3>
      <DocsOrderedList>
        <DocsListItem>
          <DocsLink to="/docs/settings">設定画面</DocsLink>のショートカット設定で、履歴ペーストのキーを確認・変更
        </DocsListItem>
        <DocsListItem>設定したショートカットキーを押す</DocsListItem>
        <DocsListItem>直前の文字起こし結果がカーソル位置にペーストされる</DocsListItem>
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
        上記の制限を超えた古い履歴は、アプリ起動時に自動で削除されます。
      </DocsP>

      <DocsNote>
        <Strong>注意</Strong>: 履歴を削除すると、関連する音声ファイルも削除されます。
        大切な音声は詳細画面からダウンロードして保存しておくことをおすすめします。
      </DocsNote>

      <NextPage current="history" />

      <RelatedPages
        links={[
          { to: "/docs/settings", title: "設定", description: "ショートカットキーの設定" },
          { to: "/docs/presets", title: "プリセット", description: "テキスト整形の設定" },
        ]}
      />
    </>
  );
}
