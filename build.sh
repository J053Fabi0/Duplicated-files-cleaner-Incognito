#! /bin/sh

mkdir -p ./build

deno compile --output ./build/x86_64-unknown-linux-gnu --target x86_64-unknown-linux-gnu --allow-net --allow-write --allow-run --allow-env --allow-read index.ts
deno compile --output ./build/x86_64-pc-windows-msvc   --target x86_64-pc-windows-msvc   --allow-net --allow-write --allow-run --allow-env --allow-read index.ts
deno compile --output ./build/x86_64-apple-darwin      --target x86_64-apple-darwin      --allow-net --allow-write --allow-run --allow-env --allow-read index.ts
deno compile --output ./build/aarch64-apple-darwin     --target aarch64-apple-darwin     --allow-net --allow-write --allow-run --allow-env --allow-read index.ts
