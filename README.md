# izymodtask
Node.js modtask component for Izyware.

## INSTALLATION

If you are using npm (the Node.js package manager) always ensure that your npm is up-to-date by running:

`npm update -g npm`  

Then use:

`npm install izymodtask`

## USING THE TOOL

This tool provides libraries for traditional modtask izyware apps. You may use the libraries by referencing the node_modules folder.

When integrating izyware modtask style components to native node runtime apps and you need to ldmod on a module, you can:

```

var mod = require('izymodtask').getRootModule().ldmod('path_to_module');

```

To see what the module resolution paths are for the context that you are using the code above, you can always use:

```

require('izymodtask').getRootModule().ldmod('s_root').cmdlineverbs.sysview();

```


If you need to launch cmdline based verbs from the node app, use the following syntax:

```

require('izymodtask').runCmd('sysview -- or your verb --')

```

When the verb is called inside the `g_handler` module, you can extract the command line config by:

```

modtask.cmdlineverbs.method = function() {
   var config = modtask.ldmod('izymodtask/index').extractConfigFromCmdLine('method');
	 ...

```

You can customize the izyware modtask search path by creating the following:

```

modtask/config/kernel/extstores/file.js

```

in the root of your node app.

## Path Resolution Use Cases for kernel/extstores/file

Note: Current Directory = CD, IzyModtask Directory = ID, Thirdparty Components Directory = TD

Consider the following setup

    CD = /tmp/curdir
    ID = /plat/p/izymodtask
    TD = /tmp/izymodtaskapp

    node TD/test.js

    rm -rf /tmp/izymodtaskpathtest;
    mkdir -p /tmp/izymodtaskpathtest/curdir;
    mkdir -p /tmp/izymodtaskpathtest/app;
    mkdir -p /tmp/izymodtaskpathtest/thirdpartylib;

    clear; cp -r /plat/p/izymodtask/izymodtaskpathtest/* /tmp/izymodtaskpathtest;cd /tmp/izymodtaskpathtest/curdir;node ../app/main.js


This is very a typical use case where a thirdparty app that uses izymodtask, is launched from a random location in the system. We will analyze the following scenarios:

### 1: getRootModule().ldmod('rel:appdep')
In this case, rel:... is relative to the rootModule which can vary depending on the platform (i.e. circus front-end will be bootstrap/version/., nodejs modtask will be izymodtask/.).

That is the reason why __contextualName was introduced in the later version to be able to 'position' the rootModule.

### 2: getRootModule().ldmod('./appdep')
should be the same as rel:appdep


### 3: getRootModule().ldmod('/appdep')
This will first use the absolute path to locate and load the module. If not found, then it will remove the begining slash and treat it as number 4 below. The fall back is crucial when reference packageless modules from chains, i.e.

    ['chain.importProcessor', ':test/assert/chain'],


### 4: getRootModule().ldmod('appdep')
will search using the iteratePathsToSearch and external resolver rules



## NOTE
for more details, visit https://izyware.com

# Change Log

# V5
* implement _modToPkgMap for kernel/path.toInvokeString
* implement expandStringEncodedConfigValues to allow passing complex JSON objects at commandline
* add stacktrace to module load errors
* added module loader customization feature
    * prior to this 'require' relative paths were broken and all requires would have to have used absolute paths.
    * add this to your module:

            /* izy-loadobject nodejs-require */
            ...
            module.exports = modtask;


* add a simple file look up for modnames that with '/' first before falling back to iteratePathsToSearch.
* add the __contextualName feature modules to allow customization of rel:.. path resolution
    * otherwise ldmod('rel:modname') or ldmod('./modname') would not work
* improve verbosity control
* fixed izymodtask so that it does not eval ljs in index.js.
* full payload customization and manual build for customized solutions.

        ./ldo.sh mship izymodtask/build;cp ../__build/payloads/build/izymodtask/entrypoint/ljs.js ../izymodtask/ljs.js;
        cp modtask/kernel/mod.js ../izymodtask/kernel;cp modtask/kernel/path.js ../izymodtask/kernel;

## < V5
* relrequire is now available
    * it will allow doing node style require using relative paths to the current izy module.
    * this will alleviate the paths and search problems that customers have reported in the past







