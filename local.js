var http = require("http");
var got = require("got");

http
  .createServer(function(req, res) {
    if (!req.url.includes("favicon.ico")) {
      require("./index.js")(req, res);
    }
  })
  .listen(3000);
console.log("Server running at http://127.0.0.1:3000/");


got.post({
  url: 'http://localhost:3000/',
  body: JSON.stringify([
    {"type":"registry","registry":"npm","target":"lodash"},{"type":"registry","registry":"npm","target":"backbone"}
  ])
})