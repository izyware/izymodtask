// both usermodule (TOKEN_ROOTMODULE) and modtask/minicore.platform via TOKEN_HOSTINGMODULE
// see modtask/minicore.servicecallback for more details
// for usermodule reference see modtask/codegen/console/root.js

var modtask = function() {}

// Set from the index.js file
modtask.__contextualName = null;
modtask.__rootPathForAnchorDirectory = null;
modtask.__moduleSearchPaths = [];
modtask.verbose = {
  startup: false,
  setupSelectors: false,
  loadObject: false,
  objectExist: false,
  iterateStoreChain: false,
  getObjectPath: false,
  iteratePathsToSearch: false
};

if (modtask.verbose.startup) console.log('entrypoint');

/************** Kernel Interfaces ****************/
modtask.platform = null; // set by modtask/minicore.servicecallback
modtask.Log = function(x) {
  console.log(x);
}
modtask.Sleep = function() {
  console.log('Warning, sleep not supported in nodejs');
}
modtask.exceptionToString = function(e) {
  return e.message;
}
modtask.showUnhandledKernelExceptionMsg = function(txt) {
  console.log('showUnhandledKernelExceptionMsg: ', txt);
}
modtask.modspath = {};
/* ^^^^^^^^^^^^^ Kernel Interfaces ^^^^^^^^^^^^^*/


/************** usermodule Interfaces ****************/
modtask.servicecallback = function(evt) {
  if (modtask.verbose.startup) console.log('servicecallback');
  Kernel.verbose = modtask.verbose;
  if (Minicore.loadObjectOverwrite) {
    console.log('Selectors Already Setup');
  } else {
    // do it twice to force reload from the file system (if present)
    modtask.setupSelectors();
    modtask.setupSelectors();
  }
};

// getRootPathIfAny will tell the system where ljs.js is located at
// ITS a bad naming -- it is a Full File Path and that is why if non-empty, it should always end with /
// modtask/minicore will set Kernel.getRootPathIfAny to this
// kernel/extstores/file will use Kernel.getRootPathIfAny to calculate getAnchorDirectory (appends ./modtask to it)

modtask.getRootPathIfAny = function() {
  return modtask.__rootPathForAnchorDirectory;
}

// kernel/extstores/file uses this iteratePathsToSearch
modtask.getModuleSearchPaths = function() {
  return modtask.__moduleSearchPaths;
}

/* ^^^^^^^^^^^^^ usermodule Interfaces ^^^^^^^^^^^^^*/

modtask.setupSelectors = function() {
  if (modtask.verbose.setupSelectors) console.log('setupSelectors');
  var modsel = modtask.ldmod('kernel\\selectors');
  modsel.verbose = modtask.verbose;
  modsel.redirectStorage();
  modsel.addStoreChain('kernel\\extstores\\file', true, modtask.verbose);
}

modtask.__$d = ['kernel\\selectors', 'kernel\\extstores\\file', 'host\\nodejs\\file', 'host\\nodejs\\filecommon'];
