// const Receptacle = require("receptacle");

// const cache = new Receptacle();

const cache = new Map();
const name = Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, "")
  .substr(0, 8);

module.exports = {
  getSize: () => {
    console.log(`>>cache_size:${name}`, cache.size);
  },
  set: (key, value) => {
    cache.set(key, value);
    // cache.set(key, value, { ttl: 1800000, refresh: true });
  },
  get: key => cache.get(key),
  has: key => cache.has(key)
};
