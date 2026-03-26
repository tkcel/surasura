import {
  DocsH1,
  DocsH2,
  DocsH3,
  DocsP,
  DocsList,
  DocsListItem,
  DocsOrderedList,
  DocsTable,
  DocsTh,
  DocsTd,
  DocsRealImage,
  DocsNote,
  Steps,
  Step,
  Strong,
  Code,
  CodeBlock,
  NextPage,
  RelatedPages,
} from "./components";

export function Presets() {
  return (
    <>
      <DocsH1>プリセット</DocsH1>

      <DocsP>
        プリセットは、音声をどのようにテキストに変換するかを定義する設定です。
        用途に合わせて使い分けることで、より自然で使いやすいテキストが得られます。
      </DocsP>

      <DocsH2>プリセットの種類</DocsH2>

      <DocsP>
        surasuraには2種類のプリセットがあります。
      </DocsP>

      <DocsH3>整形タイプ</DocsH3>
      <DocsP>
        音声認識した文字起こしを<Strong>整形</Strong>して出力します。
        話した内容の意味は変えず、読みやすく整えます。
      </DocsP>
      <DocsList>
        <DocsListItem>口語表現を適切な書き言葉に変換</DocsListItem>
        <DocsListItem>句読点を適切に配置</DocsListItem>
        <DocsListItem>「えーと」「あのー」などのフィラーを除去</DocsListItem>
      </DocsList>

      <DocsH3>回答タイプ</DocsH3>
      <DocsP>
        文字起こしを<Strong>質問として解釈</Strong>し、AIが回答を生成します。
      </DocsP>
      <DocsList>
        <DocsListItem>質問に対する回答を生成</DocsListItem>
        <DocsListItem>調べ物や計算の結果を出力</DocsListItem>
        <DocsListItem>アイデア出しの補助</DocsListItem>
      </DocsList>

      <DocsH2>デフォルトのプリセット</DocsH2>

      <DocsH3>標準</DocsH3>
      <DocsP>
        自然で読みやすい日本語に整形します。フォーカス中のアプリに適した出力形式で整形されます。
      </DocsP>
      <DocsP>
        <Strong>入力例</Strong>: 「えーと明日の会議なんですけど10時からでお願いしますあとちょっと資料の確認もしたいので」
      </DocsP>
      <DocsP>
        <Strong>出力例</Strong>: 「明日の会議は10時からでお願いします。また、資料の確認もしたいと思います。」
      </DocsP>

      <DocsH3>文字起こし</DocsH3>
      <DocsP>
        テキスト整形をスキップし、音声認識の結果をそのまま出力します（整形OFF）。最速で結果を得たいときに最適です。
      </DocsP>
      <DocsP>
        <Strong>入力例</Strong>: 「えーと明日の会議なんですけど10時からでお願いします」
      </DocsP>
      <DocsP>
        <Strong>出力例</Strong>: 「えーと明日の会議なんですけど10時からでお願いします」
      </DocsP>

      <DocsH3>即時回答</DocsH3>
      <DocsP>
        音声で質問すると、AIが回答を生成します。クリップボードやフォーカス中のアプリの情報も参考にして回答します。
      </DocsP>
      <DocsP>
        <Strong>入力例</Strong>: 「東京タワーの高さを教えて」
      </DocsP>
      <DocsP>
        <Strong>出力例</Strong>: 「東京タワーの高さは333メートルです。」
      </DocsP>

      <DocsH2>プリセットの切り替え</DocsH2>

      <DocsRealImage src="/images/docs/プリセット選択メニュー.png" alt="プリセット選択メニュー" />

      <DocsP>
        プリセットはいつでも簡単に切り替えることができます。
      </DocsP>

      <DocsH3>ウィジェットから切り替え（おすすめ）</DocsH3>
      <DocsOrderedList>
        <DocsListItem>フローティングウィジェットを右クリック</DocsListItem>
        <DocsListItem>プリセット一覧から選択</DocsListItem>
      </DocsOrderedList>

      <DocsH3>設定画面から切り替え</DocsH3>
      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>「デフォルトのプリセット」から選択</DocsListItem>
      </DocsOrderedList>

      <DocsH2>カスタムプリセット作成</DocsH2>

      <DocsRealImage src="/images/docs/プリセット編集画面.png" alt="プリセット編集画面" />

      <DocsP>
        独自のプリセットを作成して、特定の用途に最適化された出力を得ることができます。
      </DocsP>

      <DocsH3>作成手順</DocsH3>
      <Steps>
        <Step number={1} title="設定画面を開く" />
        <Step number={2} title="「プリセット」タブを選択" />
        <Step number={3} title="「新規作成」をクリック" />
        <Step number={4} title="名前、種類（整形/回答）、プロンプトを入力" />
        <Step number={5} title="「保存」をクリック" />
      </Steps>

      <DocsH3>プロンプトの書き方</DocsH3>
      <DocsP>
        プロンプトには、AIへの指示を記述します。
      </DocsP>

      <DocsP><Strong>整形タイプの例</Strong>:</DocsP>
      <CodeBlock>{`以下の文字起こしを、技術ブログの記事として適切な文体に整形してください。
専門用語はそのまま残し、コードに言及している部分は適切にフォーマットしてください。`}</CodeBlock>

      <DocsP><Strong>回答タイプの例</Strong>:</DocsP>
      <CodeBlock>{`以下の質問に、プログラマーとして技術的に正確に回答してください。
必要に応じてコード例を含めてください。`}</CodeBlock>

      <DocsH2>変数の活用</DocsH2>

      <DocsP>
        プロンプト内で以下の変数を使用できます。
      </DocsP>

      <DocsTable>
        <thead>
          <tr>
            <DocsTh>変数</DocsTh>
            <DocsTh>説明</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd><Code>{"{{transcription}}"}</Code></DocsTd>
            <DocsTd>音声から文字起こしされたテキスト</DocsTd>
          </tr>
          <tr>
            <DocsTd><Code>{"{{clipboard}}"}</Code></DocsTd>
            <DocsTd>クリップボードの内容</DocsTd>
          </tr>
          <tr>
            <DocsTd><Code>{"{{appName}}"}</Code></DocsTd>
            <DocsTd>現在アクティブなアプリケーション名</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH3>活用例</DocsH3>

      <DocsP><Strong>アプリに応じた整形</Strong>:</DocsP>
      <CodeBlock>{`現在のアプリは「{{appName}}」です。
このアプリに適した文体で以下を整形してください。
Slackなら絵文字を使ってカジュアルに、メールアプリなら丁寧に。

{{transcription}}`}</CodeBlock>

      <DocsP><Strong>クリップボードを参照した回答</Strong>:</DocsP>
      <CodeBlock>{`以下のコードについて質問します。

コード:
{{clipboard}}

質問:
{{transcription}}`}</CodeBlock>

      <DocsH2>プリセットのリセット</DocsH2>

      <DocsP>
        環境設定の「プリセットリセット」から、すべてのプリセットをデフォルトに戻すことができます。
      </DocsP>

      <DocsNote>
        <Strong>注意</Strong>: リセットすると、カスタムで作成したプリセットも含めてすべて削除され、デフォルトのプリセット（標準、文字起こし、即時回答）のみになります。
      </DocsNote>

      <NextPage current="presets" />

      <RelatedPages
        links={[
          { to: "/docs/settings", title: "設定", description: "その他の設定" },
        ]}
      />
    </>
  );
}
