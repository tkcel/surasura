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
        特定の言葉を別の表現に置換したりできます。
      </DocsP>

      <DocsH2>辞書機能とは</DocsH2>

      <DocsP>
        音声認識は一般的な言葉は正確に認識しますが、以下のような言葉は誤認識されやすいです。
      </DocsP>

      <DocsList>
        <DocsListItem>社名や製品名（例: surasura → スラスラ）</DocsListItem>
        <DocsListItem>人名（例: 田中太郎 → 田中タロウ）</DocsListItem>
        <DocsListItem>専門用語（例: Kubernetes → クバネティス）</DocsListItem>
        <DocsListItem>略語（例: API → エーピーアイ）</DocsListItem>
      </DocsList>

      <DocsP>
        辞書機能を使うことで、これらの認識精度を大幅に向上できます。
      </DocsP>

      <DocsH2>2つのモード</DocsH2>

      <DocsH3>認識ヒントモード（置換なし）</DocsH3>

      <DocsP>
        AIに「この言葉が出てくる可能性がある」とヒントを与えます。
        認識精度が向上しますが、出力テキストは変更しません。
      </DocsP>

      <DocsP><Strong>使用例</Strong>:</DocsP>
      <DocsList>
        <DocsListItem>登録: 「surasura」</DocsListItem>
        <DocsListItem>話した内容: 「surasuraの使い方を説明します」</DocsListItem>
        <DocsListItem>出力: 「surasuraの使い方を説明します」（正しく認識される）</DocsListItem>
      </DocsList>

      <DocsH3>置換ルール</DocsH3>

      <DocsP>
        特定の言葉を別の表現に自動で置き換えます。
      </DocsP>

      <DocsP><Strong>使用例</Strong>:</DocsP>
      <DocsList>
        <DocsListItem>登録: 「よろしくお願いします」→「よろしくお願いいたします」</DocsListItem>
        <DocsListItem>話した内容: 「よろしくお願いします」</DocsListItem>
        <DocsListItem>出力: 「よろしくお願いいたします」</DocsListItem>
      </DocsList>

      <DocsH2>辞書の登録方法</DocsH2>

      <DocsRealImage src="/images/docs/辞書設定画面.png" alt="辞書設定画面" />

      <DocsH3>認識ヒントの登録</DocsH3>

      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>「辞書」タブを選択</DocsListItem>
        <DocsListItem>「認識ヒント」セクションで「追加」をクリック</DocsListItem>
        <DocsListItem>認識させたい言葉を入力</DocsListItem>
        <DocsListItem>「保存」をクリック</DocsListItem>
      </DocsOrderedList>

      <DocsH3>置換ルールの登録</DocsH3>

      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>「辞書」タブを選択</DocsListItem>
        <DocsListItem>「置換ルール」セクションで「追加」をクリック</DocsListItem>
        <DocsListItem>「変換前」と「変換後」を入力</DocsListItem>
        <DocsListItem>「保存」をクリック</DocsListItem>
      </DocsOrderedList>

      <DocsH2>活用例</DocsH2>

      <DocsH3>ビジネス用途</DocsH3>
      <DocsTable>
        <thead>
          <tr>
            <DocsTh>種類</DocsTh>
            <DocsTh>登録内容</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd>認識ヒント</DocsTd>
            <DocsTd>社名、製品名、プロジェクト名</DocsTd>
          </tr>
          <tr>
            <DocsTd>置換ルール</DocsTd>
            <DocsTd>「御社」→「貴社」、「弊社」→「当社」</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH3>技術用途</DocsH3>
      <DocsTable>
        <thead>
          <tr>
            <DocsTh>種類</DocsTh>
            <DocsTh>登録内容</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd>認識ヒント</DocsTd>
            <DocsTd>フレームワーク名、ライブラリ名、技術用語</DocsTd>
          </tr>
          <tr>
            <DocsTd>置換ルール</DocsTd>
            <DocsTd>「リアクト」→「React」、「タイプスクリプト」→「TypeScript」</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH3>日常用途</DocsH3>
      <DocsTable>
        <thead>
          <tr>
            <DocsTh>種類</DocsTh>
            <DocsTh>登録内容</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd>認識ヒント</DocsTd>
            <DocsTd>友人の名前、地名、店名</DocsTd>
          </tr>
          <tr>
            <DocsTd>置換ルール</DocsTd>
            <DocsTd>顔文字や絵文字への変換</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH2>Tips</DocsH2>

      <DocsH3>効果的な登録のコツ</DocsH3>
      <DocsOrderedList>
        <DocsListItem><Strong>頻出する言葉を優先</Strong>: よく使う言葉から登録</DocsListItem>
        <DocsListItem><Strong>表記ゆれを統一</Strong>: 「お問い合わせ」「お問合せ」など</DocsListItem>
        <DocsListItem><Strong>文脈を考慮</Strong>: 同音異義語は置換ルールで対応</DocsListItem>
      </DocsOrderedList>

      <DocsH3>注意点</DocsH3>
      <DocsList>
        <DocsListItem>登録数が多すぎると処理が遅くなる場合があります</DocsListItem>
        <DocsListItem>置換ルールは完全一致で動作します</DocsListItem>
        <DocsListItem>大文字/小文字は区別されます</DocsListItem>
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
