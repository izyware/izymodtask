
var modtask = {};
modtask.callXmlHttpObject = function(_modtask, method, url, postdata, contenttype, auth, transportsuccessfn, transportfailfn) {
	var shouldfail = false;	
	var parts;
   var isAsync = false;

	try {
		 method = method.toUpperCase();

		 var modurl = require("url");

		 parts = modurl.parse(url, true);
		 
		 var options = {
		   host: parts.host,
		   path: parts.path,
		   method: method,
		   headers: {
			'Content-Type': contenttype 
		   }      
		 };

		var mod = (parts.protocol == "https:" ? "https" : "http");
		var xmlhttp = require(mod);
		 if(typeof(auth) == "string" && auth.length > 0) {
			options.headers["Authorization"] = auth;
		 }
		 else if (typeof(auth) == "object") {
			var p;
			for(p in auth)
			       options.headers[p] = auth[p]; 
		 } 
		 // options.headers["Connection"] = "close";  
		 if (method == "POST" || method == "PUT") {
		    options.headers["Content-length"] = postdata.length;
		 } 

		 var ret = '';  
		 
		 if (typeof(transportsuccessfn) == "function")
		    isAsync = true;
		 if(!isAsync) {
			 var msg = 'Only async http requests are supported for nodejs. Make sure that force_async_to_sync is not accidently enabled.';
			 if (transportfailfn) {
				 transportfailfn(msg);
				 return;
			 }
			 throw (msg);
		 }
			var req = xmlhttp.request(options,
		    function(response) {
			 var str = ''
			 response.on('data', function (chunk) {
			   str += chunk;
			 });

			 response.on('end', function () {
			    transportsuccessfn(str);
			 }); 
		    } 	
		 ); 

		 req.on('error', function(err) {
		       transportfailfn("http request error: " + err + ", host: " + parts.host); 
		 });
		 

		  if (method == "POST" || method == "PUT") {
		    req.write(postdata);  
		  }
		  else {
		  } 
		 req.end();                 
	}
	catch(e)
	{
		shouldfail = true;
		ret = "";
	   ret += "Error: " + modtask.exceptionToString(e) + ", host: " + parts.host; 
	}

   if (shouldfail) {
      if (isAsync) {
         transportfailfn(ret);
         return ;
      } else {
         _modtask.Fail(ret);
      }
   } else  {
      return ret;
   }
}		

