
var modtask = 
{
   token : false,
   addToQuery : function(aaObj, tunnelendpointid) {
      var token;
      if (tunnelendpointid) {
         token = tunnelendpointid;
      } else {
         token = modtask.ldmod("kernel\\mod").ldonce(modtask.__myname)["token"];
      }
      var tag = modtask.ldmod("ui\\conn\\tags").TUNNEL_TAG;
      if (token != false) {
         aaObj[tag] = token + tag + "=";
      }  
   },

   set : function(token) 
   { 
      modtask.ldmod("kernel\\mod").ldonce(modtask.__myname)["token"] = token; 
   },

   clear : function(token)
   {
      modtask.ldmod("kernel\\mod").ldonce(modtask.__myname)["token"] = false; 
   },

   getDependencies : function(moduleconfig)
	{
		var ret =  
		[
			["modtask", "ui\\conn\\tags"] 
		];
		return ret;		
	}
}
