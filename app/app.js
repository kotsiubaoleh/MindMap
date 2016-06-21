let appName = "mindMapApp";

import directives from "./modules/directives/directives.js"
import mindMap from "./modules/mindMap/mindMap.js"
import authentication from './modules/authentication/authentication.js'

angular.module(appName,[directives, mindMap, authentication])

export default appName;