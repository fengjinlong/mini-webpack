(function (modules) {
  function require(id) {
    const [fn, mapping] = modules[id];
    const module = {
      exports: {},
    };
    function localRequire(filePath) {
      const id = mapping[filePath];
      return require(id);
    }
    fn(localRequire, module, module.exports);
    return module.exports;
  }
  require(1);
})({
  1: [
    function (localRequire, module, exports) {
      const { foo } = localRequire("./foo.js");
      console.log("来自 main.js 文件");
      foo();
    },
    { "./foo.js": 2 },
  ],
  2: [
    function (localRequire, module, exports) {
      function foo() {
        console.log("来自 foo 文件");
      }
      module.exports = {
        foo,
      };
    },
    {},
  ],
});
