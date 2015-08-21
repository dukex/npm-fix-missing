var expect = require('chai').expect,
    exec = require('child_process').exec,
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    npmUpdate = require('../index.js');

var test_dependency = { "express": "4.10.0", "fs-extra": "^0.22.0"  },
    fake_package_json = {
  "name": "npm-update-test",
  "version": "0.0.0",
  "dependencies": test_dependency
},
    working_dir = process.cwd() + "/.tmp",
    missing_mods = [];

describe('npm update', function(){
  this.timeout(10000);
  before(function(done){
    mkdirp(working_dir, function(err){
      if (err) throw err;
      try {
        process.chdir(working_dir);
        fs.writeFile(working_dir + '/package.json', JSON.stringify(fake_package_json, null, 2), function(err){
          if (err) throw err;
          exec('rm -rf ' + working_dir + '/node_modules', function(err, result){
            if (err) throw err;
            npmUpdate.init(done);
          });
        });
      }
      catch (err) {
        console.log('chdir: ' + err);
      }
    });
  });

  after(function(done){
    exec('rm -rf ' + working_dir, function(err, result){
      if(err) throw err;
      done();
    });
  });

  describe('#missing()', function(){
    it('returns the list of the missing modules', function(done){
      npmUpdate.missing(process.cwd()).then(function(data) {
        expect(data.length).to.eql(2);
        expect(data).to.deep.equal([{package: 'express', current: undefined, wanted: '4.10.0', latest: '4.13.3'},{current: undefined, latest: "0.23.1", package: "fs-extra", wanted: "0.22.1"}])
        done()
      }).catch(function(err) {
        done(err);
      });
    });
  });

  describe('#installModule', function(){
    it('installs dependencies', function(done){
      npmUpdate.installMissing().then(function(data) {
        result = JSON.stringify(data[0])
        expect(result).to.include('express@4.10.0');
        expect(result).to.include('fs-extra@0.22.1');
        done();
       });
     });

    it('updates dependencies', function(done){
      npmUpdate.installMissing(true).then(function(data) {
        result = JSON.stringify(data[0])
        expect(result).to.include('express@4.13.3');
        done();
       });
     });
  });
});
