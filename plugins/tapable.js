import { SyncHook, AsyncParallelHook } from "tapable";
class List {
  getRoutes() {
    console.log("class function")
  }
}

class Car {
  constructor() {
    this.hooks = {
      // 同步
      accelerate: new SyncHook(["newSpeed"]),
      brake: new SyncHook(),
      calculateRoutes: new AsyncParallelHook([
        "source",
        "target",
        "routesList",
      ]),
    };
  }
  // 同步
  setSpeed(speed) {
    this.hooks.accelerate.call(speed);
  }
  useNavigationSystemPromise(source, target) {
    const routesList = new List();
    return this.hooks.calculateRoutes
      .promise(source, target, routesList)
      .then((res) => {
        // 最后执行回调
        return routesList.getRoutes();
      });
  }
}

// 1 注册事件
const car = new Car();
car.hooks.accelerate.tap("test 1", (speed) => {
  console.log("同步 accelerate", speed);
});

// 异步注册
car.hooks.calculateRoutes.tapPromise("test promise", (source, target) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("异步 calculateRoutes", source, target);
    });
    resolve();
  });
});
// 2 触发事件
car.setSpeed(1111111111);
car.useNavigationSystemPromise([1, 2, 3], 4);
