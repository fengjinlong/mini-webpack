## 1 获取文件内容
#### @babel/parser 生成 ast
#### @babel/traverse 解析 路劲
#### babel-core babel-preset-env 将esm 装换成 cjs
## 2 获取依赖关系
## 3 ast -> 抽象语法树
## 4 实现 boundle 
```js
// boundle.js 结构
function require(filePath) {
  const map = {
    "./foo.js": foojs,
    "./main.js": mainjs,
  };
  const fn = map[filePath];
  const module = {
    exports: {},
  };
  fn(require, module, module.exports);
  return module.exports
}
require("./main.js");

function mainjs(require, module, exports) {
  const {foo} = require("./foo.js");
  console.log('来自 main.js 文件')
  foo();
}
function foojs(require, module, exports) {
  function foo() {
    console.log('来自 foo 文件')
  }
  module.exports = {
    foo,
  };
}

```
## 5 根据图构建boundle
## 6 ejs 生成模板 fs 创建文件
## 7 ejs 动态数据
## requie(id) 解决文件路径不一致问题
```js
// 问题，生成后的代码，文件名格式不一致
(function (modules) {
  function require(filePath) {
    const fn = modules[filePath];
    const module = {
      exports: {},
    };
    fn(require, module, module.exports);
    return module.exports;
  }
  require("./main.js");
})({
  "./example/main.js": function (require, module, exports) {},
  "/Users/fjl/Documents/github/mini-webpack/example/foo.js": function (require, module, exports) {},
});

// 解决方案 目标代码
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
    function (require, module, exports) {},
    { "./foo.js": 2 },
  ],
  2: [
    function (require, module, exports) {},
    {},
  ],
});


```

## loader 匹配到相应的类型，执行指定的js，为了把js文件转换成js文件，交给 webpack 处理

## 插件原理是基于事件机制（钩子函数），webpack 执行过程中，派发事件。插件监听事件，处理参数