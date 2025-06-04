# LoL Analyzer

## 概要

League of Legends の試合結果を自動取得し、個人の振り返りコメントと組み合わせて記録・分析できるデスクトップアプリケーション

## 主要機能

### 1. 試合記録機能

-   **柔軟な記録タイミング**: 試合直後でも時間を置いてからでも記録可能
-   **振り返りコメント**: 自由記述フィールド（反省点、良かった点、気づき）
-   **編集・更新機能**: 後から内容の修正・追記が可能
-   **タグ機能**: カスタムタグで試合を分類（例：「良試合」「要改善」「新チャンプ」）

### 2. 試合データ自動取得（Riot API 連携）

取得データ項目：

-   日付・時刻
-   ゲームモード（ランク戦、ノーマル、ARAM 等）
-   使用チャンピオン
-   KDA（キル/デス/アシスト）
-   ビルド（アイテム構成）
-   CS（クリープスコア）
-   ルーン構成
-   対面チャンピオン
-   ゲーム時間
-   ダメージ詳細（総ダメージ、チャンピオンダメージ等）
-   勝敗結果

### 3. データ分析・可視化機能

-   **統計ダッシュボード**: KDA 平均、勝率、よく使うチャンピオンなど
-   **シンプルなグラフ表示**:
    -   勝率の時系列推移（折れ線グラフ）
    -   チャンピオン別勝率（棒グラフ）
    -   KDA 推移（折れ線グラフ）
-   **フィルタリング機能**: 期間、チャンピオン、ゲームモード等で絞り込み

### 4. ユーザー設定・認証機能

-   **Riot API 設定**:
    -   ユーザー自身で API キーを取得・入力（ローカル保存）
    -   API キー期限管理（開発用キーは 24 時間期限）
    -   サモナー名設定（日本サーバー対象）
-   **データ取得制限**:
    -   手動データ更新（1 分間隔制限）
    -   1 回の取得で最大 10 試合まで
-   **設定管理**: アプリケーション設定の保存・復元

### 5. 検索・管理機能

-   **高度な検索**: チャンピオン、日付、コメント内容での検索
-   **試合履歴一覧**: ソート機能付きの試合一覧表示（メイン画面）
-   **データエクスポート**: CSV 形式でのデータ出力

## 技術スタック詳細

### 開発環境セットアップ

```bash
# プロジェクト作成
npm create vite@latest lol-analyzer -- --template react-ts
cd lol-analyzer

# Electron関連
npm install -D electron electron-builder concurrently wait-on
npm install electron-store

# UI関連
npm install -D tailwindcss postcss autoprefixer
npm install recharts lucide-react

# API関連
npm install @supabase/supabase-js axios

# 開発用
npm install -D @types/node
```

### プロジェクト構造（想定）

```
src/
├── components/
│   ├── MatchList.tsx
│   ├── ReflectionForm.tsx
│   ├── StatsChart.tsx
│   └── Settings.tsx
├── hooks/
│   ├── useRiotApi.ts
│   └── useSupabase.ts
├── types/
│   └── index.ts
├── utils/
│   ├── storage.ts
│   └── api.ts
├── App.tsx
└── main.tsx

electron/
├── main.ts
├── preload.ts
└── package.json
```

### フロントエンド

-   **Electron + Vite**: 高速な開発体験
-   **React + TypeScript**: コンポーネントベース開発
-   **Tailwind CSS**: 高速スタイリング
-   **Zustand**: 軽量な状態管理（複雑になったら導入）
-   **Recharts**: シンプルなグラフ描画
-   **electron-store**: ローカル設定管理

### バックエンド・データベース

-   **Supabase**:
    -   PostgreSQL データベース（試合データ・振り返り記録）
    -   RESTful API
-   **ローカルストレージ**:
    -   Electron Store（API キー、ユーザー設定）
    -   暗号化対応

### 外部 API

