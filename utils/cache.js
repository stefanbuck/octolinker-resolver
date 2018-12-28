// const Receptacle = require("receptacle");

// const cache = new Receptacle();

const { promisify } = require("util");
const redis = require("redis");
const client = redis.createClient({
  port: 13274,
  host: "redis-13274.c60.us-west-1-2.ec2.cloud.redislabs.com",
  password: process.env.REDIS_PWD
});

client.on("error", function(err) {
  console.log("error event - " + client.host + ":" + client.port + " - " + err);
});

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

module.exports = {
  set: (key, value) => {
    return setAsync(key, value);
  },
  get: key => {
    return getAsync(key);
  }
};
