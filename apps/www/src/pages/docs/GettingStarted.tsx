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
  ExternalLink,
  DocsImage,
  Steps,
  Step,
  Strong,
  Code,
  Kbd,
  NextPage,
  RelatedPages,
} from "./components";

export function GettingStarted() {
  return (
    <>
      <DocsH1>はじめに</DocsH1>

      <DocsP>
        surasuraは、音声入力をAIで整形・変換するデスクトップアプリです。
        話した内容がそのまま綺麗なテキストになり、どんなアプリでも使えます。
      </DocsP>

      <DocsH2>インストール</DocsH2>

      <DocsH3>macOS</DocsH3>

      <DocsOrderedList>
        <DocsListItem>
          <DocsLink to="/">ダウンロードページ</DocsLink>からお使いのMacに合ったバージョンをダウンロード
          <DocsList>
            <DocsListItem>
              <Strong>Apple シリコン（M1/M2/M3/M4）</Strong>: <Code>surasura_x.x.x_aarch64.dmg</Code>
            </DocsListItem>
            <DocsListItem>
              <Strong>Intel Mac</Strong>: <Code>surasura_x.x.x_x64.dmg</Code>
            </DocsListItem>
          </DocsList>
        </DocsListItem>
        <DocsListItem>ダウンロードした<Code>.dmg</Code>ファイルを開く</DocsListItem>
        <DocsListItem>surasuraアイコンをApplicationsフォルダにドラッグ</DocsListItem>
        <DocsListItem>
          初回起動時、「開発元が未確認」と表示された場合は、システム設定 &gt; プライバシーとセキュリティ から「このまま開く」を選択
        </DocsListItem>
      </DocsOrderedList>

      <DocsH3>Windows</DocsH3>

      <DocsOrderedList>
        <DocsListItem>
          <DocsLink to="/">ダウンロードページ</DocsLink>から<Code>surasura_x.x.x_x64-setup.exe</Code>をダウンロード
        </DocsListItem>
        <DocsListItem>ダウンロードしたインストーラーを実行</DocsListItem>
        <DocsListItem>画面の指示に従ってインストール</DocsListItem>
      </DocsOrderedList>

      <DocsH2>OpenAI APIキーの設定</DocsH2>

      <DocsP>
        surasuraを使用するには、OpenAIのAPIキーが必要です。
      </DocsP>

      <DocsH3>APIキーの取得方法</DocsH3>

      <Steps>
        <Step number={1} title="OpenAI Platformにアクセス">
          <ExternalLink href="https://platform.openai.com/">platform.openai.com</ExternalLink>を開きます
        </Step>
        <Step number={2} title="アカウントを作成またはログイン" />
        <Step number={3} title="API keysメニューから「Create new secret key」をクリック" />
        <Step number={4} title="生成されたキーをコピー">
          <Code>sk-</Code>で始まる文字列です
        </Step>
      </Steps>

      <DocsH3>surasuraへの設定</DocsH3>

      <DocsImage alt="APIキー設定画面" />

      <Steps>
        <Step number={1} title="surasuraを起動" />
        <Step number={2} title="設定画面を開く">
          メニューバーのアイコンをクリック → 設定
        </Step>
        <Step number={3} title="「APIキー」欄に取得したキーを貼り付け" />
        <Step number={4} title="「保存」をクリック" />
      </Steps>

      <DocsNote>
        <Strong>料金について</Strong>: OpenAI APIは従量課金制です。
        surasuraの通常使用では、1時間の音声入力で約$0.01〜0.05程度です。
        詳しくは<DocsLink to="/docs/faq">FAQ</DocsLink>をご覧ください。
      </DocsNote>

      <DocsH2>基本的な使い方</DocsH2>

      <DocsImage alt="フローティングボタンの状態変化" />

      <DocsH3>1. 音声入力を開始</DocsH3>
      <DocsP>
        デフォルトのショートカットキー <Kbd>Fn</Kbd>（macOS）または <Kbd>Ctrl + Win</Kbd>（Windows）を押しながら話します。
      </DocsP>

      <DocsH3>2. 音声入力を終了</DocsH3>
      <DocsP>
        キーを離すと音声入力が終了し、自動的にAIが整形を開始します。
      </DocsP>

      <DocsH3>3. テキストがペースト</DocsH3>
      <DocsP>
        整形が完了すると、現在カーソルがある位置にテキストが自動的にペーストされます。
      </DocsP>

      <DocsH2>クイックスタート</DocsH2>

      <Steps>
        <Step number={1} title="APIキーを設定">
          上記の手順でOpenAI APIキーを設定
        </Step>
        <Step number={2} title="ショートカットを覚える">
          <Kbd>Fn</Kbd>（macOS）/ <Kbd>Ctrl + Win</Kbd>（Windows）を押しながら話す
        </Step>
        <Step number={3} title="好みのAIフォーマットを選ぶ">
          標準、カジュアル、即時回答から選択
        </Step>
        <Step number={4} title="どんなアプリでも使う">
          メール、チャット、ドキュメントなど、テキスト入力ができる場所ならどこでも
        </Step>
      </Steps>

      <NextPage current="getting-started" />

      <RelatedPages
        links={[
          { to: "/docs/presets", title: "AIフォーマット（プリセット）", description: "整形スタイルのカスタマイズ" },
          { to: "/docs/dictionary", title: "辞書機能", description: "固有名詞や専門用語の認識精度向上" },
        ]}
      />
    </>
  );
}
