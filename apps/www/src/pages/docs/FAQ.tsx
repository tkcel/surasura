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
  ExternalLink,
  Strong,
  Code,
  Kbd,
  NextPage,
  RelatedPages,
} from "./components";

export function FAQ() {
  return (
    <>
      <DocsH1>FAQ</DocsH1>

      <DocsP>
        よくある質問と回答をまとめました。
      </DocsP>

      <DocsH2>料金について</DocsH2>

      <DocsH3>Q. surasuraは無料ですか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> surasuraアプリ自体は無料でお使いいただけます。
        ただし、音声認識と整形にOpenAI APIを使用するため、API利用料金が発生します。
      </DocsP>

      <DocsH3>Q. API料金はどのくらいかかりますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> 使用頻度によりますが、一般的な目安は以下の通りです。
      </DocsP>

      <DocsTable>
        <thead>
          <tr>
            <DocsTh>使用量</DocsTh>
            <DocsTh>月額目安</DocsTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <DocsTd>軽い使用（1日10回程度）</DocsTd>
            <DocsTd>$0.20〜$0.50</DocsTd>
          </tr>
          <tr>
            <DocsTd>普通の使用（1日30回程度）</DocsTd>
            <DocsTd>$0.50〜$1.50</DocsTd>
          </tr>
          <tr>
            <DocsTd>ヘビーユーザー（1日100回以上）</DocsTd>
            <DocsTd>$2〜$5</DocsTd>
          </tr>
        </tbody>
      </DocsTable>

      <DocsP>
        ※ 上記は概算です。実際の料金は音声の長さやモデル選択によって変動します。
      </DocsP>

      <DocsH3>Q. 無料枠はありますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> OpenAI APIには新規登録時に無料クレジットが付与される場合があります。
        詳しくは<ExternalLink href="https://openai.com/pricing">OpenAIの料金ページ</ExternalLink>をご確認ください。
      </DocsP>

      <DocsH3>Q. 料金を抑えるコツはありますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> 以下の方法で料金を抑えられます。
      </DocsP>
      <DocsList>
        <DocsListItem>整形モデルは<Code>gpt-4o-mini</Code>（デフォルト）を使用</DocsListItem>
        <DocsListItem>短く簡潔に話す</DocsListItem>
        <DocsListItem>不要な音声入力はキャンセル（<Kbd>Escape</Kbd>キー）</DocsListItem>
      </DocsList>

      <DocsH2>対応環境について</DocsH2>

      <DocsH3>Q. 対応OSは何ですか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> 現在、以下のOSに対応しています。
      </DocsP>
      <DocsList>
        <DocsListItem>
          <Strong>macOS</Strong>: macOS 11 (Big Sur) 以降
          <DocsList>
            <DocsListItem>Apple Silicon (M1/M2/M3/M4)</DocsListItem>
            <DocsListItem>Intel Mac</DocsListItem>
          </DocsList>
        </DocsListItem>
        <DocsListItem><Strong>Windows</Strong>: Windows 10 以降</DocsListItem>
      </DocsList>

      <DocsH3>Q. スマートフォンで使えますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> 現在、スマートフォン版はありません。デスクトップアプリのみの提供です。
      </DocsP>

      <DocsH3>Q. Linux対応の予定はありますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> 現時点では未定です。ご要望が多ければ検討いたします。
      </DocsP>

      <DocsH2>データについて</DocsH2>

      <DocsH3>Q. 音声データはどこに保存されますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> 音声データは一時的にお使いのPCのローカルに保存され、
        処理完了後に自動的に削除されます。サーバーには保存されません。
      </DocsP>

      <DocsH3>Q. 入力した内容は外部に送信されますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> 音声認識と整形のため、OpenAI APIにデータが送信されます。
        OpenAIのプライバシーポリシーについては
        <ExternalLink href="https://openai.com/policies/privacy-policy">OpenAIのサイト</ExternalLink>
        をご確認ください。
      </DocsP>

      <DocsH3>Q. APIキーはどこに保存されますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> APIキーはお使いのPCのローカルに暗号化して保存されます。
        外部に送信されることはありません。
      </DocsP>

      <DocsH2>機能について</DocsH2>

      <DocsH3>Q. オフラインで使えますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> いいえ、音声認識とテキスト整形にインターネット接続が必要です。
      </DocsP>

      <DocsH3>Q. 対応言語は何ですか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> 主に日本語に最適化していますが、
        OpenAIのWhisperが対応している言語であれば認識可能です（英語、中国語など多数）。
      </DocsP>

      <DocsH3>Q. 音声入力の最大時間はありますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> 技術的な制限は特にありませんが、
        長すぎる音声入力は処理に時間がかかり、コストも増加します。
        1回あたり5分以内を推奨します。
      </DocsP>

      <DocsH3>Q. 複数のAIフォーマットを切り替えながら使えますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> はい、メニューバーからいつでもAIフォーマットを切り替えられます。
        また、デフォルトのAIフォーマットは設定画面から変更できます。
      </DocsP>

      <DocsH2>その他</DocsH2>

      <DocsH3>Q. アップデートはどうやって行いますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> アプリ起動時に自動でアップデートを確認し、
        新しいバージョンがあれば通知されます。
      </DocsP>

      <DocsH3>Q. 問い合わせ先はどこですか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> 以下の方法でお問い合わせいただけます。
      </DocsP>
      <DocsList>
        <DocsListItem>
          <ExternalLink href="https://discord.gg/ffpmWv5d">Discord</ExternalLink> - 質問・要望・バグ報告
        </DocsListItem>
        <DocsListItem>
          <ExternalLink href="https://x.com/tkcel9">X (Twitter)</ExternalLink> - 作者への連絡
        </DocsListItem>
        <DocsListItem>
          <ExternalLink href="https://github.com/tkcel/surasura/issues">GitHub Issues</ExternalLink> - バグ報告・機能要望
        </DocsListItem>
      </DocsList>

      <DocsH3>Q. どのような用途で使えますか？</DocsH3>
      <DocsP>
        <Strong>A.</Strong> 個人利用、教育目的、研究目的、非営利団体での使用は自由にお使いいただけます。
      </DocsP>
      <DocsP>
        商用利用（収益を得る目的での使用）をご希望の場合は、別途商用ライセンスが必要です。
        詳しくはお問い合わせください（t.nemoto@kyo-toku.com）。
      </DocsP>

      <NextPage current="faq" />

      <RelatedPages
        links={[
          { to: "/docs/getting-started", title: "はじめに", description: "初期設定" },
        ]}
      />
    </>
  );
}
