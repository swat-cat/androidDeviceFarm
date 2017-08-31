
let projectsRepo = require('../repositories/projectRepo');
let bodyParser = require('body-parser');
let jobManager = require('../jobs/scheduledTaskManager');
const Configstore = require('configstore');
const pkg = require('../package.json');
let conf = new Configstore(pkg.name);

module.exports = function(app){
    app.use(bodyParser.json());
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
        let time = conf.get('taskTime');
        let active = conf.get('taskActive');
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
        let time = req.body.taskTime;
        if(time<1 && time>23) return;
        conf.set("taskTime",req.body.taskTime);
        conf.set('taskActive',req.body.taskActive);
        res.sendStatus(200);
    });

    app.get('/api/startTask',function(req,res) {
        jobManager.startJob();
        res.send({});
    });
    
};