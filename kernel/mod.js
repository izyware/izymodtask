
var modtask = 
{
	ldni : function(modname)
	{
 		return Minicore.loadModuleInModtask(modtask.__modtask, modname, false, false, true);
 	},

	ldonce : function(modname)
	{
 		if (!Kernel["__loadedmods"]) Kernel["__loadedmods"] = {};
		if (!Kernel["__loadedmods"][modname])
			Kernel["__loadedmods"][modname] = modtask.__modtask.ldmod(modname);
		return Kernel["__loadedmods"][modname];
	},

	verifyProp : function(pn, typ) 
	{
		return modtask.vp(pn, typ);
	},

	vp : function(pn, typ, mod, nam, nomod) 
	{
		var tmptyp;
		if (nomod)
			tmptyp = typeof(mod);
		else 
		{
			if (!mod) mod = modtask.__modtask; 
			if (!nam) nam = mod.__myname; 
			tmptyp = typeof(mod[pn]); 
		}
		if (tmptyp != typ) modtask.Fail("'" + nam + "'['" + pn + "'] failed. expected " + typ + ", but is " + tmptyp, modtask);
		return modtask;	
	},

	inh : function(prop)
	{
		var par =  modtask.__modtask.__modtask;
		if (typeof(par[prop]) == "undefined") modtask.Fail(modtask.__modtask.__myname + " could not inherit property '" + prop + "' from '" + par.__myname + "'", modtask);
		modtask.__modtask[prop] = par[prop]; 
		return modtask;
	}		
}
