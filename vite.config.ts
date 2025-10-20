import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path'
import terser from '@rollup/plugin-terser'
import { writeFileSync } from 'fs'
// 設置環境變量來禁用 Sass 警告
process.env.SASS_SILENCE_DEPRECATION_WARNINGS = 'true';
process.env.SASS_QUIET = 'true';
process.env.SASS_QUIET_DEPS = 'true';
process.env.SASS_SUPPRESS_DEPRECATION_WARNINGS = 'true';

function pathResolve(dir: string) {
  return resolve(__dirname, '.', dir)
}

const Timestamp = new Date().getTime()
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue({
      script: {
        defineModel: true
      }
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router'],
      dts: 'src/auto-import.d.ts' // 路径下自动生成文件夹存放全局指令
    }),
    Components({
      resolvers: [VantResolver(), ElementPlusResolver()]
    }),
    {
      name: 'generate-version',
      closeBundle() {
          const version = Date.now().toString(); // 以时间戳作为版本号
          writeFileSync(path.resolve(__dirname, 'public/version.json'), JSON.stringify({ version }), 'utf-8');
      }
    }
  ],
  base: '', // 静态资源基础路径
  build: {
    chunkSizeWarningLimit: 20000, // 设置阈值为20K
    sourcemap: false, // 输出.map文件,默认是false
    commonjsOptions: {
      transformMixedEsModules: true
    },
    minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     //生产环境时移除console
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // },
    rollupOptions: {
      output: {
        chunkFileNames: `static/js/[name].[hash]${Timestamp}.js`,
        entryFileNames: `static/js/[name].[hash]${Timestamp}.js`,
        assetFileNames: `static/[ext]/[name].[hash]${Timestamp}.[ext]`,
        plugins: [
          terser()
        ],
      }
    }
  },
  // 添加簡單的 Sass 配置
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // or 'modern'
        silenceDeprecations: ['legacy-js-api'],
        // 空配置，不添加任何特殊選項
      }
    }
  },
  server: {
    hmr: true,
    host: '0.0.0.0',
    port: 8088,
    proxy: {
      '/api': {
        // target: 'http://129.226.95.28:9007',   //测试代理接口
        target: 'http://54.254.138.89:9007',         //正式代理接口
        changeOrigin: true
      }
    }
  }
})
