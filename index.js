const { parse } = require("url");
const doRequest = require("./utils/request");
const Boom = require("boom");
const config = require("./config.json");

const ALLOWED_REGESTIRES = Object.keys(config);

function getPathParams(url) {
  const { pathname } = parse(url, true);
  return pathname.slice(1).split(/\/(.+)/);
}

function validateParams(type, pkg) {
  if (!type) throw Boom.badData("Registry is missing /:registry/:package");
  if (!pkg) throw Boom.badData("Package is missing /:registry/:package");

  if (!ALLOWED_REGESTIRES.includes(type)) {
    throw Boom.badData(
      "Registry must be one of: " + ALLOWED_REGESTIRES.join(", ")
    );
  }
}

function errorHandler(error, res) {
  if (!error.isBoom) {
    error = Boom.boomify(error, error.toString());
  }

  res.statusCode = error.output.statusCode;
  res.end(error.output.payload.message);
}

async function requestHandler(res, pkg, type) {
  const url = await doRequest(pkg, type);

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ url }));
}

module.exports = async (req, res) => {
  try {
    const [type, pkg] = getPathParams(req.url);
    validateParams(type, pkg);
    await requestHandler(res, pkg, type);
  } catch (error) {
    errorHandler(error, res);
  }
};