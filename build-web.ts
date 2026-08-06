import tailwind from "bun-plugin-tailwind";

const result = await Bun.build({
  entrypoints: ["./web/index.tsx"],
  outdir: "./web/dist",
  plugins: [tailwind],
  target: "browser",
  minify: true,
  naming: "bundle.js",
});

if (!result.success) {
  console.error(result.logs);
  process.exit(1);
}
console.log("✓ web built");
