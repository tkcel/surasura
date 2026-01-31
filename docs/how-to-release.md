# surasura リリース手順

## 概要

surasuraのリリースは GitHub Actions を利用して自動化されています。
タグをプッシュするか、手動でワークフローを実行することでビルド・リリースが行われます。

## 対応プラットフォーム

| OS | アーキテクチャ | 配布形式 |
|---|---|---|
| macOS | arm64 (Apple Silicon) | DMG, ZIP |
| macOS | x64 (Intel) | DMG, ZIP |
| Windows | x64 | Squirrel (.exe) |

## 前提条件

### GitHub Secrets の設定

以下の Secrets が GitHub リポジトリに設定されている必要があります。

#### macOS コード署名・公証

| Secret | 説明 |
|---|---|
| `DEVELOPER_CERT_BASE64` | Developer ID証明書（.p12）のBase64エンコード |
| `DEVELOPER_CERT_PASSPHRASE` | 証明書のパスフレーズ |
| `CODESIGNING_IDENTITY` | 署名ID（例: `Developer ID Application: Your Name (TEAM_ID)`） |
| `APPLE_ID` | Apple Developer ID のメールアドレス |
| `APPLE_APP_PASSWORD` | アプリ固有パスワード（Apple IDの2FA用） |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

#### アプリケーション設定

| Secret | 説明 |
|---|---|
| `POSTHOG_API_KEY` | PostHog の API キー（テレメトリ用） |
| `FEEDBACK_SURVEY_ID` | フィードバックサーベイID |
| `AUTH_CLIENT_ID` | 認証クライアントID |
| `AUTHORIZATION_ENDPOINT` | 認証エンドポイント |
| `AUTH_TOKEN_ENDPOINT` | トークンエンドポイント |
| `API_ENDPOINT` | API エンドポイント |

## リリース手順

### 1. バージョンを更新

`apps/desktop/package.json` のバージョンを更新します。

```bash
cd apps/desktop
pnpm bumpp
```

`bumpp` は対話的にバージョンを選択でき、自動でコミット・タグ作成も行えます。

### 2. 変更をプッシュ

```bash
git push origin main --tags
```

### 3. GitHub Actions でビルド

タグ（`v*` 形式）をプッシュすると、自動的に以下が実行されます：

1. **ビルドジョブ**（並列実行）
   - macOS arm64 ビルド（`macos-latest`）
   - macOS x64 ビルド（`macos-15-intel`）
   - Windows x64 ビルド（`windows-2025`）

2. **リリースジョブ**
   - 全ビルドアーティファクトをダウンロード
   - GitHub Release を **ドラフト** として作成

### 4. リリースノートを編集

1. [GitHub Releases](../../releases) ページを開く
2. 作成されたドラフトリリースを編集
3. 「What's New」セクションを実際の変更内容に更新
4. 確認後、「Publish release」をクリック

## 手動リリース

GitHub Actions の「workflow_dispatch」を使って手動でリリースすることも可能です。

1. [Actions タブ](../../actions/workflows/release.yml) を開く
2. 「Run workflow」をクリック
3. タグ名を入力（例: `v0.1.18`）
4. 「Run workflow」を実行

## ローカルビルド（テスト用）

開発中にローカルでビルドをテストする場合：

```bash
cd apps/desktop

# Node.jsバイナリをダウンロード（初回のみ）
pnpm download-node

# macOS arm64
pnpm make:arm64

# macOS x64
pnpm make:x64

# Windows（Windowsマシン上で実行）
pnpm make:windows

# DMGのみ作成
pnpm make:dmg:arm64
```

### コード署名をスキップ（ローカルテスト用）

```bash
SKIP_CODESIGNING=true SKIP_NOTARIZATION=true pnpm make:arm64
```

## 成果物の場所

ビルド成果物は以下に出力されます：

```
apps/desktop/out/make/
├── surasura-{version}-arm64.dmg      # macOS arm64 DMG
├── surasura-{version}-x64.dmg        # macOS x64 DMG
├── zip/darwin/
│   ├── arm64/surasura-darwin-arm64-{version}.zip
│   └── x64/surasura-darwin-x64-{version}.zip
└── squirrel.windows/x64/
    ├── surasuraSetup.exe             # Windows インストーラー
    ├── surasura-{version}-full.nupkg # Squirrel 更新パッケージ
    └── RELEASES                       # 更新メタデータ
```

## トラブルシューティング

### コード署名エラー

```
Error: No identity found for signing
```

→ `CODESIGNING_IDENTITY` が正しく設定されているか確認

### 公証エラー

```
Error: Failed to notarize
```

→ 以下を確認：
- `APPLE_ID`, `APPLE_APP_PASSWORD`, `APPLE_TEAM_ID` が正しいか
- アプリ固有パスワードが有効か（https://appleid.apple.com で生成）

### Node.jsバイナリ不足

```
Missing Node.js binary for darwin-arm64
```

→ `pnpm download-node` を実行

### Windows VC++ DLL エラー

Windows ビルドで DLL 関連のエラーが出る場合、ビルド環境に Visual C++ ランタイムがインストールされている必要があります（GitHub Actions の `windows-2025` ランナーには含まれています）。

## 関連ファイル

| ファイル | 説明 |
|---|---|
| `.github/workflows/release.yml` | リリースワークフロー |
| `apps/desktop/forge.config.ts` | Electron Forge 設定 |
| `apps/desktop/entitlements.node.plist` | Node.js バイナリ用エンタイトルメント |
