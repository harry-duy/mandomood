#!/usr/bin/env bash
# MandoMood — dọn byte NULL (\x00) bị chèn ở cuối file source.
# Lý do: cơ chế ghi file của một số editor/agent để lại null byte padding
# khiến TypeScript báo "TS1127: Invalid character" và build fail.
# Cách dùng: bash scripts/strip-null.sh   (chạy trước khi tsc/build)
set -euo pipefail
cd "$(dirname "$0")/.."
fixed=0

# Dùng temp file thay vì process substitution để tương thích Vercel/Alpine
TMPLIST=$(mktemp)
find src -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' \) >> "$TMPLIST"
for rf in package.json tsconfig.json next.config.ts eslint.config.mjs tailwind.config.ts vercel.json postcss.config.mjs; do
  if [ -f "$rf" ]; then echo "$rf" >> "$TMPLIST"; fi
done

while IFS= read -r f; do
  if [ "$(tr -cd '\000' < "$f" | wc -c)" -gt 0 ]; then
    tr -d '\000' < "$f" > "$f.tmp" && mv "$f.tmp" "$f"
    echo "stripped null bytes: $f"
    fixed=$((fixed+1))
  fi
done < "$TMPLIST"

rm -f "$TMPLIST"
echo "Done. Files cleaned: $fixed"
