---
description: 前回リリースからの変更をもとにリリースノートMDを自動生成する
argument-hint: "[version]"
---

# リリースノート生成

バージョン番号: $ARGUMENTS

## 手順

1. バージョン番号の取得と検証
   - `$ARGUMENTS` からバージョン番号を取得する（例: `0.4.12`）
   - バージョン番号がない場合はユーザーに確認する
   - `apps/www/src/content/releases/v{VERSION}.md` が既に存在する場合は上書き確認する

2. 前回リリースタグの取得
   - `git describe --tags --abbrev=0` を実行して直前のタグを取得する

3. 変更コミットの取得
   - `git log {前回タグ}..HEAD --oneline` を実行してコミット一覧を取得する
   - merge commitや `chore: release` コミットは除外する

4. コミットの分類
   - conventional commits の prefix に基づいて以下に分類する:
     - `feat:` → **新機能**
     - `fix:` → **修正**
     - `chore:`, `refactor:`, `perf:`, `docs:`, `style:`, `ci:`, `build:` → **改善**
   - 破壊的変更（`BREAKING CHANGE` や `!:` 付き）があれば **破壊的変更** セクションに分類する

5. リリースノートの生成
   - 各コミットメッセージを**エンドユーザー向けの日本語**に要約する
   - 技術的な詳細（リファクタリング、CI変更など）はユーザーに意味のある形に言い換える
   - 関連する変更はまとめて1つの項目にする
   - 以下のフォーマットでMDファイルを生成する:

```markdown
---
version: "{VERSION}"
date: "{今日の日付 YYYY-MM-DD}"
summary: "{変更内容の1行要約}"
---

## 新機能

- 変更内容1
- 変更内容2

## 改善

- 改善内容1

## 修正

- 修正内容1
```

6. ファイルの書き出し
   - `apps/www/src/content/releases/v{VERSION}.md` に書き出す
   - 空のセクション（該当する変更がないカテゴリ）は省略する

7. 内容の確認
   - 生成したリリースノートの内容をユーザーに表示して確認を求める
   - 修正が必要な場合はユーザーの指示に従って修正する
