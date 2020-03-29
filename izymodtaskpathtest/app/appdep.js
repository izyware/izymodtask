
/* izy-loadobject nodejs-require */
var modtask = function(expectedPath) {
  var props = ['modtask.__myname', 'expectedPath', '__dirname'];
  console.log('************** module ***************');
  for(var i=0; i < props.length; ++i) {
    console.log(props[i], eval(props[i]));
  }
  console.log('selfrequire should work for izy-loadobject nodejs-require modules');
  require('./appdep');
}

module.exports = modtask;
