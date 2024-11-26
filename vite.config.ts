import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import ElementPlus from 'unplugin-element-plus/vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        "ehai-helper": './src/main.ts',
      },
      output: {
        entryFileNames: '[name].js', // 入口文件名
        chunkFileNames: '[name].js', // 代码分块文件名
        assetFileNames: '[name].[ext]',// 资源文件名
      }
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    ElementPlus(),
    viteStaticCopy({
      targets: [
        {
          src: './dist/ehai-helper.js', // 复制到输出目录的目标位置
          dest: '../chrome-extension-template/', // 需要复制的文件或目录
        }
      ]
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
