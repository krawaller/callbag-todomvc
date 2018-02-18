// script for setting up the dist folder for the React app,
// before webpack adds bundle.js

var fs = require("fs-extra");
var join = require("path").join;

fs.emptyDirSync(join(__dirname, "dist"));

fs.copySync(join(__dirname, "src/appdoc.html"), join(__dirname, "dist/index.html"));

fs.copySync(join(__dirname, "node_modules/todomvc-app-css/index.css"), join(__dirname, "/dist/todomvc.css"));
