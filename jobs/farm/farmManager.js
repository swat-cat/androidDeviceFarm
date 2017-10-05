var Promise = require('bluebird');
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
        console.log("Callback :"+callback);
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
      git pull origin ${project.workBranch}
      git checkout ${project.workBranch}
      cd ${project.projectName}
      ls
      `
        ,
        function(err, data, stderr){
            console.log("Callback :"+callback);
            if (!err) {
                report+='the cmd pulled dir contains these files :\n\n'+data+'\n';
                console.log('the cmd pulled dir contains these files :\n\n',data);
                fs.writeFileSync(projectsDir+project.projectName+'/local.properties',
                    'sdk.dir='+sdk_path,'utf-8');
                buildApk(project,iter,report,callback);
            } else {
                report+='error'+ err+'\n';
                console.log('error', err);
                start(iter,callback,report);
            }
        });
};

let cloneProject = function (project,iter,report,callback){
    cmd.get(
        `
        cd ${projectsDir}
        git clone ${project.repoUrl} ${project.projectName}
        git pull origin ${project.workBranch}
        git checkout ${project.workBranch}
        cd ${project.projectName}
        ls
        `,
        function(err, data, stderr){
            console.log("Callback :"+callback);
            if (!err) {
                report+='the cmd cloned dir contains these files :\n\n'+data+'\n';
                console.log('the cmd cloned dir contains these files :\n\n',data);
                try{
                    fs.writeFileSync(projectsDir+project.projectName+'/local.properties',
                    'sdk.dir='+conf.get('sdk_path'),'utf-8');
                }
                catch(err){
                    report+='error'+ err+'\n';
                    start(iter,callback,report);
                }
            
                buildApk(project,iter,report,callback);
            } else {
                report+='error'+ err+'\n';
                console.log('error', err);
                start(iter,callback,report);
            }

        }
    );
};

let buildApk = function (project,iter,report,callback){
 cmd.get(
` cd ${projectsDir+project.projectName}
  ls
  gradle wrapper
  gradle app:assembleDevDebug
`,
        function(err, data, stderr){
            console.log("Callback :"+callback);
            if (!err) {
                report+='the cmd build app these files :\n\n'+data+'\n';
                console.log('the cmd build app these files :\n\n',data);
                installBuildToDevices(getApk(project.projectName),iter,report,callback,project);
            } else {
                report+='error '+ err+'\n';
                console.log('error', err);
                start(iter,callback,report);
            }
        }
    );
};

let getApk=function getApk(projectName) {
    return path.join(projectsDir,projectName+'/app/build/outputs/apk/app-dev-debug.apk');
};

let installBuildToDevices = function (apk, iter, report, callback, project) {
    client.listDevices()
        .then(function (devices) {
            return Promise.map(devices, function (device) {
                console.log(device.id);
                report += 'Installing to device' + device.id;
                return {
                    isInstalled: client.isInstalled(device.id, project.appId),
                    device: device
                }
                // return client.install(device.id, apk);
            }).then(function (obj) {
                if(obj.isInstalled){
                    //TODO: delete application from device
                    report+='uninstalling project '+project.appId+' from device'+obj.device.id;
                    console.log('uninstalling project '+project.appId+' from device'+obj.device.id)
                    return new Promise(function(resolve){
                        //TODO: function to delete applicetion
                        cmd.get(
                            `
                            adb -s ${obj.device.id} uninstall ${project.appId}
                            `,
                            function(err, data, stderr){
                                console.log("Callback :"+callback);
                                if (!err) {
                                    report+='the cmd build app these files :\n\n'+data+'\n';
                                    console.log('the cmd build app these files :\n\n',data);
                                } else {
                                    report+='error '+ err+'\n';
                                    console.log('error', err);
                                    start(iter,callback,report);
                                }
                                resolve(obj)
                            }
                        );
                        
                    })
                }else{
                    return new Promise(function(resolve){
                        resolve(obj)
                    })
                }
            }).then(function(obj){
                return new Promise(function(resolve){
                    client.install(obj.device.id,apk).then(function(){
                        resolve(obj.device)
                    })
                }) 
            }).catch(function(err){
                report+='error '+ err+'\n';
                console.log('error', err);
            })
        })
        .then(function (devices) {
            console.log(devices);
            console.log("Callback :" + callback);
            console.log('Installed %s on all connected devices', apk);
            report += 'Installed %s on all connected devices';
            let deviceIterator = new Iterator(devices);
            let appIdCommand = `adb monkey -p ${project.appId} -v 500`;
            runMonkey(deviceIterator, appIdCommand, report, callback, project, iter);
        })
        .catch(function (err) {
            console.error('Something went wrong:', err.stack);
            report += 'Something went wrong:' + err.stack;
            start(iter, callback, report);
        });
};

let runMonkey = function (deviceIterator, appIdCommand, report, callback, project, iter){

        let itrValue = deviceIterator.next();
        if(!itrValue.done){
            console.warn(appIdCommand);
            let device = itrValue.value;
            cmd.get(
                `
                adb -s ${device.id} shell monkey --pct-touch 20 --pct-motion 20 --pct-nav 20 --pct-majornav 20 --pct-appswitch 10 --ignore-security-exceptions -p ${project.appId} --throttle 100 -v 1000 -s 1000
                `,
                function(err, data, stderr){
                    if (!err) {
                        report+='monkey started on device'+device.id+'\n';
                    } else {
                        report+='error '+ err+'\n';
                        console.log('error', err);
                    }
                    return runMonkey(deviceIterator, appIdCommand, report, callback, project, iter);
                }
            );
        }
        else{
            start(iter, callback, report);
        }
}

module.exports =  {
    run:run,
    start:start,
    pullProject:pullProject,
    cloneProject:cloneProject,
    buildApk:buildApk,
    installBuildToDevices:installBuildToDevices,
    getApk:getApk,
    runMonkey:runMonkey
};

