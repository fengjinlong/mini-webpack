import fs from "fs";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import { transformFromAst } from "babel-core";
import ejs from "ejs";
import path from "path";
let id = 0;
function createAsset(filePath) {
  // 1 获取文件内容
  // 2 获取依赖关系
  // ast -> 抽象语法树

  const source = fs.readFileSync(filePath, {
    encoding: "utf-8",
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
  fs.writeFileSync("./dist/bounle.js", code);
  // console.log(code);
}
build(graph);
