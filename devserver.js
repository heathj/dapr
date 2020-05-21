const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const app = express();
const config = require("./webpack.config.js");
const serverConfig = config(null, { mode: "development" })[1];
const compiler = webpack(serverConfig);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: serverConfig.output.publicPath,
  })
);

// Serve the files on port 3000.
app.listen(3000, function () {
  console.log("Example app listening on port 3000!\n");
});
