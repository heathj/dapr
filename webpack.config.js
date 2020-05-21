const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const NodemonPlugin = require("nodemon-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const srcPath = [__dirname, "src"];
const tsPath = [...srcPath, "ui", "ts"];
const htmlPath = [...srcPath, "ui", "html"];

const config = (mode) => {
  const isDevelopment = mode === "development";
  const uiConfig = {
    stats: "errors-warnings",
    watch: isDevelopment ? true : false,
    devtool: isDevelopment ? "source-map" : "",
    mode: mode,
    entry: {
      ui: path.join(...[...tsPath, "index.tsx"]),
    },
    output: {
      path: path.join(__dirname, "build"),
      filename: "[name].bundle.js",
    },
    devServer: {
      host: "localhost",
      port: 3000,
      contentBase: "./build",
      writeToDisk: true,
      proxy: {
        "/": {
          target: "http://localhost:8888/",
          secure: false,
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          exclude: /node_modules/,
          loader: "css-loader",
        },
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              onlyCompileBundledFiles: true, // I like this option because it doesn't type check code that isn't used
            },
          },
        },
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader",
        },
      ],
    },
    resolve: { extensions: [".ts", ".tsx", ".js", ".jsx"] },
    plugins: [
      new webpack.DefinePlugin({
        DEV: isDevelopment,
      }),
      new HtmlWebpackPlugin({
        template: path.join(...[...htmlPath, "index.html"]),
        favicon: path.join(...[...htmlPath, "favicon.ico"]),
        filename: "index.html",
        chunks: ["ui"],
      }),
    ],
    externals: {
      react: "React",
      "react-dom": "ReactDOM",
    },
  };
  const serverConfig = {
    watch: isDevelopment ? true : false,
    devtool: isDevelopment ? "source-map" : "",
    mode: mode,
    target: "node",
    entry: {
      server: path.join(...[...srcPath, "server", "index.ts"]),
    },
    output: {
      path: path.join(__dirname, "build"),
      filename: "[name].bundle.js",
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              onlyCompileBundledFiles: true, // I like this option because it doesn't type check code that isn't used
            },
          },
        },
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader",
        },
      ],
    },
    resolve: { extensions: [".ts", ".tsx", ".js", ".jsx"] },
    plugins: [
      new webpack.DefinePlugin({
        DEV: isDevelopment,
      }),
      new NodemonPlugin({ nodeArgs: ["--inspect=9222"] }),
    ],
    externals: [nodeExternals()],
  };

  const fridaConfig = {
    watch: isDevelopment ? true : false,
    devtool: isDevelopment ? "source-map" : "",
    mode: mode,
    target: "node",
    entry: {
      frida: path.join(...[...srcPath, "frida-scripts", "index.ts"]),
    },
    output: {
      path: path.join(__dirname, "build"),
      filename: "[name].bundle.js",
    },
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              onlyCompileBundledFiles: true, // I like this option because it doesn't type check code that isn't used
            },
          },
        },
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader",
        },
      ],
    },
    resolve: { extensions: [".ts", ".tsx", ".js", ".jsx"] },
    plugins: [
      new webpack.DefinePlugin({
        DEV: isDevelopment,
      }),
    ],
  };

  return [uiConfig, serverConfig, fridaConfig];
};

module.exports = (_, argv) => {
  const { mode } = argv;
  return config(mode);
};
