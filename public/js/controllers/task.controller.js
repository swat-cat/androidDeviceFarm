'use strict';
(function() {
    const controller = function ($scope, $routeParams, Api, $location) {
        $scope.task =Api.Task.query(function(res){
            console.log(res);
        });

        $scope.updateTask = function(){
            console.log("update task");
            Api.Task.update($scope.task);
        };

        $scope.startTask = function(){
            console.log("toggle task");
            Api.StartTask.query();
        }
    };

    angular
        .module('app')
        .controller('TaskController', [
            '$scope',
            '$routeParams',
            'Api',
            '$location',
            controller
        ]);
})();
