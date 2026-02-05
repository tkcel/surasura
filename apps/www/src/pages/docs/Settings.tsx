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
            <DocsTd>未設定</DocsTd>
            <DocsTd>未設定</DocsTd>
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
          <Strong>整形モデル</Strong>: <DocsLink to="/docs/presets">AIフォーマット</DocsLink>ごとに設定
        </DocsListItem>
        <DocsListItem>
          <Strong>音声認識モデル</Strong>: 設定画面の「音声入力」セクションで設定
        </DocsListItem>
      </DocsList>

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
        <Strong>注意</Strong>: APIキー、AIフォーマット、辞書の登録内容も削除されます。
      </DocsNote>

      <NextPage current="settings" />

      <RelatedPages
        links={[
          { to: "/docs/presets", title: "AIフォーマット（プリセット）", description: "整形スタイルの設定" },
        ]}
      />
    </>
  );
}
