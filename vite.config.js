import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: "src/flex-slider-card.js",
      name: "RangeSliderCard",
      formats: ["es"],
      fileName: () => "flex-slider-card.js",
    },
    rollupOptions: {
      external: [],
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});