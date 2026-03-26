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
  DocsNote,
  DocsRealImage,
  DocsLink,
  Strong,
  Code,
  Kbd,
  NextPage,
  RelatedPages,
} from "./components";

export function Settings() {
  return (
    <>
      <DocsH1>設定</DocsH1>

      <DocsP>
        surasuraの各種設定について説明します。
      </DocsP>

      <DocsH2>ショートカットキー</DocsH2>

      <DocsRealImage src="/images/docs/ショートカット設定.png" alt="ショートカット設定" />

      <DocsH3>設定可能なショートカット</DocsH3>

      <DocsTable>
        <thead>
          <tr>
            <DocsTh>機能</DocsTh>
            <DocsTh>デフォルト（macOS）</DocsTh>
            <DocsTh>デフォルト（Windows）</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd>Push to Talk</DocsTd>
            <DocsTd><Kbd>Fn</Kbd></DocsTd>
            <DocsTd><Kbd>Ctrl + Win</Kbd></DocsTd>
          </tr>
          <tr>
            <DocsTd>ハンズフリーモード</DocsTd>
            <DocsTd><Kbd>Fn + Space</Kbd></DocsTd>
            <DocsTd><Kbd>Ctrl + Win + Space</Kbd></DocsTd>
          </tr>
          <tr>
            <DocsTd>履歴ペースト</DocsTd>
            <DocsTd><Kbd>Alt + Cmd + V</Kbd></DocsTd>
            <DocsTd><Kbd>Alt + Win + V</Kbd></DocsTd>
          </tr>
          <tr>
            <DocsTd>録音キャンセル</DocsTd>
            <DocsTd><Kbd>Escape</Kbd></DocsTd>
            <DocsTd><Kbd>Escape</Kbd></DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH3>変更方法</DocsH3>

      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>「ショートカット」セクションを表示</DocsListItem>
        <DocsListItem>変更したいショートカットの入力欄をクリック</DocsListItem>
        <DocsListItem>新しいキーの組み合わせを押す</DocsListItem>
        <DocsListItem>自動的に保存される</DocsListItem>
      </DocsOrderedList>

      <DocsH3>注意点</DocsH3>

      <DocsList>
        <DocsListItem>他のアプリと競合するショートカットは避けてください</DocsListItem>
        <DocsListItem>修飾キー（Fn、Option/Alt、Shift、Ctrl/Command）を含む組み合わせを推奨</DocsListItem>
      </DocsList>

      <DocsH2>テーマ</DocsH2>

      <DocsRealImage src="/images/docs/テーマ設定.png" alt="テーマ設定" />

      <DocsP>
        surasuraの外観を変更できます。
      </DocsP>

      <DocsH3>選択可能なテーマ</DocsH3>

      <DocsTable>
        <thead>
          <tr>
            <DocsTh>テーマ</DocsTh>
            <DocsTh>説明</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd>ライト</DocsTd>
            <DocsTd>明るい背景の標準テーマ</DocsTd>
          </tr>
          <tr>
            <DocsTd>ダーク</DocsTd>
            <DocsTd>暗い背景で目に優しいテーマ</DocsTd>
          </tr>
          <tr>
            <DocsTd>システム</DocsTd>
            <DocsTd>OSの設定に連動して自動切り替え</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsH3>変更方法</DocsH3>

      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>「テーマ」から選択</DocsListItem>
      </DocsOrderedList>

      <DocsH2>効果音</DocsH2>

      <DocsP>
        音声入力開始/終了時などに効果音を鳴らすことができます。
      </DocsP>

      <DocsH3>設定</DocsH3>

      <DocsList>
        <DocsListItem><Strong>オン</Strong>: 音声入力開始、音声入力終了、整形完了時に効果音</DocsListItem>
        <DocsListItem><Strong>オフ</Strong>: 効果音なし（静音）</DocsListItem>
      </DocsList>

      <DocsH3>変更方法</DocsH3>

      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>「効果音」のトグルを切り替え</DocsListItem>
      </DocsOrderedList>

      <DocsH2>自動ペースト</DocsH2>

      <DocsP>
        文字起こし結果をテキスト入力欄に自動的にペーストするかどうかを設定できます。
      </DocsP>

      <DocsH3>設定</DocsH3>

      <DocsList>
        <DocsListItem><Strong>オン</Strong>（デフォルト）: テキスト入力欄にカーソルがある場合、結果を自動でペーストします。カーソルがテキスト入力欄にない場合は、ウィジェット上部に結果パネルを表示します</DocsListItem>
        <DocsListItem><Strong>オフ</Strong>: 自動ペーストを行わず、常に結果パネルを表示します。結果はパネルのコピーボタンからクリップボードにコピーできます</DocsListItem>
      </DocsList>

      <DocsH3>結果パネルについて</DocsH3>

      <DocsList>
        <DocsListItem>ウィジェット（フローティングボタン）の上部に表示されます</DocsListItem>
        <DocsListItem>使用中のプリセット名が「結果（プリセット名）」の形式でヘッダーに表示されます</DocsListItem>
        <DocsListItem>コピーボタンで結果をクリップボードにコピーできます</DocsListItem>
        <DocsListItem>10秒後に自動的に消えます（パネル上にマウスを置いている間はタイマーが一時停止します）</DocsListItem>
        <DocsListItem>録音を開始すると自動的に閉じます</DocsListItem>
      </DocsList>

      <DocsH3>変更方法</DocsH3>

      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>「自動ペースト」のトグルを切り替え</DocsListItem>
      </DocsOrderedList>

      <DocsH2>APIキー</DocsH2>

      <DocsP>
        surasuraを使用するには、OpenAI APIキーの設定が必要です。
        APIキーの取得方法については<DocsLink to="/docs/getting-started">はじめに</DocsLink>をご覧ください。
      </DocsP>

      <DocsH3>設定方法</DocsH3>

      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>「APIキー」欄にOpenAI APIキーを入力</DocsListItem>
        <DocsListItem>「保存」をクリック</DocsListItem>
      </DocsOrderedList>

      <DocsH3>AIモデルの選択について</DocsH3>

      <DocsP>
        AIモデルは以下の場所で設定します。
      </DocsP>

      <DocsList>
        <DocsListItem>
          <Strong>整形モデル</Strong>: <DocsLink to="/docs/presets">プリセット</DocsLink>ごとに設定
        </DocsListItem>
        <DocsListItem>
          <Strong>音声認識モデル</Strong>: 設定画面の「音声入力」セクションで設定
        </DocsListItem>
      </DocsList>

      <DocsH3>モデルのアクセス許可について</DocsH3>

      <DocsP>
        OpenAI APIキーのプロジェクト設定で、surasuraが使用するモデルへのアクセスが許可されている必要があります。
        モデルが許可されていない場合、音声認識やプリセットが正しく動作しません。
      </DocsP>

      <DocsP>
        <Strong>音声認識モデル</Strong>:
      </DocsP>
      <DocsList>
        <DocsListItem><Code>gpt-4o-transcribe</Code>（デフォルト）</DocsListItem>
        <DocsListItem><Code>gpt-4o-mini-transcribe</Code></DocsListItem>
        <DocsListItem><Code>whisper-1</Code></DocsListItem>
      </DocsList>

      <DocsP>
        <Strong>プリセットモデル</Strong>:
      </DocsP>
      <DocsList>
        <DocsListItem><Code>gpt-5-nano</Code>（デフォルト） / <Code>gpt-5-mini</Code> / <Code>gpt-5</Code></DocsListItem>
        <DocsListItem><Code>gpt-4.1-nano</Code> / <Code>gpt-4.1-mini</Code> / <Code>gpt-4.1</Code></DocsListItem>
        <DocsListItem><Code>gpt-4o-mini</Code> / <Code>gpt-4o</Code></DocsListItem>
      </DocsList>

      <DocsNote>
        OpenAI APIの管理画面（<Strong>Settings &gt; Project &gt; Model access</Strong>）で、上記モデルが許可されていることを確認してください。
        許可されていないモデルを選択した場合、フォーマットが適用されず音声認識結果がそのまま出力されます。
      </DocsNote>

      <DocsH2>スタートアップ</DocsH2>

      <DocsP>
        PCの起動時にsurasuraを自動起動するかどうかを設定できます。
      </DocsP>

      <DocsH3>設定</DocsH3>

      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>「スタートアップ時に起動」のトグルを切り替え</DocsListItem>
      </DocsOrderedList>

      <DocsH2>設定のリセット</DocsH2>

      <DocsP>
        すべての設定を初期状態に戻すことができます。
      </DocsP>

      <DocsH3>方法</DocsH3>

      <DocsOrderedList>
        <DocsListItem>設定画面を開く</DocsListItem>
        <DocsListItem>「設定をリセット」をクリック</DocsListItem>
        <DocsListItem>確認ダイアログで「リセット」を選択</DocsListItem>
      </DocsOrderedList>

      <DocsNote>
        <Strong>注意</Strong>: APIキー、プリセット、辞書の登録内容も削除されます。
      </DocsNote>

      <NextPage current="settings" />

      <RelatedPages
        links={[
          { to: "/docs/presets", title: "プリセット", description: "整形スタイルの設定" },
        ]}
      />
    </>
  );
}
