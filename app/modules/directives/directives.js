let appName  = "module.direcrives";

let module = angular.module(appName, []);

import mindMapDirective from "./directives/mindMapDirective.js";
import changeFileDirective from "./directives/changeFileDirective.js";

module.directive("mindMap", mindMapDirective);
module.directive("changeFile", changeFileDirective);

export default appName;