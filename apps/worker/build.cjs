const esbuild = require("esbuild");
const esbuildPluginTsc = require("esbuild-plugin-tsc");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/bundle.cjs",
    platform: "node",
    target: "node14",
    plugins: [esbuildPluginTsc()],
  })
  .catch(() => process.exit(1));
