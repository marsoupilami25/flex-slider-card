import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: "src/flex-slider-card.js",
      name: "FlexSliderCard",
      formats: ["es"],
      fileName: () => "flex-slider-card.js",
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});