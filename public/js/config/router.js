'use strict';
(function() {
    angular.module('app')
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: '/projects.html',
                    controller: 'ProjectsController'
                })

                .when('/:id', {
                    templateUrl:"/projectDetails.html",
                    controller: 'ProjectDetailCtrl'
                }).

            when('/task',{
                controller: 'TaskController'
            }).

            when('/startTask',{
                controller: 'TaskController'
            })
        }]);
})();
