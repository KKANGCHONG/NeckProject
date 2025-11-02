import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
  // 정적 자산(import로 불러오는 .png, .jpg 등)을 인식시키기 위한 옵션
    assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg"],
    resolve: {
    alias: {
      "@": "/src", // 절대경로 import 용 (예: import x from "@/components/x")
    },
    },
    server: {
    port: 5173, // 기본 포트
    open: true, // npm run dev 시 자동으로 브라우저 열기
    },
});
