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
  Strong,
  NextPage,
  RelatedPages,
} from "./components";

export function Dictionary() {
  return (
    <>
      <DocsH1>辞書機能</DocsH1>

      <DocsP>
        辞書機能を使うと、固有名詞や専門用語の認識精度を向上させたり、
        よく誤認識される読み方を正しい単語に自動修正できます。
      </DocsP>

      <DocsH2>辞書機能とは</DocsH2>

      <DocsP>
        音声認識は一般的な言葉は正確に認識しますが、以下のような言葉は誤認識されやすいです。
      </DocsP>

      <DocsList>
        <DocsListItem>社名や製品名（例: Surasura → スラスラ）</DocsListItem>
        <DocsListItem>人名（例: 田中太郎 → 田中タロウ）</DocsListItem>
        <DocsListItem>専門用語（例: Kubernetes → クバネティス）</DocsListItem>
        <DocsListItem>略語（例: API → エーピーアイ）</DocsListItem>
      </DocsList>

      <DocsP>
        辞書機能では、<Strong>正しい表記の単語</Strong>と<Strong>読み方パターン</Strong>（最大3つ）を
        登録することで、認識精度の向上と自動修正を同時に実現します。
      </DocsP>

      <DocsH2>仕組み</DocsH2>

      <DocsP>
        登録した単語は以下の3つの場面で活用されます。
      </DocsP>

      <DocsOrderedList>
        <DocsListItem><Strong>音声認識のヒント</Strong>: 登録した単語をWhisperに語彙ヒントとして渡し、認識精度を向上</DocsListItem>
        <DocsListItem><Strong>テキスト整形時の修正</Strong>: AIが辞書を参照し、読み方パターンで認識された場合は正しい単語に修正</DocsListItem>
        <DocsListItem><Strong>最終置換処理</Strong>: 読み方パターンがテキストに残っている場合、正しい単語に自動置換</DocsListItem>
      </DocsOrderedList>

      <DocsP><Strong>例</Strong>:</DocsP>
      <DocsList>
        <DocsListItem>登録: 単語「Surasura」、読み方「スラスラ」「すらすら」</DocsListItem>
        <DocsListItem>話した内容: 「スラスラを起動して」</DocsListItem>
        <DocsListItem>出力: 「Surasuraを起動して」</DocsListItem>
      </DocsList>

      <DocsH2>辞書の登録方法</DocsH2>

      <DocsRealImage src="/images/docs/辞書設定画面.png" alt="辞書設定画面" />

      <DocsP>
        設定画面の「辞書機能」タブから、「+ 単語を追加」ボタンをクリックすると登録ダイアログが開きます。
      </DocsP>

      <DocsOrderedList>
        <DocsListItem>「+ 単語を追加」をクリック</DocsListItem>
        <DocsListItem>「単語（正しい表記）」に正しい表記を入力（例: Surasura）</DocsListItem>
        <DocsListItem>必要に応じて「読み方パターン」を入力（例: スラスラ）</DocsListItem>
        <DocsListItem>「追加」をクリック</DocsListItem>
      </DocsOrderedList>

      <DocsP>
        読み方パターンは任意です。単語だけを登録しても認識ヒントとして機能します。
        読み方パターンを追加すると、誤認識された場合の自動修正が有効になります。
      </DocsP>

      <DocsH2>活用例</DocsH2>

      <DocsH3>ビジネス用途</DocsH3>
      <DocsTable>
        <thead>
          <tr>
            <DocsTh>単語</DocsTh>
            <DocsTh>読み方パターン</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd>社名・製品名</DocsTd>
            <DocsTd>カタカナ表記、ひらがな表記など</DocsTd>
          </tr>
          <tr>
            <DocsTd>貴社</DocsTd>
            <DocsTd>御社</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH3>技術用途</DocsH3>
      <DocsTable>
        <thead>
          <tr>
            <DocsTh>単語</DocsTh>
            <DocsTh>読み方パターン</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd>Kubernetes</DocsTd>
            <DocsTd>クバネティス, クーベネティス</DocsTd>
          </tr>
          <tr>
            <DocsTd>React</DocsTd>
            <DocsTd>リアクト</DocsTd>
          </tr>
          <tr>
            <DocsTd>TypeScript</DocsTd>
            <DocsTd>タイプスクリプト</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH3>日常用途</DocsH3>
      <DocsTable>
        <thead>
          <tr>
            <DocsTh>単語</DocsTh>
            <DocsTh>読み方パターン</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd>友人の名前、地名、店名</DocsTd>
            <DocsTd>誤認識されやすい表記</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH2>Tips</DocsH2>

      <DocsH3>効果的な登録のコツ</DocsH3>
      <DocsOrderedList>
        <DocsListItem><Strong>頻出する言葉を優先</Strong>: よく使う言葉から登録</DocsListItem>
        <DocsListItem><Strong>読み方パターンを活用</Strong>: カタカナ・ひらがな両方を登録すると効果的</DocsListItem>
        <DocsListItem><Strong>表記ゆれを統一</Strong>: 正しい表記を単語に、バリエーションを読み方に登録</DocsListItem>
      </DocsOrderedList>

      <DocsH3>注意点</DocsH3>
      <DocsList>
        <DocsListItem>登録は最大500件までです</DocsListItem>
        <DocsListItem>読み方パターンは1つの単語につき最大3つまで</DocsListItem>
        <DocsListItem>読み方パターンによる置換は完全一致で動作します</DocsListItem>
      </DocsList>

      <NextPage current="dictionary" />

      <RelatedPages
        links={[
          { to: "/docs/presets", title: "AIフォーマット（プリセット）", description: "整形スタイルの設定" },
          { to: "/docs/troubleshooting", title: "トラブルシューティング", description: "認識がうまくいかない場合" },
        ]}
      />
    </>
  );
}
