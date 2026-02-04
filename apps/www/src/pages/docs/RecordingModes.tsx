import { MessageSquare, FileText, Mail, ClipboardList } from "lucide-react";
import {
  DocsH1,
  DocsH2,
  DocsH3,
  DocsP,
  DocsList,
  DocsListItem,
  DocsOrderedList,
  DocsImage,
  Steps,
  Step,
  Strong,
  Kbd,
  FeatureCard,
  DocsGrid,
  NextPage,
  RelatedPages,
} from "./components";

export function RecordingModes() {
  return (
    <>
      <DocsH1>音声入力モード</DocsH1>

      <DocsP>
        surasuraには2つの音声入力モードがあります。用途に合わせて使い分けることで、より快適に音声入力ができます。
      </DocsP>

      <DocsH2>Push to Talk（PTT）モード</DocsH2>

      <DocsImage alt="PTTモードの操作" />

      <DocsH3>概要</DocsH3>
      <DocsP>
        ショートカットキーを<Strong>押している間だけ</Strong>音声入力するモードです。
        短い文章やコマンド入力に最適です。
      </DocsP>

      <DocsH3>使い方</DocsH3>
      <Steps>
        <Step number={1} title="ショートカットキーを押し続ける">
          デフォルト: <Kbd>Fn</Kbd>（macOS） / <Kbd>Ctrl + Win</Kbd>（Windows）
        </Step>
        <Step number={2} title="マイクに向かって話す" />
        <Step number={3} title="キーを離す">
          音声入力終了 → 自動で整形開始
        </Step>
        <Step number={4} title="整形されたテキストが自動でペースト">
          現在カーソルがある位置にテキストが入力されます
        </Step>
      </Steps>

      <DocsH3>こんな時におすすめ</DocsH3>
      <DocsGrid cols={2}>
        <FeatureCard icon={MessageSquare} title="チャット">
          短い返信やメッセージの入力
        </FeatureCard>
        <FeatureCard icon={FileText} title="メモ">
          ちょっとしたメモやコマンド入力
        </FeatureCard>
      </DocsGrid>

      <DocsH2>ハンズフリーモード</DocsH2>

      <DocsImage alt="ハンズフリーモードの操作" />

      <DocsH3>概要</DocsH3>
      <DocsP>
        ショートカットキーを1回押すと音声入力開始、もう1回押すと音声入力終了するモードです。
        長文入力に最適です。
      </DocsP>

      <DocsH3>使い方</DocsH3>
      <Steps>
        <Step number={1} title="ショートカットキーを1回押す">
          デフォルト: <Kbd>Fn + Space</Kbd>（macOS） / <Kbd>Ctrl + Win + Space</Kbd>（Windows）
        </Step>
        <Step number={2} title="両手を自由にして話す" />
        <Step number={3} title="ショートカットキーをもう1回押す">
          音声入力終了 → 自動で整形開始
        </Step>
        <Step number={4} title="整形されたテキストが自動でペースト">
          現在カーソルがある位置にテキストが入力されます
        </Step>
      </Steps>

      <DocsH3>こんな時におすすめ</DocsH3>
      <DocsGrid cols={2}>
        <FeatureCard icon={Mail} title="メール">
          本文や返信の下書き作成
        </FeatureCard>
        <FeatureCard icon={FileText} title="ドキュメント">
          報告書や企画書の下書き
        </FeatureCard>
        <FeatureCard icon={ClipboardList} title="議事録">
          会議内容の記録・整理
        </FeatureCard>
        <FeatureCard icon={MessageSquare} title="ブログ">
          記事やSNS投稿の執筆
        </FeatureCard>
      </DocsGrid>

      <DocsH2>音声入力のキャンセル</DocsH2>

      <DocsP>
        音声入力中に間違えたり、やり直したい場合はキャンセルできます。
      </DocsP>

      <DocsH3>PTTモードの場合</DocsH3>
      <DocsP>
        <Kbd>Escape</Kbd>キーを押しながらショートカットキーを離す
      </DocsP>

      <DocsH3>ハンズフリーモードの場合</DocsH3>
      <DocsP>
        <Kbd>Escape</Kbd>キーを押す
      </DocsP>

      <DocsP>
        キャンセルすると音声入力は破棄され、何もペーストされません。
      </DocsP>

      <DocsH2>履歴ペースト</DocsH2>

      <DocsP>
        直前に整形したテキストを再度ペーストしたい場合、履歴ペースト機能が使えます。
      </DocsP>

      <DocsH3>使い方</DocsH3>
      <DocsOrderedList>
        <DocsListItem>
          設定画面で履歴ペーストのショートカットを設定（デフォルトは未設定）
        </DocsListItem>
        <DocsListItem>設定したショートカットキーを押す</DocsListItem>
        <DocsListItem>直前の整形結果がペーストされる</DocsListItem>
      </DocsOrderedList>

      <DocsH3>活用シーン</DocsH3>
      <DocsList>
        <DocsListItem>同じ内容を複数の場所に入力したい時</DocsListItem>
        <DocsListItem>うっかりペースト先を間違えた時</DocsListItem>
        <DocsListItem>整形結果を確認してから別の場所にも使いたい時</DocsListItem>
      </DocsList>

      <NextPage current="recording-modes" />

      <RelatedPages
        links={[
          { to: "/docs/settings", title: "設定", description: "ショートカットキーのカスタマイズ" },
        ]}
      />
    </>
  );
}
