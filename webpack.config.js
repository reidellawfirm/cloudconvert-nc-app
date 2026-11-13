const path = require('path')

module.exports = {
    entry: {
        ccconvert: './src/ccconvert.js',
        admin:     './src/admin.js',
    },
    output: {
        path: path.resolve(__dirname, 'js'),
        filename: '[name].js',
    },
    resolve: {
        fallback: {
            path:   false,
            fs:     false,
            os:     false,
            stream: false,
        },
    },
}
