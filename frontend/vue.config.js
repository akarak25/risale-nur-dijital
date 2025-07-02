const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  lintOnSave: process.env.NODE_ENV !== 'production' // Geliştirme sırasında lint kontrolünü devre dışı bırakır
})