import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup/vitest.setup.js',
    include: ['tests/**/*.vitest.test.{js,jsx}'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov', 'json-summary', 'html'],
      reportsDirectory: 'coverage/components',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx'],
    },
  },
});
