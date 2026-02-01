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

#### Secrets の種類

GitHub には複数の種類の Secrets がありますが、このプロジェクトでは **Repository secrets** を使用します。

| 種類 | 用途 | 設定場所 |
|---|---|---|
| **Repository secrets** ✅ | リポジトリ内の全ワークフローで使用可能 | Settings → Secrets and variables → Actions → Repository secrets |
| Environment secrets | 特定の環境（production等）でのみ使用可能 | Settings → Environments → [環境名] → Environment secrets |
| Organization secrets | Organization 全体で共有 | Organization Settings → Secrets |

#### Secrets の設定手順

1. GitHub リポジトリページを開く
2. **Settings** タブをクリック
3. 左サイドバーの **Secrets and variables** → **Actions** をクリック
4. **Repository secrets** セクションの **New repository secret** をクリック
5. Name と Secret を入力して **Add secret** をクリック

#### macOS コード署名・公証（必須）

| Secret | 説明 |
|---|---|
| `DEVELOPER_CERT_BASE64` | Developer ID証明書（.p12）のBase64エンコード |
| `DEVELOPER_CERT_PASSPHRASE` | 証明書のパスフレーズ |
| `CODESIGNING_IDENTITY` | 署名ID（例: `Developer ID Application: Your Name (TEAM_ID)`） |
| `APPLE_ID` | Apple Developer ID のメールアドレス |
| `APPLE_APP_PASSWORD` | アプリ固有パスワード（Apple IDの2FA用） |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

#### 証明書の準備方法

1. **Developer ID 証明書をエクスポート**
   - Keychain Access.app を開く
   - 「ログイン」キーチェーン → 「自分の証明書」を選択
   - 「Developer ID Application: ...」を右クリック → 「書き出す」
   - .p12 形式で保存し、パスフレーズを設定

2. **Base64 エンコード**
   ```bash
   base64 -i YourCertificate.p12 | pbcopy
   ```
   クリップボードにコピーされるので、`DEVELOPER_CERT_BASE64` に貼り付け

3. **アプリ固有パスワードの取得**
   - https://appleid.apple.com にログイン
   - 「サインインとセキュリティ」→「アプリ用パスワード」
   - 新しいパスワードを生成し、`APPLE_APP_PASSWORD` に設定

4. **署名IDの確認**
   ```bash
   security find-identity -v -p codesigning
   ```
   表示される `"Developer ID Application: Your Name (XXXXXXXXXX)"` 全体を `CODESIGNING_IDENTITY` に設定

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
| `apps/desktop/entitlements.plist` | メインアプリ用エンタイトルメント（マイクアクセス等） |
| `apps/desktop/entitlements.node.plist` | Node.js バイナリ用エンタイトルメント |
