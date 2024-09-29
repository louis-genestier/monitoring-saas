const esbuild = require("esbuild");
const esbuildPluginTsc = require("esbuild-plugin-tsc");

const args = process.argv.slice(2);
const isForAveragePrices = args.includes("--average-prices");

esbuild
  .build({
    entryPoints: [
      !isForAveragePrices ? "src/index.ts" : "src/setAveragePrices.ts",
    ],
    bundle: true,
    outfile: !isForAveragePrices
      ? "dist/bundle.cjs"
      : "dist/setAveragePrices.cjs",
    platform: "node",
    target: "node14",
    plugins: [esbuildPluginTsc()],
  })
  .catch(() => process.exit(1));
