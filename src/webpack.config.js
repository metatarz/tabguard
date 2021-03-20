const path = require('path')
module.exports = {
    mode: 'production',
    resolve: { extensions: ['.js'] },
    entry: ['./background/background'],
    output: {
        path: path.join(__dirname, './'),
        filename: '[name].bundle.js',
    },
    optimization: {
        minimize: true,
    }
}