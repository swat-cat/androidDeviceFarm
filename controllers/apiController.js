var projectsRepo = require('../repositories/projectRepo');
var bodyParser = require('body-parser');
const Configstore = require('configstore');
const pkg = require('../package.json');
let conf = new Configstore(pkg.name);

module.exports = function(app){
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended:true}));

    //init db
    app.get('/api/initprojects',function(req,res){
        projectsRepo.init((result)=>{
            console.log(result);
            res.send(result);
        });
    });

    //projects
    app.get('/api/projects',function(req,res){
        projectsRepo.projectsList((projects)=>{
            res.json(projects);
        });
    });

    app.get('/api/projects/:id',function(req,res){
        projectsRepo.projectById(req.params.id,(project)=>{
            res.json(project);
        });
    });

    app.post('/api/projects',function(req,res){
        projectsRepo.addNewProject(req.body,(result)=>{
            res.json(result);
        });
    });

    app.put('/api/projects/:id',function(req,res){
        projectsRepo.updateProjectById(req.params.id, req.body,(result)=>{
            res.json(result);
        });
    });

    app.delete('/api/projects/:id',function(req,res){
        projectsRepo.deleteProjectById(req.params.id,(result)=>{
            res.send(result);
        });
    });

    //jobs
    app.get('/api/task',function(req,res){
        var time = conf.get('taskTime');
        var active = conf.get('taskActive');
        console.log({
            taskTime:time,
            taskActive:active
        });
        res.json({
            taskTime:time,
            taskActive:active
        });
    });

    app.put('/api/task',function(req,res){
        var time = req.body.taskTime;
        if(taskTime<1 && taskTime>23) return;
        conf.set("taskTime",req.body.taskTime);
        conf.set('taskActive',req.body.taskActive);
        res.sendStatus(200);
    });
};