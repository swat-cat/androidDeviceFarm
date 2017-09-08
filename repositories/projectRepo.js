var Project = require('../models/projectModel');

module.exports = {
    init:function(callback){
        var setupProject = [
            {
                projectName:"String",
                repoUrl:"String",
                active:false,
                appId:"String",
                workBranch:'String'
            },
            {
                projectName:"Test",
                repoUrl:"Test",
                active:false,
                appId:"String",
                workBranch:"String"
            }
        ];
        Project.create(setupProject,function(err,result){
            if(err) throw error;
            callback('Db successufully inited'+result);
        });
    },

    projectsList:function(callback){
        Project.find(function(err,projects){
            if(err)throw err;
            callback(projects);
        });
    },

    projectById:function(project_id,callback){
        Project.findById({_id:project_id},function(err,project){
            if(err)throw err;
            callback(project);
        });
    },

    deleteProjectById:function(project_id,callback){
        Project.findByIdAndRemove({_id:project_id},function(err){
            if(err)throw err;
            callback(!err);
        });
    },

    addNewProject:function(project,callback){
        var newProject = Project({
            projectName:project.projectName,
            repoUrl:project.repoUrl,
            active:project.active,
            appId:project.appId,
            workBranch:project.workBranch
        });

        newProject.save(newProject, callback, function(err,project){
            if(err)throw err;
            callback(project);
        });
    },

    updateProjectById:function(project_id, project, callback){
        Project.findByIdAndUpdate(project_id,project,(err,result)=>{
            if(err)throw err;
            callback(result);
        });
    }
};