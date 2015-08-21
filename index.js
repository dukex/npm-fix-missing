var Promise = require('bluebird');
var npm = require('npm')

var commands = npm.commands;

Promise.promisifyAll(npm);

function NpmUpdate(options) {
  options = options || {};
};

NpmUpdate.loaded = false;

NpmUpdate.init = function(fn) {
  return NpmUpdate._load().then(fn);
}

NpmUpdate._load = function() {
  var load = npm.loadAsync().then(function(err) {
    NpmUpdate.loaded = true;
  });

  return NpmUpdate.loaded ? Promise.resolve() : load
}

NpmUpdate.missing = function() {
  return NpmUpdate._load().then(function() {
    var outdated = Promise.promisify(commands.outdated);
    return outdated();
  }).then(function(data, err) {
    if (err) throw err;
    var missing = [];
    data.forEach(function(module){
      missing.push({
        package: module[1],
        current: module[2],
        wanted: module[3],
        latest: module[4]
      });
    });
    return missing;
  });
};


NpmUpdate.installMissing = function(forceUpdate) {
  return NpmUpdate.missing().then(function(modules) {
    var install = Promise.promisify(commands.install);
    modulesInstall = []
    modules.forEach(function(module) {
      var wanted = forceUpdate ? module.latest : module.wanted;
      if(wanted !== 'git' && wanted != module.current) {
        modulesInstall.push(module.package + '@' + wanted);
      }
    });

    if (modulesInstall.length > 0) {
      console.log("Installing " + modulesInstall.join(","))
      return install(modulesInstall);
    } else if (modules.length > 0) {
      console.log("Always OK! To force update use -f")
    } else {
      console.log("Always OK!")
    }
  });
}

exports = module.exports = NpmUpdate;
