'use strict';
(function() {
    const controller = function($scope, Api) {
        $scope.editing = [];
        $scope.projects = Api.Projects.query();

        $scope.save = function(){
            if(!$scope.newProject || $scope.newProject.length < 1) return;
            if(!$scope.newProjectRepo || $scope.newProjectRepo.length < 1) return;
            console.log('save name: '+$scope.newProject);
            console.log('save repo: '+$scope.newProjectRepo);
            let project = new Api.Projects(
                {
                    projectName: $scope.newProject,
                    repoUrl: $scope.newProjectRepo,
                    active: true
                }
            );
            console.log(project);
            project.$save(function(projectResponse){
                console.log(projectResponse);
                $scope.projects.push(projectResponse);
                $scope.newProject = ''; // clear textbox
                $scope.newProjectRepo = '';
            });
        };

        $scope.edit = function(index){
            $scope.editing[index] = angular.copy($scope.projects[index]);
        };

        $scope.cancel = function(index){
            $scope.projects[index] = angular.copy($scope.editing[index]);
            $scope.editing[index] = false;
        };

        $scope.update = function(index){
            let project = $scope.projects[index];
            Api.Projects.update({id: project._id}, project);
            $scope.editing[index] = false;
        };

        $scope.remove = function(index){
            let project = $scope.projects[index];
            Api.Projects.remove({id: project._id}, function(){
                $scope.projects.splice(index, 1);
            });
        }
    };

    angular
        .module('app')
        .controller('ProjectsController', [
            '$scope',
            'Api',
            controller
        ]);
})();
