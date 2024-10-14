import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/type.ts",
    "src/index.d.ts",
    "src/withComponentAvailable.tsx",
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  minify: false,
  format: ["esm", "cjs"],
  target: "esnext",
  external: ["@remote-stores", "react", "react-dom"],
});
