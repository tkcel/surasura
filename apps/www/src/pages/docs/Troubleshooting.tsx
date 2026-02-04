import {
  DocsH1,
  DocsH2,
  DocsH3,
  DocsP,
  DocsList,
  DocsListItem,
  DocsOrderedList,
  DocsNote,
  ExternalLink,
  DocsLink,
  Strong,
  Code,
  RelatedPages,
} from "./components";

export function Troubleshooting() {
  return (
    <>
      <DocsH1>トラブルシューティング</DocsH1>

      <DocsP>
        surasuraを使用中に問題が発生した場合の解決方法をまとめました。
      </DocsP>

      <DocsH2>音声が認識されない</DocsH2>

      <DocsH3>マイクのアクセス許可を確認</DocsH3>
      <DocsP>
        surasuraがマイクにアクセスできる状態になっているか確認してください。
      </DocsP>

      <DocsP><Strong>macOSの場合</Strong>:</DocsP>
      <DocsOrderedList>
        <DocsListItem>「システム設定」を開く</DocsListItem>
        <DocsListItem>「プライバシーとセキュリティ」→「マイク」を選択</DocsListItem>
        <DocsListItem>「surasura」がオンになっているか確認</DocsListItem>
      </DocsOrderedList>

      <DocsP><Strong>Windowsの場合</Strong>:</DocsP>
      <DocsOrderedList>
        <DocsListItem>「設定」を開く</DocsListItem>
        <DocsListItem>「プライバシー」→「マイク」を選択</DocsListItem>
        <DocsListItem>「アプリがマイクにアクセスできるようにする」がオンになっているか確認</DocsListItem>
        <DocsListItem>「surasura」がオンになっているか確認</DocsListItem>
      </DocsOrderedList>

      <DocsH3>マイクが正しく選択されているか確認</DocsH3>
      <DocsP>
        外部マイクを使用している場合、OSのサウンド設定で正しいマイクが入力デバイスとして選択されているか確認してください。
      </DocsP>

      <DocsH3>マイクが他のアプリで使用されていないか確認</DocsH3>
      <DocsP>
        ビデオ会議アプリなど、他のアプリがマイクを占有していると認識できない場合があります。
        他のアプリを終了してからお試しください。
      </DocsP>

      <DocsH2>APIエラーが発生する</DocsH2>

      <DocsH3>APIキーが正しいか確認</DocsH3>
      <DocsP>
        設定画面でAPIキーが正しく入力されているか確認してください。
        コピー&ペースト時に余分なスペースが入っていないかも確認してください。
      </DocsP>

      <DocsH3>APIキーの有効性を確認</DocsH3>
      <DocsP>
        <ExternalLink href="https://platform.openai.com/api-keys">OpenAIのダッシュボード</ExternalLink>
        でAPIキーが有効な状態か確認してください。
      </DocsP>
      <DocsList>
        <DocsListItem>キーが無効化されていないか</DocsListItem>
        <DocsListItem>利用上限に達していないか</DocsListItem>
        <DocsListItem>支払い情報が正しく登録されているか</DocsListItem>
      </DocsList>

      <DocsH3>よくあるエラーメッセージ</DocsH3>

      <DocsP><Strong>「Invalid API key」</Strong></DocsP>
      <DocsP>
        APIキーが無効です。正しいキーを入力してください。
      </DocsP>

      <DocsP><Strong>「Rate limit exceeded」</Strong></DocsP>
      <DocsP>
        短時間に大量のリクエストを送信すると発生します。しばらく待ってから再度お試しください。
      </DocsP>

      <DocsP><Strong>「Insufficient quota」</Strong></DocsP>
      <DocsP>
        APIの利用上限に達しています。OpenAIのダッシュボードで利用状況を確認してください。
      </DocsP>

      <DocsH2>ショートカットが効かない</DocsH2>

      <DocsH3>アクセシビリティの許可を確認（macOS）</DocsH3>
      <DocsP>
        macOSではグローバルショートカットを使用するためにアクセシビリティの許可が必要です。
      </DocsP>
      <DocsOrderedList>
        <DocsListItem>「システム設定」を開く</DocsListItem>
        <DocsListItem>「プライバシーとセキュリティ」→「アクセシビリティ」を選択</DocsListItem>
        <DocsListItem>「surasura」がオンになっているか確認</DocsListItem>
        <DocsListItem>オフの場合はオンにして、アプリを再起動</DocsListItem>
      </DocsOrderedList>

      <DocsH3>他のアプリとの競合を確認</DocsH3>
      <DocsP>
        他のアプリが同じショートカットキーを使用していると競合します。
        <DocsLink to="/docs/settings">設定画面</DocsLink>から別のショートカットキーに変更してください。
      </DocsP>

      <DocsH3>surasuraが起動しているか確認</DocsH3>
      <DocsP>
        メニューバー（macOS）またはタスクトレイ（Windows）にsurasuraのアイコンが表示されているか確認してください。
        表示されていない場合は、アプリを起動してください。
      </DocsP>

      <DocsH2>アプリが起動しない</DocsH2>

      <DocsH3>macOSの場合</DocsH3>

      <DocsP><Strong>「開発元を確認できない」と表示される場合</Strong>:</DocsP>
      <DocsOrderedList>
        <DocsListItem>「システム設定」→「プライバシーとセキュリティ」を開く</DocsListItem>
        <DocsListItem>「セキュリティ」セクションで「このまま開く」をクリック</DocsListItem>
      </DocsOrderedList>

      <DocsP><Strong>「ファイルが壊れている」と表示される場合</Strong>:</DocsP>
      <DocsP>
        ターミナルで以下のコマンドを実行してください:
      </DocsP>
      <DocsP>
        <Code>xattr -cr /Applications/surasura.app</Code>
      </DocsP>

      <DocsH3>Windowsの場合</DocsH3>

      <DocsP><Strong>「Windows によって PC が保護されました」と表示される場合</Strong>:</DocsP>
      <DocsOrderedList>
        <DocsListItem>「詳細情報」をクリック</DocsListItem>
        <DocsListItem>「実行」をクリック</DocsListItem>
      </DocsOrderedList>

      <DocsH2>整形結果がおかしい</DocsH2>

      <DocsH3>辞書機能を活用</DocsH3>
      <DocsP>
        固有名詞や専門用語が正しく認識されない場合は、
        <DocsLink to="/docs/dictionary">辞書機能</DocsLink>で登録してください。
      </DocsP>

      <DocsH3>AIフォーマットを見直す</DocsH3>
      <DocsP>
        期待する出力と異なる場合は、
        <DocsLink to="/docs/presets">AIフォーマット</DocsLink>の設定を見直してください。
        カスタムAIフォーマットで、より詳細な指示を与えることもできます。
      </DocsP>

      <DocsH3>整形モデルを変更</DocsH3>
      <DocsP>
        より高精度な整形が必要な場合は、設定画面で整形モデルを<Code>gpt-4o</Code>に変更してください。
      </DocsP>

      <DocsH2>フローティングボタンが表示されない</DocsH2>

      <DocsH3>解決方法</DocsH3>
      <DocsP>
        一度アプリを終了し、再度起動してください。
      </DocsP>

      <DocsH2>それでも解決しない場合</DocsH2>

      <DocsP>
        上記の方法で解決しない場合は、以下の方法でお問い合わせください。
      </DocsP>

      <DocsList>
        <DocsListItem>
          <ExternalLink href="https://discord.gg/ffpmWv5d">Discord</ExternalLink> - 質問・要望・バグ報告
        </DocsListItem>
        <DocsListItem>
          <ExternalLink href="https://github.com/tkcel/surasura/issues">GitHub Issues</ExternalLink> - バグ報告・機能要望
        </DocsListItem>
      </DocsList>

      <DocsNote>
        個人開発のため、対応にお時間をいただく場合があります。お問い合わせの際は、OSのバージョン、surasuraのバージョン、エラーメッセージ（あれば）をお知らせいただくと、よりスムーズに対応できます。
      </DocsNote>

      <RelatedPages
        links={[
          { to: "/docs/getting-started", title: "はじめに", description: "初期設定の確認" },
          { to: "/docs/faq", title: "FAQ", description: "よくある質問" },
        ]}
      />
    </>
  );
}
