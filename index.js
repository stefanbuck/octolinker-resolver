const { json } = require('micro');
const pMap = require('p-map');
const doRequest = require("./utils/request");
const cache = require("./utils/cache");

// const { parse } = require("url");
// const Boom = require("boom");
// const config = require("./config.json");

// const ALLOWED_REGESTIRES = Object.keys(config);

// function getPathParams(url) {
//   const { pathname } = parse(url, true);
//   return pathname.slice(1).split(/\/(.+)/);
// }

// function validateParams(type, pkg) {
//   if (!type) throw Boom.badData("Registry is missing /:registry/:package");
//   if (!pkg) throw Boom.badData("Package is missing /:registry/:package");

//   if (!ALLOWED_REGESTIRES.includes(type)) {
//     throw Boom.badData(
//       "Registry must be one of: " + ALLOWED_REGESTIRES.join(", ")
//     );
//   }
// }

// function errorHandler(error, res) {
//   if (!error.isBoom) {
//     error = Boom.boomify(error, error.toString());
//   }

//   res.statusCode = error.output.statusCode;
//   res.end(error.output.payload.message);
// }

// async function requestHandler(res, pkg, type) {
//   const url = await doRequest(pkg, type);

//   res.setHeader("Content-Type", "application/json");
//   res.end(JSON.stringify({ url }));
// }

const simpleCache = {};


const mapper = async (item) => {
		return await doRequest(item.target, item.registry);
	};

async function requestHandler(payload) {

  const result = await pMap(payload, mapper, {concurrency: 1});

  return result;
}


module.exports = async (req, res) => {
  if (req.method === 'POST') {

    console.time('start');
    const body = await json(req);

    await cache.auth()
    const result = await requestHandler(body)

    console.timeEnd('start');

    cache.quit();

    console.log(result)
    res.end('done')
  } else {
    res.end('Not valid')
  }
};