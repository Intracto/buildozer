module.exports = function (list) {
  let value = false;
  list.forEach(item => {
    if (process.argv.includes(item)) {
      value = true;
    }
  });
  return value;
};
