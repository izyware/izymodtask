
var modtask = 
{
	__$d : [ "net\\http"],
	queryAsync : function(transportsuccessfn, connectionstring, query, ignored_creds, transportfailfn) {
		return modtask.http.postAsyncHTTPRequest(
			transportsuccessfn,
			connectionstring, // url
			query, // postdata 
			false,  // contenttype
         false, // auth
         transportfailfn 
      );
	},
	
	querySync : function(connectionstring, query, creds) {
		return modtask.http.postHTTPRequest(
			connectionstring,
			query,
			creds);
	},

	init : function() {
		modtask.http = modtask.ldmod("net\\http");
	}	 
}
