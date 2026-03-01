import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: "src/range-slider-card.js",
      name: "RangeSliderCard",
      formats: ["es"],
      fileName: () => "range-slider-card.js",
    },
    rollupOptions: {
      external: [],
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});