let appName = "module.mindMap";

let module = angular.module(appName, []);

import mindMapCtrl from "./controllers/mindMapCtrl.js";

module.controller("mindMapCtrl", mindMapCtrl);

export default appName;