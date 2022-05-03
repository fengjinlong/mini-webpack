import fs from "fs";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import { transformFromAst } from "babel-core";
import ejs from "ejs";
import path from "path";
import { jsonLoader } from "./loaders/jsonLoader.js";
import { addWorkLoader } from "./loaders/addWorkLoader.js";
import { ChangeOutputPath } from "./plugins/ChangeOutputPath.js";
import { SyncHook } from "tapable";
let id = 0;
const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.json/,
        use: [jsonLoader, addWorkLoader],
      },
    ],
  },
  plugins: [new ChangeOutputPath()],
};

const hooks = {
  // 修改打包路径
  emitFile: new SyncHook(["context"]),
};
function createAsset(filePath) {
  // 1 获取文件内容
  // 2 获取依赖关系
  // ast -> 抽象语法树

  let source = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });
  // babel 转化之前进行 loader 处理，babel 只能处理 js 文件
  const loaders = webpackConfig.module.rules;
  const loaderContext = {
    addDeps(dep) {
      console.log("addDeps", dep);
    },
  };
  loaders.forEach(({ test, use }) => {
    if (test.test(filePath)) {
      if (Array.isArray(use)) {
        use.reverse();
        use.forEach((fn) => {
          source = fn.call(loaderContext, source);
        });
      }
    }
  });

  const ast = parser.parse(source, {
    sourceType: "module",
  });

  const deps = [];
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      deps.push(node.source.value);
    },
  });
  const { code } = transformFromAst(ast, null, {
    presets: ["env"],
  });
  return {
    id: id++,
    filePath,
    code,
    mapping: {},
    deps,
  };
  // { source: "import {foo} from './foo'\nfoo()", deps: [ './foo' ] }
}

// 构建图
function createGraph() {
  const mainAsset = createAsset("./example/main.js");
  // { source: "import {foo} from './foo'\nfoo()", deps: [ './foo' ] }
  const queue = [mainAsset];
  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      // console.log(relativePath) ./foo.js
      // console.log(path.resolve("./example", relativePath));
      const child = createAsset(path.resolve("./example", relativePath));
      asset.mapping[relativePath] = child.id;
      queue.push(child);
    });
  }
  return queue;
}

function initPlugins() {
  const plugins = webpackConfig.plugins;
  plugins.forEach((plugin) => {
    plugin.apply(hooks);
  });
}
initPlugins();
const graph = createGraph();
// console.log(graph);
// [
//   {
//     filePath: './example/main.js',
//     code: '"use strict";\n' +
//       '\n' +
//       'var _foo = require("./foo.js");\n' +
//       '\n' +
//       'console.log("来自 main.js 文件");\n' +
//       '(0, _foo.foo)();',
//     deps: [ './foo.js' ]
//   },
//   {
//     filePath: '/Users/fjl/Documents/github/mini-webpack/example/foo.js',
//     code: '"use strict";\n' +
//       '\n' +
//       'Object.defineProperty(exports, "__esModule", {\n' +
//       '  value: true\n' +
//       '});\n' +
//       'exports.foo = foo;\n' +
//       '\n' +
//       'function foo() {\n' +
//       "  console.log('来自 foo 文件');\n" +
//       '}',
//     deps: []
//   }
// ]
function build(graph) {
  const template = fs.readFileSync("./boundle.ejs", { encoding: "utf-8" });
  const data = graph.map((asset) => {
    const { id, code, mapping } = asset;
    return {
      id,
      code,
      mapping,
    };
  });
  const code = ejs.render(template, { data });

  // 调用
  let outputPath = "./dist/bounle.js";
  const context = {
    setOutputPath(path) {
      outputPath = path;
    },
  };
  hooks.emitFile.call(context);
  fs.writeFileSync(outputPath, code);
  // console.log(code);
}
build(graph);
