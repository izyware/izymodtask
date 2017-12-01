
var modtask = 
{
   token : false,
   signRequest : function(q, accesstoken) {
      var token = accesstoken;
      if (!token)
         token = modtask.ldmod("kernel\\mod").ldonce(modtask.__myname)["token"];
      if (token != false) {
         var tag = modtask.ldmod("ui\\conn\\tags").AUTH_TAG; 
         q =  tag + token + tag + q;
      } 
      return q;
   },

   set : function(token) {
      modtask.ldmod("kernel\\mod").ldonce(modtask.__myname)["token"] = token; 
   },

   clear : function(token) {
      modtask.ldmod("kernel\\mod").ldonce(modtask.__myname)["token"] = false; 
   },

   __$d : ["ui\\conn\\tags"]
}
