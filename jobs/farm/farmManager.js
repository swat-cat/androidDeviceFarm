
var adb = require('adbkit');
var client = adb.createClient();
var projectsRepo = require('../../repositories/projectRepo');
var cmd = require('node-cmd');
var fs = require('fs');
var Iterator = require('es6-iterator');
let Configstore = require('configstore');
let pkg = require('../../package.json');
var path = require('path');

let conf = new Configstore(pkg.name);
let projectsDir = path.join(__dirname, 'projects/');
let sdk_path = conf.get('sdk_path');

var run = function(callback){
    let report = '';
    projectsRepo.projectsList((projects)=>{
        let iter = new Iterator(projects);
        start(iter,callback,report);
    });
}


var start = function (iter,callback,report) {
    
    let item = iter.next();
    if(item.done){
        report+="No more item";
        callback(report);
        return;
    }
    let project = item.value;
    report+=project+'\n';
    report+=projectsDir+'\n';
    console.log(project);
    console.log(projectsDir);
    fs.exists(projectsDir+project.projectName,(exists)=>{
        if (exists) {
            pullProject(project,iter,report,callback);
        }
        else{
            cloneProject(project,iter,report,callback);
        }
    })
}


var pullProject = function (project,iter,report,callback){
    cmd.get(
    `
      cd ${projectsDir+project.projectName}
      git pull origin develop
      cd ${project.projectName}
      ls
      `
        ,
        function(err, data, stderr){
            if (!err) {
                report+='the cmd pulled dir contains these files :\n\n',data+'\n';
                console.log('the cmd pulled dir contains these files :\n\n',data)
                fs.writeFileSync(projectsDir+project.projectName+'/local.properties',
                    'sdk.dir='+sdk_path,'utf-8');
                buildApk(project,iter,report);
            } else {
                report+='error', err+'\n';
                console.log('error', err)
                start(iter,callback,report);
            }
        });
}

var cloneProject = function (project,iter,report,callback){
    cmd.get(
        `
        cd ${projectsDir}
        git clone ${project.repoUrl}
        cd ${project.projectName}
        ls
        `,
        function(err, data, stderr){
            if (!err) {
                report+='the cmd cloned dir contains these files :\n\n'+data+'\n';
                console.log('the cmd cloned dir contains these files :\n\n',data);
                fs.writeFileSync(projectsDir+project.projectName+'/local.properties',
                    'sdk.dir='+conf.get('sdk_path'),'utf-8');
                buildApk(project,iter,report,callback);
            } else {
                report+='error', err+'\n';
                console.log('error', err)
                start(iter);
            }

        }
    );
}

var buildApk = function (project,iter,report,callback){
 cmd.get(
` cd ${projectsDir+project.projectName}
  ls
  gradle wrapper
  gradle app:assembleDevDebug
`,
        function(err, data, stderr){
            if (!err) {
                report+='the cmd build app these files :\n\n'+data+'\n';
                console.log('the cmd build app these files :\n\n',data)
            } else {
                report+='error '+ err+'\n';
                console.log('error', err);
            }
            start(iter,callback,report);
        }
    );
}



module.exports =  {
    run:run,
    start:start,
    pullProject:pullProject,
    pullProject:pullProject,
    buildApk:buildApk
};

/*
function getApk(projectName) {

}

function installBuildToDevices() {

}

client.listDevices()
  .then(function(devices) {
    return Promise.map(devices, function(device) {
        console.log(device.id)
      return client.install(device.id, apk)
    })
  })
  .then(function() {
    console.log('Installed %s on all connected devices', apk)
  })
  .catch(function(err) {
    console.error('Something went wrong:', err.stack)
  })
*/