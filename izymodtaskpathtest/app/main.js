var root = require('/plat/p/izymodtask/index.js').getRootModule(__dirname);
console.log('CD', __dirname);

try {
  var paths = {
    'rel:appdep': root.ldmod,
    './appdep': root.ldmod,
    'rel:../thirdpartylib/mod': root.ldmod,
    '/tmp/izymodtaskpathtest/thirdpartylib/mod': root.ldmod,
    'izymodtaskpathtest/thirdpartylib/mod': root.ldmod
  };
  var props = ['__loadObject2Path', '__myname'];
  var p;
  for(p in paths) {
    console.log('------ Testing ' + p);
    var mod = paths[p](p);
    for (q=0; q < props.length; ++q) {
      console.log(props[q], mod[props[q]]);
    }
    mod(mod.__loadObject2Path);
    console.log('^^^^^^^^^^^^^^^^^^^^^')
  }
  // mod.testMore();
} catch(e) {
  console.log(e);
}
