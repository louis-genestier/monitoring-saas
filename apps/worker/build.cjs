const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: "node14",
    outdir: "./dist",
  })
  .catch(() => process.exit(1));
