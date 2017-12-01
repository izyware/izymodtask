
var modtask = {};

modtask.extractConfigFromCmdLine = function() {
  var config = null;
  var prop = false;

  var params = ['node', 'cli.js'];
  params.push('method');

  var cmdParams;

  if (__izywareEmbeddedObject.params) {
    cmdParams = __izywareEmbeddedObject.params;
    //  cmdParams.shift();
    for(i=0; i < cmdParams.length; ++i)
      params.push(cmdParams[i]);
  } else {
    cmdParams = process.argv[2].split('__SLSH__');
    cmdParams.shift();
    cmdParams.shift();
    var i;
    for(i=0; i < cmdParams.length; ++i)
      params.push(cmdParams[i].split('=')[1]);
  }

  params.forEach(function (val, index, array) {
    if (index < 2) return;
    if (!config) {
      config = {};
      prop = null;
    }
    if (!prop) {
      prop = val;
    } else {
      config[prop] = val;
      prop = null;
    }
  });

  config = modtask.flatToJSON(config);
  return config;
}

// convert x.y.z to x: { y: { z ...
modtask.flatToJSON = function(obj) {
  var p;
  var ret = {};
  var tokens ;
  for(p in obj) {
    if (p.indexOf('.') == -1) {
      ret[p] = obj[p];
      continue;
    }
    tokens = p.split('.');
    var j, dest = ret, token;
    for(j=0; j < tokens.length - 1; ++j) {
      token = tokens[j];
      if (!dest[token]) {
        dest[token] = {};
      }
      dest = dest[token];
    }
    dest[tokens[j]] = obj[p];
  }
  return ret;
}


modtask.get_ljs_path = function() {
  return __dirname + '/ljs.js';
}

modtask.getRootModule = function() {
  var mod = modtask.getKernel().rootModule.usermodule;
  mod.setupSystem();
  return mod;
}

modtask.getKernel = function() {
  var fs = require('fs');
  var __izywareEmbeddedObject = fs.readFileSync(modtask.get_ljs_path());
  process.argv.shift();
  process.argv.shift();
  process.argv.shift();
  __izywareEmbeddedObject = 'var __izywareEmbeddedObject = { params: ' +  JSON.stringify(process.argv)  + '}; ' + __izywareEmbeddedObject;
  __izywareEmbeddedObject += `; 
    onSystemStart({'overridehostingmodule' : 'host\\\\nodejs\\\\base', 'platobject' : process });
  `;
  eval(__izywareEmbeddedObject);
  return Kernel;
}

modtask.runCmd = function(_cmd) {
  var runConsoleCmd = function(cmd) {
    var Kernel = modtask.getKernel();
    var cmdline = 'scriptpath=' + modtask.get_ljs_path() + '__SLSH__param0=' + cmd + '__SLSH__param1=__SLSH__param2=__SLSH__param3=__SLSH__param4=__SLSH__param5=__SLSH__param6=__SLSH__param7=__SLSH__param8=__SLSH__param9=';
    Kernel.rootModule.externalCall({'fn': Kernel.rootModule.usermodule.onCommandLine, 'p' : cmdline});
  }
  runConsoleCmd(_cmd ? _cmd : 'sysview');
}

module.exports = modtask;
