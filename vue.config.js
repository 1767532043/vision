module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/vision/' : '/',
    outputDir: 'vision',
    css: {
        loaderOptions: { // 向 CSS 相关的 loader 传递选项
            less: {
                javascriptEnabled: true
            }
        }
    }
}
