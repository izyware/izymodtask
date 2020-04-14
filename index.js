
var modtask = {};

modtask.relRequire = function(modname) {
  var currentPath = modtask.__modtask.__loadObject2Path || '';
  currentPath = currentPath.split('/');
  var fullpath = '';
  var i;
  for(i=0; i < currentPath.length - 1; ++i) {
    fullpath += currentPath[i] + '/';
  }
  fullpath += modname;
  return require(fullpath);
}

modtask.extractConfigFromCmdLine = function(params) {
  var config = null;
  var prop = false;

  if (!params) {
    params = ['node', 'cli.js'];
    params.push('method');
    var cmdParams;
    if (__izywareEmbeddedObject.params) {
      cmdParams = __izywareEmbeddedObject.params;
      //  cmdParams.shift();
      for (i = 0; i < cmdParams.length; ++i)
        params.push(cmdParams[i]);
    } else {
      cmdParams = process.argv[2].split('__SLSH__');
      cmdParams.shift();
      cmdParams.shift();
      var i;
      for (i = 0; i < cmdParams.length; ++i)
        params.push(cmdParams[i].split('=')[1]);
    }
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
  var outcome = modtask.expandStringEncodedConfigValues(config);
  outcome.data = config;
  return outcome;
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

modtask.expandStringEncodedConfigValues = function(config, outcome) {
  if (!outcome) outcome = {};
  var p;
  for(p in config) {
    switch(typeof(config[p])) {
      case 'string':
        var token = 'json:';
        if (config[p].indexOf(token) == 0) {
          try {
            config[p] = JSON.parse(config[p].substr(token.length, config[p].length - token.length));
          } catch(e) {
            outcome.success = false;
            outcome.reason = 'cannot parse ' + config[p] + ': ' + e.message;
            return outcome;
          }
        }
        break;
      case 'object':
        modtask.expandStringEncodedConfigValues(config[p], outcome);
        if (!outcome.success) return outcome;
        break;
    }
  }
  outcome.success = true;
  return outcome;
}

modtask.get_ljs_path = function() {
  return __dirname + '/ljs.js';
}

modtask.getRootModule = function(dir, __moduleSearchPaths) {
  var props = {};
  if (!dir) dir = __dirname;
  props.__contextualName = dir + '/__contextualName_for_Root';
  props.__rootPathForAnchorDirectory = modtask.get_ljs_path();
  if (!__moduleSearchPaths)
    __moduleSearchPaths = [];

  __moduleSearchPaths.push(dir + '/');
  props.__moduleSearchPaths = __moduleSearchPaths;
  var mod = modtask.getKernel().rootModule.usermodule;
  for(var p in props) {
    mod[p] = props[p];
  }
  return mod;
}

modtask.getKernel = function() {
  var path = modtask.get_ljs_path();
  if (require.cache && require.resolve)
    delete require.cache[require.resolve(path)];
  return require(path);
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
