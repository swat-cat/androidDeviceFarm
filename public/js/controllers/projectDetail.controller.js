'use strict';
(function() {
    const controller = function ($scope, $routeParams, Api, $location) {
        $scope.project =Api.Projects.get({id: $routeParams.id });

        $scope.remove = function(){
            Api.Projects.remove({id: $scope.project._id}, function(){
                $location.url('/');
            });
        }
    };

    angular
        .module('app')
        .controller('ProjectDetailCtrl', [
            '$scope',
            '$routeParams',
            'Api',
            '$location',
            controller
            ]);
})();
