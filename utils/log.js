
const name = Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, "")
  .substr(0, 8);

module.exports = function() {
    console.log.apply(this, [`>> ${name}:`, ...arguments]);
}

module.exports.prefix = name;
