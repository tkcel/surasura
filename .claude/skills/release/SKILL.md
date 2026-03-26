---
description: リリースノート生成からpnpm bumpまでを一括で実行する
argument-hint: "<version>"
---

# リリース一括実行

バージョン番号: $ARGUMENTS

## 概要

リリースノート生成 → 確認 → `pnpm bump` によるバージョン更新・タグ作成・プッシュまでを一括で行う。

## 手順

### Phase 1: バージョン番号の取得と事前チェック

1. `$ARGUMENTS` からバージョン番号を取得する（例: `0.5.1`）
   - バージョン番号がない場合はユーザーに確認する
   - `x.y.z` 形式でなければエラー

2. 事前チェック
   - `git rev-parse v{VERSION}` でタグが既に存在しないことを確認する
   - `git status --porcelain` でワーキングツリーがクリーンであることを確認する
     - クリーンでない場合、未コミットの変更があることをユーザーに伝えて続行するか確認する

### Phase 2: リリースノート生成

3. `/generate-release-notes {VERSION}` スキルの手順に従ってリリースノートを生成する
   - 前回リリースタグの取得
   - 変更コミットの取得・フィルタリング・分類
   - `apps/www/src/content/releases/v{VERSION}.md` へ書き出し

4. 生成したリリースノートの内容をユーザーに表示して確認を求める
   - 修正が必要な場合はユーザーの指示に従って修正する
   - **ユーザーが内容をOKするまで Phase 3 に進まない**

### Phase 3: bump & リリース

5. ユーザーの確認が取れたら `pnpm bump {VERSION}` を実行する
   - このコマンドが以下をすべて自動実行する:
     - `apps/desktop/package.json` のバージョン更新
     - `apps/www/src/constants/release.ts` の更新
     - git commit（`chore: release v{VERSION} — {summary}`）
     - git tag（`v{VERSION}`）
     - git push + git push --tags

6. 実行結果を表示する
   - 成功した場合: GitHub Actions のビルドURLを案内する
     - `https://github.com/tkcel/surasura/actions`
   - 失敗した場合: エラー内容を表示して対処方法を提案する

## 重要事項

- Phase 2 でリリースノートの確認をユーザーに求め、OKが出るまで Phase 3 に進まないこと
- `pnpm bump` はリモートへの push を含むため、実行前にユーザーの明示的な同意を得ること
- リリースノートの生成ルールは `/generate-release-notes` スキルの定義に従うこと
