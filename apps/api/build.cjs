const esbuild = require("esbuild");
const esbuildPluginTsc = require("esbuild-plugin-tsc");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/bundle.cjs",
    platform: "node",
    target: "node20",
    plugins: [esbuildPluginTsc()],
    external: ["@node-rs/bcrypt"],
    loader: {
      ".node": "file",
    },
  })
  .catch(() => process.exit(1));
