const path = require('path')

module.exports = {
    entry: {
        app: ['./src/diary.js', './src/stats.js']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, "public")
    },
    mode: 'production',
    watch: true,
    devtool: 'source-map'
}