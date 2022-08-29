const path = require('path');

module.exports = {
  mode: 'production',
  entry: './signer.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'signer.js',
    library: 'signer',
    libraryTarget: 'window'
  },
};
