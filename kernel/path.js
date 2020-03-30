
var modtask = 
{
	up : "..\\",
	get : function(fp, depth) {
		var ret = "", i=0;
		var tmp = fp.split("\\");
		if (tmp.length - depth < 0)
		{
			for(i=0; i > tmp.length - depth; --i)
				ret += modtask.up; 
		}
		else 
		{
			for(i=0; i < tmp.length - depth; ++i)
				ret += tmp[i] + "\\";
		}
		return ret; 
	},

	parse : function(path) {
		return modtask.normalize(path);
	},

	normalize : function(path) {
		path = path + '';
		var slashbased = path.indexOf('/') >= 0;
		if (slashbased) {
			path = path.replace(/\//g, '\\');
		}
		path = path.replace(/[A-Za-z0-9-]+\\\.\.\\/g, '');
		if (slashbased) {
			path = path.replace(/\\/g, '/');
		}
		return path; 
	},		

	rel : function(rp, modulenameOrMod, useModuleContextForPath) {
		var modulename = modulenameOrMod;
		if (useModuleContextForPath) {
			if (modulenameOrMod.__contextualName) {
				modulename = modulenameOrMod.__contextualName;
			} else {
				modulename = modulenameOrMod.__myname;
			}
		}

		if (!modulename) modulename = modtask.__modtask.__myname;
		
		var slashbased = (rp.indexOf('/') >= 0 || modulename.indexOf('/') >= 0);
		rp = rp.replace(/\//g, "\\"); 
		modulename = (modulename+"").replace(/\//g, "\\"); 
 
 		var depth = 1;
		while(rp.indexOf(modtask.up) == 0) {
			rp = rp.substr(modtask.up.length, rp.length - modtask.up.length);
			depth++;
		} 
		var base = modtask.get(modulename, depth); 
		base = base + rp; 
		base = base.replace(/\//g, "\\"); 
	  base = modtask.parse(base);
		if (slashbased) {
			base = base.replace(/\\/g, '/');
		}
		return base;
   },

   resolve : function(modulenameOrMod, depname, useModuleContextForPath) {
      if (depname == "_data") {
         depname = modtask.rel("data", modulenameOrMod);
      }
      else if (depname.indexOf("rel:") == 0) {
         depname = modtask.rel(depname.substr(4, depname.length-4),
	         modulenameOrMod,
	         useModuleContextForPath);
      }
	   return depname;
   }     
}

modtask.parseInvokeString = function(path) {
	var pkg = '';
	if (path.indexOf(':') >= 0) {
		pkg = path.split(':');
	};
	var mod, params = '';
	if (pkg.length) {
		mod = pkg[0] + '/' + pkg[1];
		pkg = pkg[0];
		params = path.substr(mod.length+1);
	} else {
		pkg = '';
		mod = path;
		params = '';
	}
	return { path: path, pkg: pkg, mod: mod, params: params };
}

modtask.toInvokeString = function(path, _modToPkgMap) {
	if (!path) path = modtask.__modtask.__myname;
	if (path.indexOf("rel:") == 0) path = modtask.rel(path.substr(4, path.length-4));
	// already in the pkg:view/top format
	if (path.indexOf(':') > 0) {
		return {
			success: true,
			data: path
		};
	}

	var maps = [
		modtask.ldmod('kernel/mod').ldonce('kernel/extstores/import').modToPkgMap,
		_modToPkgMap
	];

	for (var q in maps) {
		try {
			var map = maps[q] || {};
			var p;
			for (p in map) {
				if (p == path || p.replace(/:/g) == path) {
					var pkg = map[p];
					path = path.substr(pkg.length + 1);
					path = pkg + ':' + path;
					return {
						success: true,
						data: path
					}
				}
			}
		} catch (e) {
			return {
				success: false,
				reason: 'There was an error using kernel/extstores/import modToPkgMap. Make sure kernerl/extstores/import is available.'
			};
		}
	}
	return {
		success: false,
		reason: '[toInvokeString] Cannot determine package name for "' + path + '" automatically.'
	};
}

