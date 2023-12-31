import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src/"),
      components: `${path.resolve(__dirname, "./src/components/")}`,
      public: `${path.resolve(__dirname, "./public/")}`,
      ["@types"]: `${path.resolve(__dirname, "./src/types.ts")}`,
      state: `${path.resolve(__dirname, "./src/state/")}`,
      abis: `${path.resolve(__dirname, "./src/abis/")}`,
      utils: `${path.resolve(__dirname, "./src/utils/")}`,
    },
  },
});
