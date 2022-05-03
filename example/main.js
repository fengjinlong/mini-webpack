import { foo } from "./foo.js";
import { bar } from "./bar.js";
import json from './user.json'
console.log("来自 main.js 文件");
foo();
bar('main 里面执行 bar');
console.log(json)
