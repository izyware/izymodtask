
var modtask = 
{
	VERIFY_STRING2 : function(res, val)
	{
		return modtask.VERIFY_STRING(modtask, res, val);
	},

	VERIFY_STRING : function(ctx, res, val)
	{		
		if (res != val || typeof(res) == "undefined" || typeof(val) == "undefined")
			ctx.Fail(Minicore.newLine + "VERIFY_STRING(" + Minicore.newLine + "'" + (res + "").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t") + "'" + Minicore.newLine + " !=  " + Minicore.newLine +  "'" + val + "')");
	},

	VERIFY_SUBSTRING2 : function(res, val)
	{
		if (typeof(res) == "undefined" || typeof(val) == "undefined" || !modtask.contains(res, val))
			modtask.Fail("VERIFY_SUBSTRING(" + Minicore.newLine + "'" + res + "'" + Minicore.newLine + " NOT_SUPERSTRING " + Minicore.newLine +  "'" + val + "')");
	},		

	splitLast : function(str, token)
	{
		var tmp = str.split(token);
		if (tmp.length <2) modtask.Fail("splitLast." + str + "." + token);
		var ret = [];
		ret[0] = "";
		ret[1] = tmp[tmp.length-1];
		ret[0] = str.substr(0, str.length-ret[1].length-token.length);
		return ret;
	},		
	
	replaceTokens : function(content, tokens)
	{
		var p;
		for(p in tokens)
		{
			var exp = p.replace(/\\/g, "\\\\").replace(/\[/g,"\\[").replace(/\$/g, "\\$").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
 			var re = new RegExp(exp,"g");
			content = content.replace(re, tokens[p]);		
		}
		return content;
	},

	toByteArray : function(str)
	{
		var i, ret = [];
		for(i=0; i < str.length; ++i)
			ret[i] = str.charCodeAt(i);
	       return ret;	
	},
		
	trim : function(str, extra)
	{
		str = str.replace(/^\s+|\s+$/g, "");		
		if (extra == "nonprintable")			
			str = str.replace( /[^a-zA-Z0-9\s-@\.\<\>="'_\\\&,\/]/g, ""); 
		return str;
	},

	contains : function(str1, str2)
	{
		var i;
		if (typeof(str2) == "object")
		{
			for(i=0; i < str2.length; ++i)
				if (modtask.contains(str1, str2[i]))
					return true; 
		}
		str1 = str1 + "";str2 = str2 + "";
		return (str1.indexOf(str2) >= 0);
	},

	noCapsPresent : function(str)
	{
		return str.match(/[A-Z]+/) == null;

	},


	strClean1013 : function(str, rpl, keep1013)
	{
		var ret = "";
		var i;
		for(i=0; i < str.length; ++i)
		{
			if (str.charCodeAt(i) == 13 || str.charCodeAt(i) == 10)
			{
				if (keep1013)
					ret += str.substr(i,1);			
				if (rpl)
					ret += rpl
				continue;
			}
			else 
				ret += str.substr(i,1);

		}
		return ret;
	},	

	startsWith : function(str1, str2)
	{
		var core = modtask.ldmod("core\\core");
		if (core.realTypeOf(str2) == "array")
		{
			var p;
			for(p in str2)
			{
				if (this.startsWith(str1, str2[p]))
					return true;
			}
			return false;
		}
		// placeholder 
		if (str1.length >= str2.length)
		{
			if (str1.substr(0, str2.length) == str2)
				return true;
		}
		return false;
	},		

	endsWith : function(str1, str2)
	{
		if (str1.length >= str2.length)
		{
			if (str1.substr(str1.length-str2.length, str2.length) == str2)
				return true;
		}
		return false;
	},

	nSpace: function(s,n)
	{
		return modtask.nStrrpt(s, n, " ");
	},

	nStrrpt : function(s,n, str)
	{
		var ret = s + "";
		while(ret.length < n)
			ret += str;
		return ret;
	},

	twoDigits : function(s)
	{
		if (s < 10)
			return "0" + s;
		else 
			return s;
	},

	randomNDigit : function(n)
	{
		var i;
		var ret = "";
		for (i=0; i < n ; ++i)
			ret += (Math.round(Math.random()*1000) + "").substr(0,1);
		return ret;
	},

	getDependencies : function(moduleconfig)
	{
		var ret =  
		[
			["modtask", "core\\core"] 
		]; 
		return ret;		
	} 
}

