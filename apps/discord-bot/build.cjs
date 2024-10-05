const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/bundle.cjs",
    platform: "node",
    target: "node20",
    plugins: [
      {
        name: "exclude-deploy-commands",
        setup(build) {
          build.onResolve({ filter: /^deployCommands$/ }, (args) => ({
            path: args.path,
            external: true,
          }));
        },
      },
    ],
  })
  .catch(() => process.exit(1));
