let appName = 'module.authentication';

let module = angular.module(appName,['satellizer']);

import authenticationCtrl from './controllers/authenticationCtrl.js';

module.controller("authenticationCtrl",authenticationCtrl);

export default appName;
