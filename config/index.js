
const Configstore = require('configstore');
const pkg = require('../package.json');

const conf = new Configstore(pkg.name);

  conf.set('user','mermakov');
  conf.set('pwd','qwerty');
  conf.set('taskTime',19);
  conf.set('taskActive',false);
  conf.set('allSet',true);
  conf.set('running',false);
  conf.set("sdk_path",'/Users/admin/Library/Android/sdk');


module.exports = {
  dbConnectionString : function(){
    return `mongodb://${conf.get('user')}:${conf.get('pwd')}@ds111754.mlab.com:11754/projects`;
  },

  scheduledTime : conf.get('taskTime')
};