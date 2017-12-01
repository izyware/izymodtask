
var modtask = 
{
	name : function(str)
	{
		str = str + "";
		return str.replace(/\\/g, "_"); 
	}, 

	encodeRegexpSqlSingleQuoted : function(str)
	{
      str += "";
		str = str.replace(/\\/g, "[\\\\]");
		str = str.replace(/'/g, "\\'");

      var chars = ['*', '.', '?', '+', '[', ']', '(', ')', '{', '}', '^', '$', '|', '\\'];
      var i; 
      for(i=0; i < chars.length; ++i)
         chars[i] = "\\" + chars[i]; 
      var re = new RegExp("([" + chars.join("|") + "])", "g");
      str = str.replace(re, "\\\\$1");  
		return str; 
	},

	encodeStringToSQLStrSingleQuoted : function(str)
   {
      str += "";
		return str.replace(/'/g, "''").replace(/\\/g, "\\\\");
	},

	encodeStringToSQLStrDoubleQuoted : function(str)
    {
      str += "";       
		return str.replace(/"/g, "\"\"").replace(/\\/g, "\\\\");
	},

	arrayToSQLComma : function(cols, left, right)
	{
		if (!left) left = "";
		if (!right) right = "";
		if (cols.length < 1)
			modtask.Fail("colsToComma.cols empty");	
		var strret = "", i;
		for(i=0; i < cols.length; ++i)
		{
			strret += left;
			strret += "`";
         strret += cols[i];
         strret += "`";
			strret += right;			
			strret += ",";
		}
		strret = strret.substr(0, strret.length-1);
		return strret;
	}		
}
