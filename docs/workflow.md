# Luna ワークフロー・開発フロー

## 基本ワークフロー

- **確認不要**: luna 配下のプロジェクトではコマンド実行・push 含め一切確認を求めず自律的に進める
- **「リリースして」= push まで含む**: コミット → push まで一気にやる
- **記事リリース**: draft から `hp/content/column/{date}/` に MDX 変換して配置 → リリース後draftファイルは削除 → hp でコミット → push（contentが唯一の正）
- **HP 開発ニュース（自動更新必須）**: 全プロジェクト（Floor/Admin/Cast/HP/LP/記事）で機能追加・変更を push するたびに、`hp/src/data/news-updates.ts` に開発アップデートを追加して push する。別途指示がなくても自動で行うこと

## push後のCIチェック・自動修正（必須）

push後は**必ず**GitHub Actions CIの結果を確認する。失敗していたら自動で修正→再pushする。成功するまで繰り返す。ユーザーに「CI失敗しました」と報告して終わりにしない。

**確認手順**: push後30秒待ってから確認:
```
sleep 30 && gh run list --limit 1 --repo zh-ru/luna --json databaseId,conclusion -q '.[0]'
```

**失敗時**: ログを取得して原因特定 → 修正 → コミット → 再push → 再度CI確認
```
gh run view <run-id> --log-failed --repo zh-ru/luna
```

**CIが通るまで「完了」と報告してはいけない**

## Floor（iPad）変更後の動作確認（必須）

lunapos-floor に変更をpushしたら、シミュレーターでビルド→起動→スクリーンショット確認まで自律的に行う。

**確認手順:**
```bash
# 1. ビルド
cd lunapos-floor/LunaPOS && xcodebuild -scheme LunaPOS -destination 'id=3C665188-E8A1-400F-9BDC-1F7866F7F268' -configuration Debug build 2>&1 | tail -3

# 2. インストール・起動
APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData/LunaPOS-*/Build/Products/Debug-iphonesimulator -name "LunaPOS.app" | head -1)
xcrun simctl install booted "$APP_PATH"
xcrun simctl terminate booted com.luna.pos 2>/dev/null; xcrun simctl launch booted com.luna.pos

# 3. スクリーンショット取得・確認（起動待ち含め8秒）
sleep 8 && xcrun simctl io booted screenshot /tmp/sim_check.png
```

シミュレーターが起動していない場合: `xcrun simctl boot 3C665188-E8A1-400F-9BDC-1F7866F7F268 && open -a Simulator`

確認内容: 変更した画面が意図通り表示されているか目視確認。問題があれば修正→再ビルド→再確認。

## テーマ一括draft化フロー

`marketing/article/themes.md` のチェックボックスを使って記事を量産するフロー:

1. ユーザーが `themes.md` の記事化したいテーマに `- [x]` をつける
2. 「チェックしたやつdraft化して」と伝える
3. Claudeがチェック済みの全テーマについて、themes.mdの切り口案をそのまま使い、Step 2〜3（具体↔抽象の設計 → 執筆）を順番に実行してdraftを生成する
4. 全draft生成後、`themes.md` のチェックを `- [ ]` に戻す（draftファイルは残す）
5. ユーザーが各draftを確認 → 「リリースして」でMDX変換 → `hp/content/column/{date}/` へ配置 → push

## Ralph Loop開発フロー（PRD駆動の自律開発）

1. **PRD作成**: `PRD.md` にタスク一覧を作成
2. **PRD深掘り**: 各タスクを実装・テスト・検証・エッジケースまで含めたサブタスクに分解
3. **Ralph Loop実行**: PRDのタスクを上から順に消化。全タスクが `[x]` + 検証PASSまで止まらない
4. **完了タスクは即座に `[x]` 更新** → コミット → 次へ

## 進捗レポート出力（必須）

長時間作業中は以下のフォーマットで出力する:

**タスク完了時:**
```
[完了] Phase X > X.X タスク名
- 実装内容: 概要
- 検証結果: テスト結果 or ビルド結果
- 確認URL: （デプロイがある場合）
- 次のタスク: X.X タスク名
```

**ブロッカー発生時:**
```
[ブロック] Phase X > X.X タスク名
- 原因: 詳細
- 必要なアクション: ユーザーが何をすればいいか
- スキップして次のタスクに進みます
```

**Phase完了時:**
```
[Phase完了] Phase X: フェーズ名
- 完了: X/X タスク
- ブロック: Xタスク（内容）
- 確認URL: （あれば）
- 次のアクション: Phase X に進む or ブロッカー解消？
```
