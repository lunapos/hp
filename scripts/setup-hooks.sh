#!/bin/sh
# Git hooksをセットアップ
# 使い方: sh scripts/setup-hooks.sh

HOOK_DIR=$(git rev-parse --git-dir)/hooks

cp scripts/pre-push "$HOOK_DIR/pre-push"
chmod +x "$HOOK_DIR/pre-push"

echo "Git hooks セットアップ完了"
