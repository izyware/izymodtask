
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
		path = path + "";
		path = path.replace(/[A-Za-z0-9]+\\\.\.\\/g, ""); 
		return path; 
	},		

	rel : function(rp, modulename) {

		if (!modulename) modulename = modtask.__modtask.__myname;

		var slashbased = (rp.indexOf('/') > 0 || modulename.indexOf('/') > 0);
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

   resolve : function(modulename, depname) {
      if (depname == "_data") {
         depname = modtask.rel("data", modulename); 
      }
      else if (depname.indexOf("rel:") == 0) {
         depname = modtask.rel(depname.substr(4, depname.length-4), modulename);
      }
	   return depname;
   }     
}

modtask.parseInvokeString = function(path) {
	var pkg = path.split(':');
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

