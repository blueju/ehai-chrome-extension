import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import {viteStaticCopy} from 'vite-plugin-static-copy'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
// import { viteMockServe } from 'vite-plugin-mock';

// https://vite.dev/config/
export default defineConfig({
    build: {
        outDir: 'dist',
        lib: {
            entry: './src/main.ts', // 入口文件
            name: 'ehaiHelper',
            fileName: (format) => `ehai-helper.js`,
            formats: ['iife'], // 你可以指定需要的格式
        },
        rollupOptions: {
            output: {
                assetFileNames: 'ehai-helper.[ext]',// 资源文件名
            }
        }
    },
    define: {
        'process.env': {}
    },
    plugins: [
        vue(),
        vueJsx(),
        vueDevTools(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
        viteStaticCopy({
            targets: [
                {
                    src: './dist/ehai-helper.js', // 复制到输出目录的目标位置
                    dest: '../chrome-extension-template/', // 需要复制的文件或目录
                },
                {
                    src: './dist/ehai-helper.css', // 复制到输出目录的目标位置
                    dest: '../chrome-extension-template/', // 需要复制的文件或目录
                }
            ]
        }),
        // viteMockServe({
        //   mockPath: 'mock',
        //   enable: true,
        // }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
})
