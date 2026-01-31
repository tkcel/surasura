# 音声認識からテキスト入力までのフロー

このドキュメントでは、Surasuraアプリケーションが音声を録音し、文字起こしを行い、カーソル位置にテキストをペーストするまでの仕組みを説明します。

## 概要図

```mermaid
flowchart LR
    A[あなた] -->|話す| B[マイク]
    B -->|音声データ| C[Electron App]
    C -->|WAVファイル| D[OpenAI Whisper API]
    D -->|文字起こし結果| C
    C -->|テキスト| E[SwiftHelper]
    E -->|Cmd+V| F[テキストエディタに入力]
```

---

## 処理の流れ

### 1. 録音開始

ユーザーがキーボードショートカット（例: `Cmd+Shift+Space`）を押すと、アプリが「録音モード」に入ります。

この時、裏で起きていること:
- システム音声をミュート（自分の声だけ拾うため）
- マイクからの音声取り込み開始

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as Electron App
    participant Helper as SwiftHelper

    User->>App: ショートカットキーを押す
    App->>App: 録音モード開始
    App->>Helper: システム音声をミュート
    App->>App: マイク入力開始
```

---

### 2. 音声の取り込みと処理

マイクから入ってきた音声は、**32ミリ秒ごと**に小さなチャンク（塊）として処理されます。

VAD（Voice Activity Detection）が「今しゃべってるか、黙ってるか」を判定して、無駄なAPIコールを減らします。

```mermaid
flowchart LR
    A[マイク] --> B[音声チャンク<br/>32msごと]
    B --> C{VAD判定<br/>人の声?}
    C -->|はい| D[バッファに追加]
    C -->|いいえ| E[無音としてカウント]
    D --> F[バッファ]
    E --> F
```

---

### 3. OpenAI Whisper APIへ送信

音声チャンクはバッファに溜められて、以下のタイミングでOpenAI Whisper APIに送信されます:

| 条件 | 説明 |
|-----|------|
| 3秒間の無音 | 話し終わったと判断 |
| 30秒分のバッファ | 長い発話の場合 |

```mermaid
sequenceDiagram
    participant App as Electron App
    participant Buffer as バッファ
    participant API as OpenAI Whisper API

    loop 録音中
        App->>Buffer: 音声チャンクを追加
    end

    alt 無音3秒 or バッファ30秒
        Buffer->>Buffer: WAVファイルに変換
        Buffer->>API: 音声ファイル送信
        API-->>App: "こんにちは、今日は..."
    end
```

---

### 4. 録音終了

ユーザーがキーを離す（またはトグルで再度押す）と、録音が終了します。

この時:
1. 残っている音声バッファを全部APIに送信
2. 全ての文字起こし結果を結合
3. システム音声を元に戻す

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as Electron App
    participant API as OpenAI Whisper API
    participant Helper as SwiftHelper

    User->>App: キーを離す
    App->>App: 録音停止
    App->>API: 残りのバッファを送信
    API-->>App: 最終文字起こし結果
    App->>Helper: システム音声を復元
```

---

### 5. テキストのペースト

文字起こし結果を**今カーソルがある場所**にペーストします。

これは**SwiftHelper**というmacOSネイティブアプリが担当しています。

#### ペースト処理の詳細

```mermaid
sequenceDiagram
    participant App as Electron App
    participant Helper as SwiftHelper
    participant Clipboard as クリップボード
    participant Target as テキストエディタ

    App->>Helper: pasteText("こんにちは...")

    rect rgb(240, 248, 255)
        Note over Helper,Clipboard: ペースト処理
        Helper->>Clipboard: 1. 現在の内容を保存
        Helper->>Clipboard: 2. 文字起こしテキストをセット
        Helper->>Target: 3. Cmd+V をシミュレート
        Target->>Target: テキストが入力される
        Helper->>Clipboard: 4. 元の内容を復元
    end

    Helper-->>App: 完了
```

#### なぜSwiftHelperが必要？

Electronアプリから直接他のアプリにテキストを入力することはできません。macOSのセキュリティ制限があるためです。

そこで、**アクセシビリティ権限**を持ったネイティブアプリ（SwiftHelper）を使って、キーボード操作をシミュレートしています。

---

## 録音状態のステートマシン

アプリは以下の状態を遷移します:

```mermaid
stateDiagram-v2
    [*] --> idle: アプリ起動

    idle --> starting: ショートカット押下
    starting --> recording: 初期化完了

    recording --> stopping: キーを離す
    stopping --> idle: ペースト完了

    recording --> stopping: キャンセル
    stopping --> idle: キャンセル処理
```

| 状態 | 説明 |
|-----|------|
| `idle` | 待機中。録音していない |
| `starting` | 録音準備中。マイク・VAD初期化 |
| `recording` | 録音中。音声を取り込んでいる |
| `stopping` | 録音終了処理中。文字起こし・ペースト実行 |

---

## 主要コンポーネント

```mermaid
graph TB
    subgraph Electron["Electron App"]
        RM["RecordingManager<br/>録音状態管理"]
        TS["TranscriptionService<br/>文字起こし管理"]
        VAD["VADService<br/>音声検出"]
        WP["OpenAIWhisperProvider<br/>API呼び出し"]
        NB["NativeBridge<br/>ネイティブ通信"]
    end

    subgraph External["外部"]
        API["OpenAI Whisper API"]
        SH["SwiftHelper"]
    end

    RM --> VAD
    RM --> TS
    TS --> WP
    WP --> API
    RM --> NB
    NB --> SH
```

| コンポーネント | 役割 |
|--------------|------|
| RecordingManager | 録音の開始・停止・状態管理 |
| VADService | 音声活動検出（話してるか判定） |
| TranscriptionService | 文字起こしセッション管理 |
| OpenAIWhisperProvider | OpenAI APIへの送信・WAV変換 |
| NativeBridge | SwiftHelperとの通信 |
| SwiftHelper | macOSでのペースト実行 |

---

## 設定

| 設定項目 | デフォルト値 | 説明 |
|---------|------------|------|
| 言語 | 日本語 (`ja`) | Whisper APIに渡す言語コード |
| OpenAI APIキー | - | 必須。オンボーディングまたは設定画面で入力 |

---

## トラブルシューティング

### ペーストが動作しない場合

```mermaid
flowchart TD
    A[ペーストが動作しない] --> B{アクセシビリティ権限?}
    B -->|なし| C[システム環境設定で許可]
    B -->|あり| D{SwiftHelper起動中?}
    D -->|いいえ| E[アプリを再起動]
    D -->|はい| F[ログを確認]
```

**確認ポイント:**
1. システム環境設定 > プライバシーとセキュリティ > アクセシビリティ でSurasuraが許可されているか
2. アプリを再起動してSwiftHelperが起動するか確認

### 文字起こしが空の場合

```mermaid
flowchart TD
    A[文字起こしが空] --> B{APIキー設定済み?}
    B -->|いいえ| C[設定画面でAPIキーを入力]
    B -->|はい| D{マイク権限?}
    D -->|なし| E[システム環境設定で許可]
    D -->|あり| F{録音時間は十分?}
    F -->|短すぎる| G[1秒以上話す]
    F -->|十分| H[ログを確認]
```

**確認ポイント:**
1. 設定画面でOpenAI APIキーが正しく入力されているか
2. システム環境設定 > プライバシーとセキュリティ > マイク でSurasuraが許可されているか
3. 最低1秒以上は話してから録音を終了する
