let appName = "mindMapApp";

import directives from "./modules/directives/directives.js"
import mindMap from "./modules/mindMap/mindMap.js"

angular.module(appName,[directives, mindMap]);

export default appName;