-   **Riot Games API (日本サーバー)**:
    -   Summoner API（サモナー情報取得）
    -   Match API（試合詳細取得）
    -   League API（ランク情報取得）
    -   開発用 API キー制限: 1 分間 10 試合、24 時間期限

## データベース設計（想定）

### matches テーブル

### user_settings テーブル

````sql
- id (Primary Key)
- riot_api_key (暗号化)
- summoner_name
- region
- api_key_expires_at
- created_at
- updated_at
```sql
- id (Primary Key)
- summoner_id
- game_id (Riot API game ID)
- champion_name
- game_mode
- game_duration
- kills, deaths, assists
- cs_score
- total_damage
- champion_damage
- items (JSON)
- runes (JSON)
- opponent_champion
- win_status
- played_at
- created_at
- updated_at
````

### reflections テーブル

```sql
- id (Primary Key)
- match_id (Foreign Key)
- free_text_notes (自由記述)
- laning_rating (1-5)
- teamfight_rating (1-5)
- decision_making_rating (1-5)
- objective_control_rating (1-5)
- goal_achievement_rating (1-5)
- tags (JSON Array)
- overall_satisfaction (1-5)
- created_at
- updated_at
```

## UI/UX 設計方針

### メイン画面（試合リスト中心）

-   **試合履歴テーブル**: 日付、チャンピオン、KDA、勝敗、振り返り状況を一覧表示
-   **クイックフィルター**: 最近の試合、未振り返り、特定チャンピオンなど
-   **サイドパネル**: 簡易統計情報（今週の勝率、よく使うチャンピオンなど）

### 振り返り入力画面

-   **シンプル構成**: 自由記述エリア + 満足度評価（5 段階）
-   **試合データ表示**: 入力中に試合の統計データを参照可能

### データ更新フロー

1. 設定画面で API キー・サモナー名を入力・ローカル保存
2. メイン画面の「データ更新」ボタンで手動取得（1 分間隔制限）
3. 最大 10 試合を取得して Supabase に保存
4. 新しい試合があれば通知・リストに追加

### API 制限対応

-   **レート制限**: 1 分間に 10 試合まで取得
-   **キー管理**: 24 時間毎の手動更新が必要
-   **エラーハンドリング**: API 制限超過時の適切な通知

## 開発フェーズ（スピード重視）

### Phase 1: MVP（1-2 週間目標）

-   [ ] Vite + React + Electron 環境構築
-   [ ] Tailwind CSS セットアップ
-   [ ] ローカル設定管理（electron-store）
-   [ ] Riot API 基本接続テスト
-   [ ] 試合データ取得・表示（シンプルなテーブル）
-   [ ] 振り返り入力フォーム（基本的なもの）

### Phase 2: 基本機能完成（3-4 週間目標）

-   [ ] Supabase 接続・データ保存
-   [ ] 試合リストの充実（フィルタリング等）
-   [ ] シンプルな統計グラフ（Recharts）
-   [ ] API キー管理 UI
-   [ ] 基本的なエラーハンドリング

### Phase 3: 改善・最適化

-   [ ] UI/UX の改善
-   [ ] パフォーマンス最適化
-   [ ] 追加のグラフ・統計
-   [ ] データエクスポート機能

### 開発 Tips（スピード重視）

-   コンポーネントライブラリは使わず、Tailwind で高速スタイリング
-   状態管理は最初は useState/useContext、複雑になったら Zustand 導入
-   エラーハンドリングは最低限から始めて段階的に改善
-   デザインは機能完成後に調整

## 期待される効果

-   試合ごとの具体的な振り返りによる継続的な改善
-   データに基づいた客観的な自己分析
-   長期的な成長の可視化とモチベーション向上
-   弱点の特定と重点的な練習計画の立案

## 開発体制

-   個人開発プロジェクト
-   アジャイル開発手法
-   MVP（Minimum Viable Product）ベースでの段階的リリース

---

**Next Steps**:

1. 開発環境のセットアップ
2. Riot API キーの取得
3. Supabase プロジェクトの作成
4. 基本的な Electron アプリのプロトタイプ作成
