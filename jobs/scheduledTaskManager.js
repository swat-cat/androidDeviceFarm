'use strict';

let cron = require('node-cron');
let Configstore = require('configstore');
let pkg = require('../package.json');
let farm = require('farmManager.js');

let conf = new Configstore(pkg.name);

let job;
module.exports = {
    startJob:()=>{
      let time = conf.get('taskTime');
      console.log(time);
      job = cron.schedule('* * '+time+' * *', function(){
          conf.set('running',true);
          farm();
          conf.set('running',false);
      });
      },
      stopJob:()=>{
        job.destroy();
      }
};