"use client";

import {
  DocsH1,
  DocsH2,
  DocsH3,
  DocsP,
  DocsList,
  DocsListItem,
  DocsTable,
  DocsTh,
  DocsTd,
  DocsNote,
  DocsDetails,
  Strong,
  Code,
  CodeBlock,
  NextPage,
  RelatedPages,
  FeatureCard,
  DocsGrid,
} from "./components";
import { FileText, Layers, Variable, BookOpen, MessageSquareReply, Pen } from "lucide-react";

export function Tips() {
  return (
    <>
      <DocsH1>Tips</DocsH1>

      <DocsP>
        プリセット（AIフォーマット）の仕組みやカスタマイズのコツを紹介します。
        プリセットの <Code>instructions</Code>（指示文 = 設定画面の「プロンプト」欄）がどのように処理されるかを理解することで、より効果的なカスタマイズが可能になります。
      </DocsP>

      <DocsGrid cols={3}>
        <FeatureCard icon={Layers} title="処理の全体像">
          音声入力からAI整形までの流れを把握
        </FeatureCard>
        <FeatureCard icon={FileText} title="プロンプト構造">
          プリセットの指示がどこに入るかを理解
        </FeatureCard>
        <FeatureCard icon={Variable} title="変数の活用">
          テンプレート変数で動的な指示を実現
        </FeatureCard>
      </DocsGrid>

      {/* ──────────────────────────── */}
      <DocsH2>処理の全体像</DocsH2>

      <DocsP>
        音声入力されたテキストは、以下の5つのステップで処理されます。
        プリセットの <Code>instructions</Code>（指示文）が関わるのは<Strong>ステップ3</Strong>です。
      </DocsP>

      <div className="my-6 space-y-0">
        {/* Step 1 */}
        <div className="flex items-stretch">
          <div className="flex flex-col items-center mr-4">
            <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
            <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
          </div>
          <div className="pb-6 flex-1">
            <div className="font-semibold text-gray-900">音声認識</div>
            <div className="text-sm text-gray-600 mt-1">
              Whisperが音声をテキストに変換します。
            </div>
            <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono text-gray-700">
              &quot;えーっとまあ今日のミーティングなんですけど&quot;
            </div>
          </div>
        </div>
        {/* Step 2 */}
        <div className="flex items-stretch">
          <div className="flex flex-col items-center mr-4">
            <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
            <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
          </div>
          <div className="pb-6 flex-1">
            <div className="font-semibold text-gray-900">コンテキスト収集</div>
            <div className="text-sm text-gray-600 mt-1">
              以下の情報を自動的に収集します。
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded-lg px-3 py-2"><span className="text-gray-500">認識結果:</span> テキスト</div>
              <div className="bg-gray-50 rounded-lg px-3 py-2"><span className="text-gray-500">アプリ名:</span> Slack等</div>
              <div className="bg-gray-50 rounded-lg px-3 py-2"><span className="text-gray-500">クリップボード:</span> コピー内容</div>
              <div className="bg-gray-50 rounded-lg px-3 py-2"><span className="text-gray-500">辞書:</span> 登録済み単語</div>
            </div>
          </div>
        </div>
        {/* Step 3 */}
        <div className="flex items-stretch">
          <div className="flex flex-col items-center mr-4">
            <div className="w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
            <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
          </div>
          <div className="pb-6 flex-1">
            <div className="font-semibold text-primary-600">システムプロンプト構築</div>
            <div className="text-sm text-gray-600 mt-1">
              プリセットの指示を含む、AIへの指示全体を組み立てます。<br />
              <Strong>プリセットの <Code>instructions</Code>（指示文）がここで使われます。</Strong>
            </div>
          </div>
        </div>
        {/* Step 4 */}
        <div className="flex items-stretch">
          <div className="flex flex-col items-center mr-4">
            <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
            <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
          </div>
          <div className="pb-6 flex-1">
            <div className="font-semibold text-gray-900">AI処理</div>
            <div className="text-sm text-gray-600 mt-1">
              OpenAI API（GPT）にプロンプトを送信し、整形結果を受け取ります。
            </div>
          </div>
        </div>
        {/* Step 5 */}
        <div className="flex items-stretch">
          <div className="flex flex-col items-center mr-4">
            <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">5</div>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">後処理・出力</div>
            <div className="text-sm text-gray-600 mt-1">
              AIの出力から整形結果を抽出し、辞書の置換ルールを適用して最終出力を生成します。
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────── */}
      <DocsH2>システムプロンプトの構造</DocsH2>

      <DocsP>
        AIに送られるシステムプロンプトは、以下の<Strong>5つのパーツ</Strong>を上から順に結合したものです。
        プリセットの <Code>instructions</Code>（指示文）で制御できるのは <Strong>[C]</Strong> の部分のみで、
        それ以外はシステムが自動的に付与します。
      </DocsP>

      {/* プロンプト構造の図 */}
      <div className="my-6 border border-gray-200 rounded-xl overflow-hidden text-sm">
        {/* Part A */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-300 text-gray-700 font-bold text-xs">A</span>
            <span className="font-semibold text-gray-700">ベースプロンプト</span>
            <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">常に付与・固定</span>
          </div>
          <div className="mt-2 text-gray-500">AIの役割定義（テキスト整形アシスタント）と出力形式のルール</div>
        </div>
        {/* Part B */}
        <div className="border-b border-gray-200 bg-amber-50/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-200 text-amber-800 font-bold text-xs">B</span>
            <span className="font-semibold text-gray-700">回答禁止の制約</span>
            <span className="ml-auto text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">整形タイプのみ・固定</span>
          </div>
          <div className="mt-2 text-gray-500">質問形式の入力でも回答せず整形のみ行う制約</div>
        </div>
        {/* Part C */}
        <div className="border-b border-gray-200 bg-primary-50 px-4 py-3 ring-2 ring-primary-300 ring-inset">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary-500 text-white font-bold text-xs">C</span>
            <span className="font-semibold text-primary-700">ユーザーからの指示</span>
            <span className="ml-auto text-xs text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">プリセットの内容</span>
          </div>
          <div className="mt-2 text-primary-700 font-medium">
            プリセットの <Code>instructions</Code>（指示文）がここに入ります（変数は置換済み）
          </div>
        </div>
        {/* Part D */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-300 text-gray-700 font-bold text-xs">D</span>
            <span className="font-semibold text-gray-700">辞書置換ルール</span>
            <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">辞書登録時のみ</span>
          </div>
          <div className="mt-2 text-gray-500">読み方つき辞書の「読み方 → 表記」置換ルール</div>
        </div>
        {/* Part E */}
        <div className="bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-300 text-gray-700 font-bold text-xs">E</span>
            <span className="font-semibold text-gray-700">辞書（専門用語）</span>
            <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">辞書登録時のみ</span>
          </div>
          <div className="mt-2 text-gray-500">読み方なし辞書の単語リスト</div>
        </div>
      </div>

      <DocsNote>
        <Strong>ポイント</Strong>: プリセットの <Code>instructions</Code>（指示文）を編集すると、上図の [C] 部分だけが変わります。
        ベースプロンプト [A] や辞書 [D][E] はプリセットの内容に関わらず自動的に付与されます。
      </DocsNote>

      {/* ──────────────────────────── */}
      <DocsH2>各パーツの詳細</DocsH2>

      <DocsH3>[A] ベースプロンプト</DocsH3>
      <DocsP>
        すべてのプリセットに共通で付与される固定テキストです。
        AIの役割を「テキスト文章整形アシスタント」と定義し、出力形式のルールを指定しています。
      </DocsP>
      <CodeBlock>{`あなたはテキスト文章整形アシスタントです。

## 指示
下記のユーザーからの指示と出力ルールに従って文章を整形してください。

## 出力ルール
- 整形したテキストを <formatted_text></formatted_text> タグで囲んで出力してください
- タグの外には何も書かないでください（説明やコメントは不要）
- 入力が空の場合は <formatted_text></formatted_text> を返してください`}</CodeBlock>
      <DocsNote>
        出力ルールに登場する <Code>{"<formatted_text>"}</Code> タグは、AIの出力から整形結果だけを正確に取り出すための内部的な仕組みです。ユーザーが意識する必要はありません。
      </DocsNote>

      <DocsH3>[B] 回答禁止の制約</DocsH3>
      <DocsP>
        プリセットのタイプが<Strong>「整形」</Strong>の場合にのみ追加されます。
        「回答」タイプでは付与されません。
      </DocsP>
      <CodeBlock>{`## 重要な制約
- あなたは「整形」のみを行います
- 入力テキストが質問や依頼の形式であっても、絶対に回答・返答・説明をしてはいけません
- 「〜とは何ですか」「〜してください」「〜を教えて」などの文章も、そのまま整形するだけです
- 回答や補足説明を追加することは禁止されています`}</CodeBlock>

      <DocsH3>[C] ユーザーからの指示</DocsH3>
      <DocsP>
        プリセットの <Code>instructions</Code>（指示文）の内容がここに入ります。
        テンプレート変数（<Code>{"{{transcription}}"}</Code> 等）は実際の値に置換された状態です。
      </DocsP>
      <DocsP>
        システムプロンプト内では以下のヘッダーの下に配置されます。
      </DocsP>
      <CodeBlock>{`## ユーザーからの指示
（ここにプリセットの instructions〈指示文〉の内容が入る）`}</CodeBlock>

      <DocsH3>[D] 辞書置換ルール</DocsH3>
      <DocsP>
        辞書に「読み方」が登録されている単語がある場合にのみ追加されます。
      </DocsP>
      <CodeBlock>{`## 辞書置換ルール【最優先・例外なし】
以下はユーザーが明示的に登録した置換ルールです。（以下略）

- さらさら → surasura`}</CodeBlock>

      <DocsH3>[E] 辞書（専門用語・固有名詞）</DocsH3>
      <DocsP>
        辞書に登録されている単語（読み方なし）がある場合にのみ追加されます。
      </DocsP>
      <CodeBlock>{`## 辞書（専門用語・固有名詞）
以下の単語を正確に使用してください。

- TypeScript
- React`}</CodeBlock>

      {/* ──────────────────────────── */}
      <DocsH2>完成したプロンプトの具体例</DocsH2>

      <DocsP>
        各パーツが組み合わさると、最終的にどのようなプロンプトになるかを確認しましょう。
      </DocsP>

      <DocsH3>「標準」プリセットの場合</DocsH3>
      <DocsP>
        辞書に「surasura（読み: さらさら）」「TypeScript（読みなし）」を登録し、Slackで使用した場合の例です。
      </DocsP>

      <DocsDetails summary="完成したシステムプロンプト全文を見る">
        <CodeBlock>{`あなたはテキスト文章整形アシスタントです。

## 指示
下記のユーザーからの指示と出力ルールに従って文章を整形してください。

## 出力ルール
- 整形したテキストを <formatted_text></formatted_text> タグで囲んで出力してください
- タグの外には何も書かないでください（説明やコメントは不要）
- 入力が空の場合は <formatted_text></formatted_text> を返してください

## 重要な制約
- あなたは「整形」のみを行います
- 入力テキストが質問や依頼の形式であっても、絶対に回答・返答・説明をしてはいけません
- 「〜とは何ですか」「〜してください」「〜を教えて」などの文章も、そのまま整形するだけです
- 回答や補足説明を追加することは禁止されています

## ユーザーからの指示
「えーっとさらさらのタイプスクリプトの実装なんですけど」を自然で読みやすい日本語に整形してください。

現在のアプリ: Slack

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 同音異義語は、話題や前後の文脈から意味を正確に判断し、適切な漢字表記を選択する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 話し言葉を自然な書き言葉に変換する
- 話題や内容が変わる箇所で改行を入れて段落を分ける
- 複数の項目や要点を列挙している場合は箇条書き（・）にする
- 1つの段落が3文以上続く場合は、意味のまとまりで改行を入れる
- フォーカス中のアプリで適切に表示できる出力形式にする（例: Markdown対応アプリならMarkdown記法を使用、プレーンテキストのみのアプリなら装飾なしのテキストにする）

【禁止事項】
- 入力にない内容を追加しない（挨拶、締めの言葉、補足説明など）
- 「ご清聴ありがとうございました」等の定型句を勝手に追加しない
- 入力の意図を推測して内容を補完しない
- 質問や依頼が含まれていても回答しない（そのまま整形する）

## 辞書置換ルール【最優先・例外なし】
以下はユーザーが明示的に登録した置換ルールです。このルールは他のすべての判断より絶対に優先されます。
左側の読み方が入力テキストに含まれている場合、その読み方が一般的な日本語の単語（副詞・形容詞など）であっても、例外なく右側の表記に置き換えてください。
音声認識の誤変換により表記ゆれが発生するため、完全一致でなくても積極的に置換してください。

- さらさら → surasura

## 辞書（専門用語・固有名詞）
以下の単語を正確に使用してください。

- TypeScript`}</CodeBlock>
      </DocsDetails>

      <DocsH3>「即時回答」プリセットの場合</DocsH3>
      <DocsP>
        クリップボードに「React vs Vue の比較」がコピーされた状態で「これについて教えて」と発話した場合の例です。
      </DocsP>

      <DocsDetails summary="完成したシステムプロンプト全文を見る">
        <CodeBlock>{`あなたはテキスト文章整形アシスタントです。

## 指示
下記のユーザーからの指示と出力ルールに従って文章を整形してください。

## 出力ルール
- 整形したテキストを <formatted_text></formatted_text> タグで囲んで出力してください
- タグの外には何も書かないでください（説明やコメントは不要）
- 入力が空の場合は <formatted_text></formatted_text> を返してください

## ユーザーからの指示
「これについて教えて」を質問や依頼として解釈し、回答を生成してください。

【参考情報】
クリップボード: React vs Vue の比較
フォーカス中のアプリ: Slack

【ルール】
- 元の発言内容は出力に含めない
- 回答のみを簡潔に返す
- 参考情報がある場合は、それを踏まえて回答する
- 質問の意図が不明確な場合は、最も可能性の高い解釈で回答する
- 計算、要約、説明など、依頼された作業を実行する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- フォーカス中のアプリで適切に表示できる出力形式にする（例: Markdown対応アプリならMarkdown記法を使用、プレーンテキストのみのアプリなら装飾なしのテキストにする）`}</CodeBlock>
        <DocsP>
          <Strong>注目</Strong>: タイプが「回答」のため、[B] 回答禁止の制約は付与されていません。
        </DocsP>
      </DocsDetails>

      {/* ──────────────────────────── */}
      <DocsH2>テンプレート変数の詳細</DocsH2>

      <DocsP>
        プリセットの <Code>instructions</Code>（指示文）内で使用できるテンプレート変数は3つです。
      </DocsP>

      <DocsTable>
        <thead>
          <tr>
            <DocsTh>変数</DocsTh>
            <DocsTh>説明</DocsTh>
            <DocsTh>置換される値</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd><Code>{"{{transcription}}"}</Code></DocsTd>
            <DocsTd>音声認識結果</DocsTd>
            <DocsTd>Whisperが認識したテキスト</DocsTd>
          </tr>
          <tr>
            <DocsTd><Code>{"{{appName}}"}</Code></DocsTd>
            <DocsTd>フォーカス中のアプリ名</DocsTd>
            <DocsTd>例: Slack, Chrome, メール</DocsTd>
          </tr>
          <tr>
            <DocsTd><Code>{"{{clipboard}}"}</Code></DocsTd>
            <DocsTd>クリップボードの内容</DocsTd>
            <DocsTd>現在コピーされているテキスト</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH3>{"{{transcription}}"} の特別な挙動</DocsH3>

      <DocsP>
        音声認識結果は常にユーザープロンプトとしてAIに渡されます。
        <Code>{"{{transcription}}"}</Code> を指示文に含めると、それに加えて<Strong>システムプロンプト内にも音声認識結果が埋め込まれます</Strong>。
      </DocsP>

      <DocsDetails summary="システムプロンプトとユーザープロンプトとは？">
        <DocsP>
          AIへのメッセージには2つの種類があります。
        </DocsP>
        <DocsList>
          <DocsListItem><Strong>システムプロンプト</Strong>: AIの振る舞いやルールを定義する指示です。「あなたはテキスト整形アシスタントです」のような役割定義や、プリセットの指示文がここに入ります。</DocsListItem>
          <DocsListItem><Strong>ユーザープロンプト</Strong>: AIに処理してほしい入力データです。音声認識結果のテキストがここに入ります。</DocsListItem>
        </DocsList>
        <DocsP>
          一般的には「ルール・指示はシステムプロンプト」「処理対象のデータはユーザープロンプト」と分けて渡します。
        </DocsP>
      </DocsDetails>

      <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
          <div className="font-semibold text-primary-700 mb-2 text-sm">{"{{transcription}}"} あり（おすすめ）</div>
          <div className="text-sm text-gray-700 mt-2 space-y-1">
            <div className="bg-white rounded px-3 py-2 border border-primary-100">
              <span className="text-xs text-gray-400">システムプロンプト:</span>
              <div className="font-mono text-xs mt-1">「<span className="text-primary-600 font-bold">えーっと明日の会議は10時から</span>」を自然な日本語に整形してください。</div>
            </div>
            <div className="bg-white rounded px-3 py-2 border border-primary-100">
              <span className="text-xs text-gray-400">ユーザープロンプト:</span>
              <div className="font-mono text-xs mt-1">えーっと明日の会議は10時から</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">指示文の中に認識結果が埋め込まれるので、「何を」「どう処理するか」の関係が明確になる。</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="font-semibold text-gray-700 mb-2 text-sm">{"{{transcription}}"} なし</div>
          <div className="text-sm text-gray-700 mt-2 space-y-1">
            <div className="bg-white rounded px-3 py-2 border border-gray-100">
              <span className="text-xs text-gray-400">システムプロンプト:</span>
              <div className="font-mono text-xs mt-1">自然な日本語に整形してください。</div>
            </div>
            <div className="bg-white rounded px-3 py-2 border border-gray-100">
              <span className="text-xs text-gray-400">ユーザープロンプト:</span>
              <div className="font-mono text-xs mt-1">えーっと明日の会議は10時から</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">システムプロンプトには指示だけが入り、認識結果はユーザープロンプトのみで渡される。</div>
        </div>
      </div>

      <DocsNote>
        デフォルトのプリセットではすべて <Code>{"{{transcription}}"}</Code> を使用しています。
        特別な理由がなければ、指示文に含めておくのがおすすめです。
      </DocsNote>

      {/* ──────────────────────────── */}
      <DocsH2>プリセットタイプの仕組み</DocsH2>

      <DocsP>
        プリセットには「整形」と「回答」の2つのタイプがあり、AIの動作が大きく変わります。
      </DocsP>

      <DocsTable>
        <thead>
          <tr>
            <DocsTh>タイプ</DocsTh>
            <DocsTh>回答禁止の制約 [B]</DocsTh>
            <DocsTh>出力長の検証</DocsTh>
            <DocsTh>用途</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd><Strong>整形</Strong></DocsTd>
            <DocsTd>付与される</DocsTd>
            <DocsTd>あり（1.5倍ルール）</DocsTd>
            <DocsTd>テキストの整形・校正</DocsTd>
          </tr>
          <tr>
            <DocsTd><Strong>回答</Strong></DocsTd>
            <DocsTd>付与されない</DocsTd>
            <DocsTd>なし</DocsTd>
            <DocsTd>質問への回答生成</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH3>出力長の検証（1.5倍ルール）</DocsH3>
      <DocsP>
        「整形」タイプでは、AIが指示を無視して回答を生成してしまうケースを検出する安全装置があります。
      </DocsP>
      <DocsList>
        <DocsListItem>出力テキストが入力の <Strong>1.5倍を超える長さ</Strong>、かつ <Strong>50文字以上長い</Strong> 場合</DocsListItem>
        <DocsListItem>AIが回答を生成したと判断し、<Strong>元の音声認識テキストがそのまま返されます</Strong></DocsListItem>
      </DocsList>
      <DocsNote>
        「回答」タイプではこの検証は無効です。回答は元のテキストより長くなるのが自然なためです。
      </DocsNote>

      {/* ──────────────────────────── */}
      <DocsH2>辞書との連携</DocsH2>

      <DocsP>
        辞書に登録した単語は、プリセットの <Code>instructions</Code>（指示文）に関係なく、自動的にシステムプロンプトの末尾に追加されます。
      </DocsP>

      <DocsH3>辞書データの2つの形態</DocsH3>
      <DocsTable>
        <thead>
          <tr>
            <DocsTh>形態</DocsTh>
            <DocsTh>プロンプト内の配置先</DocsTh>
            <DocsTh>例</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd><Strong>読み方あり</Strong></DocsTd>
            <DocsTd>[D] 辞書置換ルール</DocsTd>
            <DocsTd>さらさら → surasura</DocsTd>
          </tr>
          <tr>
            <DocsTd><Strong>読み方なし</Strong></DocsTd>
            <DocsTd>[E] 辞書（専門用語）</DocsTd>
            <DocsTd>TypeScript</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH3>辞書の2段階処理</DocsH3>
      <DocsP>
        辞書は以下の2段階で効果を発揮します。
      </DocsP>
      <div className="my-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 font-bold text-xs">1</span>
            <span className="font-semibold text-gray-800 text-sm">AI処理中</span>
          </div>
          <div className="text-sm text-gray-600">
            プロンプト内の辞書情報を参考に、AIが文脈を踏まえて適切に単語を使用
          </div>
        </div>
        <div className="flex items-center justify-center text-gray-300 text-xl font-bold">
          <span className="hidden md:inline">&rarr;</span>
          <span className="md:hidden">&darr;</span>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 font-bold text-xs">2</span>
            <span className="font-semibold text-gray-800 text-sm">後処理</span>
          </div>
          <div className="text-sm text-gray-600">
            AI出力に対して、辞書の置換ルール（読み方→表記）を機械的に文字列置換
          </div>
        </div>
      </div>

      <DocsNote>
        辞書の置換ルールはプリセットの内容に関係なく、常に最後に機械的に適用されます。
      </DocsNote>

      {/* ──────────────────────────── */}
      <DocsH2>プリセット編集のコツ</DocsH2>

      <DocsP>
        ベースプロンプト [A] で基本的な役割と出力形式は定義済みです。
        <Code>instructions</Code>（指示文）では<Strong>整形の方針・スタイル・ルール</Strong>を記述するのが効果的です。
        タイプによって書き方のポイントが異なります。
      </DocsP>

      <DocsH3>整形タイプのコツ</DocsH3>
      <DocsP>
        整形タイプでは、音声認識結果の<Strong>テキストをどう整えるか</Strong>を指示します。
        回答禁止の制約 [B] が自動で付与されるため、指示文では整形のスタイルやルールに集中できます。
      </DocsP>

      <DocsP><Strong>おすすめのテンプレート:</Strong></DocsP>
      <CodeBlock>{`「{{transcription}}」を〜してください。

現在のアプリ: {{appName}}

【ルール】
- 整形のスタイルやルールを列挙
- 文体の指定（丁寧語、カジュアルなど）

【禁止事項】
- 変換時にやってほしくないことを列挙`}</CodeBlock>

      <DocsP><Strong>ポイント:</Strong></DocsP>
      <DocsList>
        <DocsListItem>「質問に回答しない」は [B] で自動付与されるため、指示文に書かなくてもOK（書くとより強力に抑制できます）</DocsListItem>
        <DocsListItem><Code>{"{{appName}}"}</Code> を使うとアプリに応じた文体の出し分けができます</DocsListItem>
        <DocsListItem>【禁止事項】で「内容を追加しない」「補足しない」と明記すると、AIが余計な文を付け足すのを防げます</DocsListItem>
      </DocsList>

      <DocsP><Strong>カスタムプリセットの例:</Strong></DocsP>
      <DocsGrid>
        <FeatureCard icon={Pen} title="英語翻訳">
          <Code>{"{{transcription}}"}</Code> を自然な英語に翻訳してください。元の文章のニュアンスを崩さない表現にしてください。
        </FeatureCard>
        <FeatureCard icon={Pen} title="箇条書き整形">
          <Code>{"{{transcription}}"}</Code> の内容を箇条書きで構造化してください。要点ごとに分けて、簡潔に整理してください。
        </FeatureCard>
      </DocsGrid>

      <DocsH3>回答タイプのコツ</DocsH3>
      <DocsP>
        回答タイプでは、音声認識結果を<Strong>質問・依頼として解釈し、AIに回答を生成させます</Strong>。
        回答禁止の制約 [B] や出力長の検証は適用されないため、指示文で出力の方針を明確にすることが重要です。
      </DocsP>

      <DocsP><Strong>おすすめのテンプレート:</Strong></DocsP>
      <CodeBlock>{`「{{transcription}}」を質問や依頼として解釈し、回答してください。

【参考情報】
クリップボード: {{clipboard}}
フォーカス中のアプリ: {{appName}}

【ルール】
- 回答のスタイルや制約を列挙
- 出力に含めるもの・含めないものを指定`}</CodeBlock>

      <DocsP><Strong>ポイント:</Strong></DocsP>
      <DocsList>
        <DocsListItem>「元の発言は含めず回答のみ返す」と指定すると、出力がそのまま使いやすくなります</DocsListItem>
        <DocsListItem><Code>{"{{clipboard}}"}</Code> を使うと、コピーした内容を参考情報としてAIに渡せます（コードの質問、文章の要約など）</DocsListItem>
        <DocsListItem><Code>{"{{appName}}"}</Code> を使うと、フォーカス中のアプリに適した出力形式（Markdown対応アプリならMarkdown記法など）で回答を生成できます</DocsListItem>
        <DocsListItem>回答の長さや形式（箇条書き、1行で、など）を明記すると安定した出力が得られます</DocsListItem>
      </DocsList>

      <DocsP><Strong>カスタムプリセットの例:</Strong></DocsP>
      <DocsGrid>
        <FeatureCard icon={MessageSquareReply} title="コードレビュー">
          クリップボードのコード（<Code>{"{{clipboard}}"}</Code>）について、<Code>{"{{transcription}}"}</Code> の指示に従ってレビューしてください。改善点を箇条書きで簡潔に。
        </FeatureCard>
        <FeatureCard icon={MessageSquareReply} title="要約">
          <Code>{"{{clipboard}}"}</Code> の内容を、<Code>{"{{transcription}}"}</Code> の指示に従って要約してください。3行以内で簡潔に。
        </FeatureCard>
      </DocsGrid>

      <DocsH3>変更できない部分</DocsH3>

      <DocsP>
        以下はコード側で固定されており、プリセットの <Code>instructions</Code>（指示文）では変更できません。
      </DocsP>

      <DocsList>
        <DocsListItem>ベースプロンプト（AIの役割定義、出力形式のルール）</DocsListItem>
        <DocsListItem>回答禁止の制約文（整形タイプの場合）</DocsListItem>
        <DocsListItem>辞書セクションの文言・フォーマット</DocsListItem>
        <DocsListItem>APIパラメータ（temperature: 0.1、maxTokens: 2000）</DocsListItem>
        <DocsListItem>出力長の検証ロジック（1.5倍ルール）</DocsListItem>
      </DocsList>

      {/* ──────────────────────────── */}
      <DocsH2>制約と仕様</DocsH2>

      <DocsTable>
        <thead>
          <tr>
            <DocsTh>項目</DocsTh>
            <DocsTh>上限</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd>プリセット数</DocsTd>
            <DocsTd>最大 5つ</DocsTd>
          </tr>
          <tr>
            <DocsTd>プリセット名</DocsTd>
            <DocsTd>最大 20文字</DocsTd>
          </tr>
          <tr>
            <DocsTd><Code>instructions</Code>（指示文）の長さ</DocsTd>
            <DocsTd>最大 1,000文字</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH3>プリセットが未選択の場合</DocsH3>
      <DocsP>
        アクティブなプリセットが明示的に選択されていない場合は、自動的に<Strong>「標準」プリセット</Strong>が使用されます。
        そのため、特に設定を変更しなくても、標準的な整形が適用されます。
      </DocsP>

      <NextPage current="tips" />

      <RelatedPages
        links={[
          { to: "/docs/presets", title: "AIフォーマット（プリセット）", description: "プリセットの基本的な使い方と切り替え方法" },
          { to: "/docs/dictionary", title: "辞書機能", description: "専門用語・固有名詞の登録方法" },
        ]}
      />
    </>
  );
}
