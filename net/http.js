
var modtask = 
{
	xmlhttpobjtype : "IE",	

	configAsync : function(cfg) {
		switch(cfg)
		{
			case "sync" : 
				Kernel["force_async_to_sync"] = true;
				break;
         case "async" : 
				Kernel["force_async_to_sync"] = false;
				break; 
			default : 

				modtask.Fail("invalid.cfg.configAsync");
				break; 
		} 
	},		

	postHTTPRequest : function(url, postdata, contenttype, auth) {
		return modtask.postPutHttp("POST", url, postdata, contenttype, auth); 
	},

	postAsyncHTTPRequest : function(transportsuccessfn, url, postdata, contenttype, auth, transportfailfn) {
		if (!transportfailfn) transportfailfn = modtask.Fail;
		var ret;
		if (Kernel["force_async_to_sync"]) {
			modtask.Log('force_async_to_sync');
			try {
				ret = modtask.postHTTPRequest(url, postdata, contenttype, auth);
			} catch(e) {
				transportfailfn(modtask.exceptionToString(e));
				return ;
			}
			transportsuccessfn(ret);
			return;
		} else {
			if (typeof(contenttype) != "string") {
				contenttype = "text/html";
			}
	        if (typeof(postdata) != "string") {
		        postdata = "";
	        }
			return modtask.platformHTTP("POST", url, postdata, contenttype, auth, transportsuccessfn, transportfailfn);
		}
 	},	

	putHTTPRequest : function(url, postdata, contenttype, auth) {
		return modtask.postPutHttp("PUT", url, postdata, contenttype, auth); 
	}, 

	gdHTTPRequest : function(method, url, auth) {
		return modtask.callXmlHttpObject(method, url, "", "application/atom+xml; charset=UTF-8", auth);
	},

	postPutHttp : function(method, url, postdata, contenttype, auth) {
		return modtask.callXmlHttpObject(method, url, postdata, contenttype, auth);
	},	

	getHTTPRequest : function(_url, auth) {
		return modtask.gdHTTPRequest("GET", _url , auth);
	},

	getAsyncHTTPRequest : function(callback, _url, auth) {
 		if (Kernel["force_async_to_sync"])
		{
 			callback(modtask.getHTTPRequest(_url, auth));
		}
		else 
		{
			return modtask.callXmlHttpObject("GET", _url, "", "application/atom+xml; charset=UTF-8", auth, callback);
		}
 	},


	deleteHTTPRequest : function(_url, auth) {
		return modtask.gdHTTPRequest("DELETE", _url, auth);
	},	

	getErrorTxt : function(url, cause)
	{
		return "Network access failure possibly due to connectivity, malformed URL or cross-domain restrictions when trying to access: '" + url + "'"; 
	},


	platformHTTP : function(method, url, postdata, contenttype, auth, transportsuccessfn, transportfailfn) {
   		return modtask.ldmod(Kernel.getModulePath("http")).callXmlHttpObject(modtask, method, url, postdata, contenttype, auth, transportsuccessfn, transportfailfn);
	},

	callXmlHttpObject : function(method, url, postdata, contenttype, auth, callback) {
      if (typeof(contenttype) != "string") contenttype = "text/html";

		if (typeof(postdata) != "string")
		{
			postdata = "";
		}
		var callbackwrapper = false;
		var errorwrapper = false;
		if (typeof(callback) == "function")
		{
			callbackwrapper = function(val)
			{
				Kernel.rootModule.externalCall({'fn': callback, 'p' : val, 'context' : "callXmlHttpObject_ASYNC_CALLBACK" }); 
			}

			errorwrapper = function(val)
			{
 				Kernel.rootModule.externalCall({'fn': callback, 'p' : val, 'context' : "callXmlHttpObject_ASYNC_ERROR" }, true);  
			}
		} 
 		return modtask.platformHTTP(method, url, postdata, contenttype, auth, callbackwrapper, errorwrapper);
	}
}

// TODO: two cases
// 1. When building singleton from command line, the below should be filtered to match only the platform being built for
// 2. For cloud based on demand, a determination can be made about the target and the loadPkg will load these 
modtask.__$d = ['host/ff/http', 'host/ie/http'];
