var http = require("http");

http
  .createServer(function(req, res) {
    if (!req.url.includes("favicon.ico")) {
      require("./index.js")(req, res);
    }
  })
  .listen(3000);
console.log("Server running at http://127.0.0.1:3000/");


const res = {
  setHeader: () => {},
  end: (json) => {
    console.log('>>>>', res.statusCode, json);
  },
}

require("./index.js")( {
  url: '/npm/backbone',
},res);