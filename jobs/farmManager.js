;

let adb = require('adbkit');
let client = adb.createClient();
let projectsRepo = require('../repositories/projectRepo');
let cmd = require('node-cmd');
let fs = require('fs');



module.exports = function () {
    projectsRepo.projectsList((projects)=>{
        let iter = Iterator(projects);
        start(iter.next());
    });

    function start(project) {
        fs.exists('../projects/'+project.projectName,(exists)=>{
            if (exists) {
                pullProject(project);
            }
            else{
                cloneProject(project);
            }
        })
    }


    function pullProject(project){
        cmd.get(
            `
          cd ${projectsDir+project.name}
          git pull origin ${project.branch}
          cd ${project.name}
          ls
          `
            ,
            function(err, data, stderr){
                if (!err) {
                    fs.writeFileSync(projectsDir+project.name+'/local.properties',
                        'sdk.dir='+projectsList.sdk_path,'utf-8');
                    console.log('the cmd pulled dir contains these files :\n\n',data)
                    buildApk(project);
                } else {
                    console.log('error', err)
                }
            });
    }

    function cloneProject(project){
        cmd.get(
            `
      cd ${projectsDir}
      git clone ${project.url}
      git checkout ${project.branch}
      cd ${project.name}
      ls
      `,
            function(err, data, stderr){
                if (!err) {
                    fs.writeFileSync(projectsDir+project.name+'/local.properties',
                        'sdk.dir='+projectsList.sdk_path,'utf-8');
                    console.log('the cmd cloned dir contains these files :\n\n',data)
                    buildApk(project);
                } else {
                    console.log('error', err)
                }

            }
        );
    }

    function buildApk(project){
        cmd.get(
            ` cd ${projectsDir+project.name}
      ls
      gradle wrapper
      gradle app:assembleDevDebug
    `,
            function(err, data, stderr){
                if (!err) {
                    console.log('the cmd build app these files :\n\n',data)
                    let newProject = iter.next();
                    if (newProject){
                        start(newProject);
                    }
                } else {
                    console.log('error', err);
                }
            }
        );
    }

    function getApk(projectName) {

    }

    function installBuildToDevices() {

    }
};

/*
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