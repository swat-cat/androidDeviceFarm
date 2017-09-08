'use strict';
(function() {
    angular.module('app').factory('Api', ['$resource', function($resource){
        return {
            Projects: $resource('/api/projects/:id', null, {
                'update': { method:'PUT' }
            }),
            Task: $resource('/api/task',null,{
                'update': { method:'PUT' },
                'query': { method: 'GET', isArray: false}
            }),
            StartTask:$resource('/api/startTask')
        };
    }]);
})();
