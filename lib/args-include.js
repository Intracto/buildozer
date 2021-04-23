module.exports = function (list) {
  let value = false;
  for (const item of list) {
    if (process.argv.includes(item)) {
      value = true;
    }
  }

  return value;
};
