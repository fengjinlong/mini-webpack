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
  require(0);
})({
  
    "0": [function (require, module, exports) {
      "use strict";

var _foo = require("./foo.js");

var _bar = require("./bar.js");

var _user = require("./user.json");

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log("来自 main.js 文件");
(0, _foo.foo)();
(0, _bar.bar)('main 里面执行 bar');
console.log(_user2.default); 
     }, {"./foo.js":1,"./bar.js":2,"./user.json":3}],
  
    "1": [function (require, module, exports) {
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.foo = foo;

var _bar = require("./bar.js");

function foo() {
  console.log('来自foo 文件');
}

(0, _bar.bar)('foo 里面执行 bar'); 
     }, {"./bar.js":4}],
  
    "2": [function (require, module, exports) {
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bar = bar;

function bar(str) {
  console.log(str);
} 
     }, {}],
  
    "3": [function (require, module, exports) {
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "{\"username\":\"fjl\",\"age\":18,\"work\":\"farmer\"}"; 
     }, {}],
  
    "4": [function (require, module, exports) {
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bar = bar;

function bar(str) {
  console.log(str);
} 
     }, {}],
  
});
