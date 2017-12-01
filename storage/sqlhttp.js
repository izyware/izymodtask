
var modtask = 
{
   connectionstring : false,
	modstr : false,
	uri : false,
	transport : false,
	useJSONP : false,
	getDependencies : function(moduleconfig)
	{
		var ret =  [
         ["modtask", "ui/node/tunnel"],
			["modtask", 'ui/node/processresponse'],
			["modtask", "storage\\sql"],
			["modtask", "core\\string"],
			["modtask", "qry\\transport\\http"],
			["modtask", "net\\xdomain"],
			["modtask", "encodedecode\\uri"]
 		];
		return ret;		
	},
 
	init : function()
	{
		modtask.modstr = modtask.ldmod("core\\string");
		modtask.rpc = modtask.ldmod('ui/node/processresponse');				
		modtask.uri = modtask.ldmod("encodedecode\\uri");
		modtask.transport = modtask.ldmod("qry\\transport\\http");
	},	

	getConnectionStringFromServerAddr : function(serveraddr)
	{
 		if (!modtask.modstr.contains(serveraddr, "htdocs"))
			modtask.Fail("Cannot figure out http addr from deploy. You must have htdocs in " + serveraddr);
		var addr = modtask.uri.parseURL(serveraddr.replace(/\\/g, "/"));
		var connectionstring = "http://" + addr["ip"] + addr["path"].split("htdocs")[1] + "/" ; 
 	        return 	connectionstring;
	},		

	runQuery : function(q, connectionstring, advanced, async)
	{
		var ret = [], i, description;

		if (typeof(advanced) == "object")
			advanced["success"] = true;

		var processResponse = modtask.rpc.processResponse; 
		var _str = "";

      var transportfail = modtask.Fail;

      if (typeof(async) == "object" && typeof(async["transportfail"]) == "function")
      {
         transportfail = async["transportfail"];
      } 

		if (typeof(async) == "function" || typeof(async) == "object")
		{
			modtask.runRawQuery(
            q, 
            connectionstring, 
            false,
            // transportsuccess  
            function(responseText)					
            {
               var localret, advanced  = { "dontfail" : true, "success" : false };
               if (typeof(async) == "function")
               {
                  localret = processResponse(responseText, advanced);
                  async(localret);  
               }
               else 
               {
                  localret = processResponse(responseText, advanced);
                  async["fn"](async, localret, advanced.success);
               }
            },
            // transportfail
            transportfail 
         );
			return ;
		}
		else 
		{
			_str = modtask.runRawQuery(q, connectionstring);
		}
		return processResponse(_str, advanced); 
	},

	runRawQuery : function(query, connectionstring,  creds, transportsuccessfn, transportfailfn)
	{
		var credstr = "";
		var poststr = "";	
		var retstr = "";

      var failproperly = function(reason)
      { 
			if (typeof(transportfailfn) == "function") {
                transportfailfn(reason);
			} else {
                modtask.Fail(reason);
			} 
      }         

		if (!connectionstring) {
			connectionstring = modtask.connectionstring;
		}

		if (!connectionstring) {
			return failproperly("Invalid connectionstring");
		}

		if (!modtask.modstr.endsWith(connectionstring, "/")) {
			return failproperly("Invalid connection string. It must end with '/': " + connectionstring);
		}      

		if (typeof(query) != "string") {
			query = "";
		} 
	
      var aaObj = {}; 
      modtask.ldmod("ui/node/tunnel").addToQuery(aaObj, modtask.tunnelendpointid);
 		connectionstring = modtask.uri.AAToURL(connectionstring + "index.php?", aaObj);
		try {
			if (typeof(transportsuccessfn) == "function") {
				retstr = modtask.transport.queryAsync(transportsuccessfn, connectionstring, query, creds, transportfailfn);
			} else {
 				retstr = modtask.transport.querySync(connectionstring, query, creds);
			}
		} catch(e) {
			return failproperly("runRawQuery, " + connectionstring + ": " +  modtask.exceptionToString(e), modtask);
		}
		return retstr;
	}
}
