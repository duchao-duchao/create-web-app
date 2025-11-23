export default {
  meta: {
    label: 'Webpack',
    description: '使用 Webpack 5 打包，内置 devServer 与 HTML 注入。',
    stability: 'beta',
  },
  pkg: ({ framework, language }) => {
    const isReact = framework === 'react';
    const isVue = framework === 'vue';
    const isTs = language === 'ts';
    return {
      scripts: {
        dev: 'webpack serve --mode development --open',
        build: 'webpack --mode production',
        preview: 'serve -s dist',
      },
      devDependencies: {
        // 核心
        webpack: '^5.94.0',
        'webpack-cli': '^5.1.4',
        'webpack-dev-server': '^4.15.1',
        'html-webpack-plugin': '^5.6.0',
        // 资源与样式
        'css-loader': '^6.10.0',
        'style-loader': '^3.3.4',
        // JS/TS 解析
        ...(isReact ? {
          'babel-loader': '^9.2.1',
          '@babel/core': '^7.26.0',
          '@babel/preset-env': '^7.26.0',
          '@babel/preset-react': '^7.24.7',
          ...(isTs ? { '@babel/preset-typescript': '^7.24.7' } : {}),
        } : {}),
        ...(isVue ? {
          'vue-loader': '^17.4.2',
          '@vue/compiler-sfc': '^3.5.8',
          ...(isTs ? { 'ts-loader': '^9.5.1', typescript: '^5.6.3' } : {}),
        } : {}),
        // 预览
        serve: '^14.2.3',
      },
    };
  },
  files: [
    {
      to: 'webpack.config.js',
      content: ({ framework, language }) => {
        const isReact = framework === 'react';
        const isVue = framework === 'vue';
        const isTs = language === 'ts';
        const entry = isReact ? (isTs ? './src/main.tsx' : './src/main.jsx') : (isTs ? './src/main.ts' : './src/main.js');
        const extReact = isTs ? "['.tsx', '.ts', '.jsx', '.js']" : "['.jsx', '.js']";
        const extVue = isTs ? "['.ts', '.js']" : "['.js']";
        return `const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
${isVue ? "const { VueLoaderPlugin } = require('vue-loader');" : ''}

module.exports = {
  entry: '${entry}',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ${isReact ? extReact : extVue},
  },
  module: {
    rules: [
      ${isReact ? `{
        test: ${isTs ? `/\\.(ts|tsx|js|jsx)$/` : `/\\.(js|jsx)$/`},
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'${isTs ? ", '@babel/preset-typescript'" : ''}
            ],
          },
        },
      },` : ''}
      ${isVue ? `{
        test: /\\.vue$/,
        loader: 'vue-loader',
      },` : ''}
      ${isVue && isTs ? `{
        test: /\\.ts$/,
        loader: 'ts-loader',
        options: { appendTsSuffixTo: [/\\.vue$/] },
        exclude: /node_modules/,
      },` : ''}
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'index.html') }),
    ${isVue ? 'new VueLoaderPlugin(),' : ''}
  ],
  devServer: {
    port: 5173,
    historyApiFallback: true,
    hot: true,
    open: true,
  },
  devtool: 'source-map',
};
`;
      },
      whenExists: 'overwrite',
    },
  ],
  transforms: [
    // 移除 Vite 的入口脚本标签，交由 HtmlWebpackPlugin 注入
    {
      file: 'index.html',
      run: (raw) => {
        const reactTag = /<script\s+type="module"\s+src="\/src\/main\.jsx"><\/script>/;
        const reactTagTs = /<script\s+type="module"\s+src="\/src\/main\.tsx"><\/script>/;
        const vueTag = /<script\s+type="module"\s+src="\/src\/main\.js"><\/script>/;
        const vueTagTs = /<script\s+type="module"\s+src="\/src\/main\.ts"><\/script>/;
        let next = raw.replace(reactTag, '').replace(reactTagTs, '').replace(vueTag, '').replace(vueTagTs, '');
        return next;
      },
    },
  ],
};