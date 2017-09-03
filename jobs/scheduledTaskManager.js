

let schedule = require('node-schedule');
let Configstore = require('configstore');
let pkg = require('../package.json');
var farm = require('./farm/farmManager');

let conf = new Configstore(pkg.name);

let job;
module.exports = {
    startJob:()=>{
      let time = conf.get('taskTime');
      console.log(time);
      job = schedule.scheduleJob('30 '+time+' * * *', function(){
          farm.run(function(report){
            console.log('\n\n\nReport\n\n\n');
            //console.log(report);
        });
      });
      },
      stopJob:()=>{
        job.cancel();;
      }
};