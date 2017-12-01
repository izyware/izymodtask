
var modtask = 
{
	// See http://tools.ietf.org/html/rfc3986#section-3 for naming
	urlrandompart : "randomanticach",
	str : false,
	fullec : false,

	URLToFS : function(url)
	{
 		return url.replace(/\//g, "_").replace(/:/g, "_");
	},		

	randomizeURL : function(url)
	{
		url = url + "?" + modtask.urlrandompart + "=" + modtask.ldmod("core\\datetime").nowInMilisecs();
		return url;
	},

	removeNoiseChars : function(url)
	{
		return url.replace(/ /g, "").replace(/\n/g, "").replace(/\r/g, "");
	},		

	isValid : function(url)
	{
		return modtask.ldmod("core\\string").startsWith(url, "http"); 
	},		

	standardizeURL : function(url, randomize)
	{
		if (url.indexOf("http://") != 0 && url.indexOf("https://") != 0)
			url = "http://" + url;
		if (randomize) url = modtask.randomizeURL(url);
		return url;
	},		

	AAToURL : function(server, aaObj)
	{
		var datetime = modtask.ldmod("core\\datetime");
 		if (typeof(aaObj) == "undefined")
			aaObj = {};	
		aaObj[modtask.urlrandompart] =  datetime.nowInMilisecs();
		if (!modtask.str.endsWith(server, "?"))
			server = server + "?";
		return server + modtask.AAToCFG("&", "=", aaObj);
	},

	URLEncode : function(str)
	{
      return modtask.ldmod('rel:percent').sp("fullec", modtask.fullec).URLEncode(str); 
	},   

	URLDecode : function(str)
	{
      return modtask.ldmod('rel:percent').sp("fullec", modtask.fullec).URLDecode(str);
	},

	AAToCFG : function(tok1, tok2, nvObj, testmode, donotescape)
	{
      return modtask.ldmod('rel:percent').sp("fullec", modtask.fullec).ec(tok1, tok2, nvObj, testmode, donotescape); 
   },

	dcQuery : function(qry)
	{
		var ret = {};
		modtask.CFGToAA("&", "=", qry, ret); 
		return ret;
	},	

	ecQuery : function(qry)
	{
 		return modtask.AAToCFG("&", "=", qry); 
 	},

   combine : function(url1, url2)
   {
      // placeholder 
      if (modtask.str.endsWith(url1, "/")) url1 = url1.substr(0, url1.length - 1);
      if (modtask.str.startsWith(url2, "/")) url2 = url2.substr(1, url2.length - 1);
      var ret = url1 + "/" + url2; 
      return ret;
   },      

	CFGToAA : function(tok1, tok2, cfg, nvObj, dontunescape)
	{
      return modtask.ldmod('rel:percent').sp("fullec", modtask.fullec).dec(tok1, tok2, cfg, nvObj, dontunescape);       
	},

	getSLD : function(url)
	{
		return modtask.parseURL(url).authority;
	},		

   authority : function(helper)
	{
		return '([A-Za-z0-9-\.:\u00BF-\u1FFF\u2C00-\uD7FF\]*)';
	},

   path : function(helper)
	{
  		return '([/A-Za-z0-9.`()"\'=&#!*;:@+$,[\\]~:%_<>^\\\\{}|-]*)'; 
         // php
//		return '([/A-Za-z0-9\.`\(\)"\'=\&#!*;:@+$$,\[\]~:%_<>^\\\{\}\|-]*)'; 
	},

   parseUri : function(uristr)
   {
      var uri = { "scheme"  : "", "authority" : "", "path" : "", "query" : "", "fragment" : "", "fullpath" : "" } ;
      uristr += "";
      uristr = uristr.replace(/^\s*/i, ''); 
      uri.scheme = uristr.match(/^(http|https|ftp):\/\//i); 
		if (uri.scheme != null) 
		{
         uri.scheme = uri.scheme[0].toLowerCase();          
         uri.scheme = uri.scheme.substr(0, uri.scheme.length-3); 
		}
      else 
      {
         uri.scheme = ""; 
      }
		uri.authority = uristr.replace(new RegExp('^(http:|https:|ftp:)?(\/\/)' + modtask.authority(3) + '(\/)?(.*)', 'i'), '$3');
		if (uri.authority  == uristr) uri.authority = ""; 
		if (uri.scheme + "://" + uri.authority == uristr) 
		{
			uri["path"] = "/";
			uri["fullpath"] = "/";
		}
		else 
		{
			uri["fullpath"] = uristr.replace(new RegExp('^(http:|https:|ftp:)?(\/\/)' + modtask.authority(3) + '(\/)?' + modtask.path(5) + '?(.*)', 'i'), '$4$5$6');
          //  preg_replace('/^(http:|https:|ftp:)?(\/\/)' . $this->authority(3) . '?(\/)' . $this->path(5) . '?(.*)/i', '\4\5\6', $uristr); 
			uri["path"]     = uristr.replace(new RegExp('^(http:|https:|ftp:)?(\/\/)' + modtask.authority(3) + '(/)?' + modtask.path(5) + '?(.*)', 'i'), '$4$5');
         uri["path"]  = uri["path"].replace(/#.*/i, "");
          //  preg_replace('/^(http:|https:|ftp:)?(\/\/)' . $this->authority(3) . '?(\/)' . $this->path(5) . '?(.*)/i', '\4\5', $uristr); 
			uri["query"] =    uristr.replace(new RegExp('^(http:|https:|ftp:)?(\/\/)' + modtask.authority(3) + '(/)?' + modtask.path(5) + '?(.*)', 'i'), '$6');  
          //  preg_replace('/^(http:|https:|ftp:)?(\/\/)' . $this->authority(3) . '?(\/)' . $this->path(5) . '?(.*)?/i', '\6', $uristr); 
			if (uri["query"]  == uristr) uri["query"] = ""; 
			uri["query"]    = uri["query"].replace(/^\?/i, "");
         if (uri["query"] == "")
         {            
            uri["fragment"] = uristr.replace(new RegExp('^(http:|https:|ftp:)?(\/\/)' + modtask.authority(3) + '(/)?' + modtask.path(5) + '#(.*)', 'i'), '$6');  
            if (uri["fragment"] == uristr)
               uri["fragment"] = "";
         }
         else 
         {
            if (uri["query"].indexOf("#") >= 0)
            {
      			uri["fragment"] = uri["query"].replace(/.*#/i, ""); 
      			uri["query"]    = uri["query"].replace(/#.*/i, "");
            }               
         }
		} 
      return uri; 
   },      

   // Bad -- use parseUri instead
	parseURL : function(url)
	{
		var ret = {};
		var splt;	

		splt = url.split("/"); 
		// placeholder 
		if (splt.length < 3)
			modtask.Fail("slash < 3 in " + url);

		if (!modtask.str.contains(splt[0], ":"))
			modtask.Fail("protocol header missing " + url);

		if (splt[1] != "")
			modtask.Fail("// is missing from the protocol header " + url);
		
		ret["ip"] = splt[2];	

		if (ret["ip"].length < 1)
			modtask.Fail("invalid host address " + url);


		if (ret["ip"].indexOf(":") >= 0)
		{
			ret["port"] = ret.ip.split(":")[1];
			ret.ip = ret.ip.split(":")[0];		
		}
		else 
		{
			ret["port"] = 80;
		}

		if (splt.length <= 3)
		{
			ret["path"] = "/";
		}
		else 
		{
			ret["path"] = "";
			var i;
			for(i=3; i < splt.length; ++i)
				ret["path"] = ret["path"] + "/" + splt[i];

		}

		ret["formdata"] = {};
		var obj = {};
		if (modtask.str.contains(ret["path"], "?"))
		{
			ret["formdata"] = ret.path.split("?")[1];
 			modtask.CFGToAA("&", "=", ret["formdata"] , obj);
			ret["formdata"] = obj;
		}
		ret["authority"] = ret["ip"];
		return ret;
	},

	init : function()
	{
		modtask.str = modtask.ldmod("core\\string");	
	}
}

modtask.__$d = ['core\\datetime', 'core\\string', 'rel:percent'];
