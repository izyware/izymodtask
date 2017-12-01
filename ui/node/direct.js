
var modtask = 
{ 	
   relconfigmod : false,
   dataservice : false,   
   verbose : false, 
	 encryptqueries : true, 

   setTimeoutThreshold : function(timeoutinmilisecs) {
      // This is a horrible hack and needs to be fixed so that the call is routed to the transportmodule !!!!!
      if (modtask.groupidobject["transportmodule"] == "qry\\transport\\scrsrc")
      {
   		modtask.ldmod("kernel\\mod").ldonce("net\\xdomain").delayBeforeError = timeoutinmilisecs; // Total Hack!
      }
      return modtask;
   },      

   // No exceptions. Everything should be funneled through failpush
	runQuery2 : function(q, okpush, failpush) {
      if (modtask.verbose)
         modtask.Log(q);

      if (typeof(q) == "object" && typeof(q["join"]) == "function")
         q = q.join("__QUERY_SEP__");

		var mod = modtask.__modtask;

       if (!modtask.groupidobject) {
          modtask.groupidobject = mod.groupidobject;
       }
       if (!modtask.groupidobject) {
          modtask.groupidobject = modtask.ldmod('kernel/mod').ldonce(modtask.__myname)['groupidobject'];
       }
       if (!modtask.groupidobject) {
          failpush( { 'reason' : modtask.__myname + ' (global and local) does not have groupidobject. Neither does its parent: ' + mod.__myname + '. Please add them' })
       }

        if (!modtask.dataservice) {
            modtask.dataservice = modtask.ldmod('kernel/mod').ldonce(modtask.__myname)['dataservice'];
        }

      if (!modtask.dataservice) {
         if (!modtask.relconfigmod) {
            failpush( { "reason" : "dataservice (local, global) or relconfigmod.is.not.set" } );
            return ;
         }
         modtask.dataservice = mod.ldmod(mod.ldmod("kernel\\path").rel(modtask.relconfigmod)).getName("dataservice");
      }
      modtask.modqry = modtask.ldmod("storage\\sql");
        if (modtask.verbose)
            modtask.modqry.sp("logQueriesBeforeExecution", true).sp("verbose", true);
        else
            modtask.modqry.sp("logQueriesBeforeExecution", false).sp("verbose", false);

      modtask.modqry.encryptqueries = modtask.encryptqueries; 
 
      modtask.modqry.bindToAdapter("storage\\sqlhttp", modtask.dataservice);		
      if (modtask.groupidobject["transportmodule"]) {
         modtask.modqry.adapter.sp("transport", modtask.ldmod(modtask.groupidobject["transportmodule"])); 
      }

        modtask.modqry.sp('tunnelendpointid', modtask.tunnelendpointid);
        modtask.modqry.sp('accesstoken', modtask.accesstoken);

        modtask.modqry.runQuery(
			q, 
         false,
         {
            // transportsuccess: The result might still have failure though due to the query backend response 
            "fn" : function(me, _ret, success) {
               if (success)
                  okpush(_ret);
               else 
                  failpush({ "reason" : _ret }); 
 		   	},

            // transportfail -- network failed, etc.
            "transportfail" : function(reason) {
               failpush({ "reason" : reason });              
            } 
          }
		);  
	}
}

modtask.__$d = ['kernel/mod', "ui\\sqlsetup", "cms\\schema\\simplejson", "encodedecode\\sql"];
