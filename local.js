var http = require("http");
var got = require("got");

const zeitId = process.argv[2];

if (!zeitId) {
  http
    .createServer(function(req, res) {
      if (!req.url.includes("favicon.ico")) {
        require("./api/handler.js")(req, res);
      }
    })
    .listen(3000);
}

const url = zeitId
  ? `https://octo-resolver-${zeitId}.now.sh/`
  : "http://localhost:3000/";
console.log(url);

let timings = [];
const initialRequest = () => {
  console.log("---------------------");
  got
    .post({
      json: true,
      url,
      body: [
        // { type: "registry", registry: "bower", target: "jquery" },
        // {"type": "registry", "registry": "composer", "target": "phpunit/phpunit"},
        // {"type": "registry", "registry": "rubygems", "target": "nokogiri"},
        { type: "registry", registry: "foo", target: "bar" },
        { type: "registry", registry: "npm", target: "request" },
        { type: "registry", registry: "npm", target: "request" },
        // { type: "registry", registry: "npm", target: "babel-helper-regex" },
        // {"type": "registry", "registry": "npm", "target": "audio-context-polyfill"},
        // {"type": "registry", "registry": "npm", "target": "github-url-from-username-repo"},
        // {"type": "registry", "registry": "npm", "target": "find-project-root"},
        // {"type": "registry", "registry": "pypi", "target": "simplejson"},
        // {"type": "registry", "registry": "crates", "target": "libc"},
        { type: "go", target: "k8s.io/kubernetes/pkg/api" },

        // { type: "melpa", target: "zzz-to-char" }, // only supported in API

        { type: "java", target: "org.apache.log4j.Appender" },
        { type: "ping", target: "https://nodejs.org/api/path.html" },
        { type: "ping", target: "http://notfound4040.org/path.html" },
        { type: "unkown", target: "boom" },
        {},
        { foo: "bar" },
        1,
        "foo"
      ]
    })
    .then(({ body }) => {
      timings.push(body);

      if (timings.length < 1) {
        initialRequest();
      } else {
        console.log("---------------------");
        console.log(JSON.stringify(timings, null, " "));
      }
    })
    .catch(error => {
      console.log(error);
    });
};
initialRequest();
