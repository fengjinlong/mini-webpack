export class ChangeOutputPath {
  apply(hooks) {
    // 注册
    hooks.emitFile.tap("changeOutputPath", (context) => {
      console.log(context)
      console.log("---------------------");
      context.setOutputPath('./dist/forPlugin/boundle.js')
    });
  }
}
