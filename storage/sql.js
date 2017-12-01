
var modtask = 
{
	adapter : false,
  	targetdb : false,
	logQueriesBeforeExecution : false,
	modstr : false,
   // placeholder 
	verbose : true,
   encryptqueries : false,   
	tokenQuerySeperator : "__QUERY_SEP__",
	__$d : ["storage\\ec" , "core\\string", "kernel\\logging", "encodedecode\\sql", 'ui/node/auth'],

	init : function()
	{
		modtask.modstr = modtask.ldmod("core\\string"); 
		modtask.ldmod("kernel\\logging").makeVerboseSensitive(modtask);
	},

	bindToAdapter : function(adaptername, connectionstring, encryptqueries)
	{
		modtask.adapter = modtask.ldmod(adaptername);
		modtask.adapter.connectionstring = connectionstring; 
      if (encryptqueries)
         modtask.encryptqueries = true; 
	},		

	iterateQuery : function(q, ctx)
	{
		var ret = modtask.runQuery(q);
		var i;
		for(i=0; i < ret.length; ++i)
		{
			ctx.fn(i, "", ret[i]);
		}
	},

   encodeQuery : function(q)
   { 
      return modtask.ldmod("storage\\ec").encodeQuery(q);
   },      

	runQuery : function(q, advanced, async)
	{
		if (!modtask.adapter)		
		{
			modtask.Fail("adapter not set");
		}

		q = modtask.ldmod('ui/node/auth').signRequest(q, modtask.accesstoken);
      
      if (modtask.encryptqueries)
      {
         q = modtask.encodeQuery(q);         
      } 
		if (modtask.logQueriesBeforeExecution)
		{
			modtask.Log(q);
		}
		modtask.adapter.sp('tunnelendpointid', modtask.tunnelendpointid);
 		return modtask.adapter.runQuery(q, false, advanced, async);
	},

	iterateTables : function(db, context)
	{
		var rs = modtask.runQuery("select TABLE_NAME  from  information_schema.TABLES where TABLE_SCHEMA = '" + db + "'");
		for(i=0; i < rs.length; ++i)
		{
			context.fn(false, false, rs[i][0]);
		}		
	},

	AAToSQLComma : function(aa)
	{
		var p, ret = "";
		for(p in aa)
			ret = ret + ",`"  + p + "`";
		ret = ret.substr(1, ret.length-1);
		return ret;
	},

	SQLResultToAA : function(res, aa)
	{
		var p, ret = {}, i = 0 ;
		for(p in aa)
			ret[aa[p]] = res[i++];
		return ret;
	},		

 	getColumnEntriesForTable : function(tbl, raw, strformat)
	{
		var rs = modtask.runQuery("select COLUMN_NAME  from  information_schema.COLUMNS where table_name = '" + tbl + "'"); 
		var retObj = { };
		var p;
		var i,j;
		var exclusions = [/^id$/, /^mod.*/, /signupdate/,
		    ///opendate/, 
		    // /suspenddate/, 
		    /opened/,  /creationtime/]; 
		var exclude;
		var strret = "";

		for(i=0; i < rs.length;++i)
		{
			exclude = false;
			if (!raw)
			{
				for(j=0; j < exclusions.length; ++j)
				{
					
					if (rs[i][0].match(exclusions[j]))
					{
						exclude = true;
						break;
					}
				}
			}
			if (!exclude)
			{
				retObj[rs[i][0]] = rs[i][0]; 
				strret = strret + "`" + rs[i][0] + "`,";
			}
		}
		if (strformat)
		{
			strret = strret.substr(0, strret.length-1);
			return strret;
		}
		else 
			return retObj;
	},

	getCountStatement : function(tbl, cols, conditions)
	{
 		if (!conditions) conditions = ""; 
		var strret = modtask.ldmod("encodedecode\\sql").arrayToSQLComma(cols, "COUNT(DISTINCT ", ")"), i;
 		strret = "select " + strret + " from " + modtask.targetdb + "." + tbl + " " + conditions; 
		return strret;
	},		

	getSelectStatement : function(tbl, cols, conditions)
	{
 		if (!conditions) conditions = "";
		var strret =  modtask.ldmod("encodedecode\\sql").arrayToSQLComma(cols), i;
 		strret = "select " + strret + " from " + modtask.targetdb + "." + tbl + " " + conditions; 
		return strret;		
	},

	readAndParseObjectFromSQL : function(tblname, objindex, autocreate, addaddressinfo)
	{
		var cols = modtask.getColumnEntriesForTable(tblname, true, true);		
 		var rs = modtask.runQuery("select " + cols + " from " + modtask.targetdb + "." + tblname + " where id = '" + objindex + "'");
		if (rs.length < 1)
		{
			if (autocreate)
			{
 				modtask.insertNewRow(tblname, objindex);
				return modtask.readAndParseObjectFromSQL(tblname, objindex, false); 
			}
			else 
			{
				modtask.Fail("readAndParseObjectFromSQL, " + tblname + "_" + objindex + " does not exist. You must create the object before reading it."); 
			}
		}

		cols = cols.split(",");
		var ret = {};
		for(i=0; i < rs[0].length; ++i)
		{
			cols[i] = cols[i].replace(/`/g, "");
			ret[cols[i]] = rs[0][i];
		} 
		if (addaddressinfo)
		{
			ret["tbl"] = tblname;
			ret["index"] = objindex;
		}
		return ret;
	},

	runAsyncQuery : function(q, callback)
	{
		return modtask.runQuery(q, false, callback);
	},		

	dbExists : function(dbName, createifnot, callback)
	{
		modtask.runAsyncQuery("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" + dbName + "'",  
			function(ret)
			{	
				if (ret.length == 0)
				{
					if (createifnot)
					{
						modtask.runAsyncQuery("CREATE DATABASE IF NOT EXISTS " + dbName, 
							function()
							{
								callback(true); 
							}
						);
					}
					else 
					{
						callback(false);
					}
				}
				else 
				{
					callback(true);
				} 
			}
		); 
	},


	// http://stackoverflow.com/questions/6432178/how-can-i-check-if-a-mysql-table-exists-with-php
	// Note: 8/2012: If table name is uppercase, the response will get converted to lower case, so turn it to lowercase first 
	tableExists : function(tblname)
	{
		tblname =tblname + "";
		tblname = tblname.toLowerCase();
		var advanced = { "dontfail" : true };
		var addr = "`" + modtask.targetdb  + "`.`" + tblname + "`";
		var q = "SELECT 1 FROM " + addr + " limit 0,1 " ;
 		q = modtask.runQuery(q, advanced);
		if (advanced["success"] == true)
			return true;
		else 
		{
			addr = "'" + modtask.targetdb  + "." + tblname + "'";
			if (advanced["description"] == "runQuery, Table " + addr + " doesn't exist")
				return false;
			else 
				modtask.Fail("tableExists.bad response: (" + tblname + "). The response was '" + advanced["description"] + "'");
		} 
	},

	rowExists : function(tblname, id)
	{
 		if (modtask.tableExists(tblname))
		{
	 		return (modtask.runQuery("select id from `" + modtask.targetdb + "`.`" + tblname + "` where id = '" + id + "'").length > 0);
		}
		else 
			return false;
	},	

	getCols : function(tbl, callback)
	{
  		modtask.runQuery("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = '" + modtask.targetdb + "' AND TABLE_NAME = '" + tbl + "'", false, 
				function(rs)
				{
					callback(rs);
				});
	},

	colExists : function(tbl, col)
	{
 		return (modtask.runQuery("SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = '" + modtask.targetdb + "' AND TABLE_NAME = '" + tbl + "' AND COLUMN_NAME = '" + col + "'").length > 0); 
	},		

	insertColumn : function(tbl, col, typ)
	{
 		modtask.runQuery("ALTER TABLE " + modtask.targetdb + "." + tbl + " ADD " + col + " " + typ);
	},

	deleteRow : function(tblname, id, async)
	{
 		var query = "delete from  " + modtask.targetdb + "." + tblname + " where 1 = 0";
      var i;     
      if (modtask.ldmod("core\\core").realTypeOf(id) != "array")
         id = [id]; 
      for(i=0; i < id.length; ++i)
         query += " OR `id` = " + id[i];
      query += " limit " + id.length; 
 		if (async)
		{
			modtask.runQuery(query, false, async); 
		}
		else 
		{
			modtask.runQuery(query);		 
		}
	},

	insertNewRow : function(tblname, id, async)
	{
 		var query = "", rs;
		if (id)
		{
			if (modtask.rowExists(tblname, id))
			{
				modtask.Log("Row already exist");
				return id;
			}
			else 
			{
				query = "insert into " + modtask.targetdb + "." + tblname + " (id) values (" + id + ")";
				modtask.runQuery(query);
				return id;
			}
		}
		else 
		{
			query = "insert into " + modtask.targetdb + "." + tblname + " () values ();"; 
			query = query + modtask.tokenQuerySeperator + "SELECT LAST_INSERT_ID();";
         if (typeof(async) == "object")
         {
            modtask.runQuery(query, 
               false,
               async); 
         }
         else if (typeof(async) == "function")
			{ 
            modtask.runQuery(query, false, function(rs)
               {
                  async(rs[0][0]);
               }
            ); 				 
			}
			else 
			{
				rs = modtask.runQuery(query);			
 				return rs[0][0];
			}			
		}
	} 
}
