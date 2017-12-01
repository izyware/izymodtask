

var modtask = {};

modtask.toJson = function(row, fields, ret) {
   if (!ret)
      ret = {};
   var i; 
   if (!fields) fields = row;
   for(i=0; i < row.length; ++i)
      ret[fields[i]]=row[i];
   return ret; 
};   

modtask.getUpdate = function(id, tbl, map) {
   var map;
   var p;
   var ret =  "update " + tbl  +  " set ";
   var val;
   for(p in map) {
      val = map[p] + "";
      if (val.indexOf("NOQUOTE__") == 0)
         val = val.replace(/^NOQUOTE__/, "");
      else 
         val = "'" + modtask.ldmod('encodedecode/sql').encodeStringToSQLStrSingleQuoted(val) + "'";

      ret += " `" + p + "` = " + val + ","; 
   }
   ret = ret.substr(0, ret.length-1);
   if (typeof(id) != "object")
      id = [id];
   ret += " where id in (" + id.join(",") + ")";
   // Do not put newLine at the begining because crudup won't be able to authorize 
   ret = ret + Minicore.newLine  + Minicore.newLine;
   return ret;    
};

modtask.getUpsert = function(tbl, maps) {
   return modtask.getInsert(tbl, maps, 'upsert');
}

modtask.nop = " select 1 ";

modtask.getInsert  = function(tbl, maps, operator) {
   if (!operator)
      operator = "insert";

   var upsert = false;
   if (operator == 'upsert') {
      operator = 'insert';
      upsert = true;
   }

   var i;
   var p;
   var fields = [], values = [];
   if (maps.length == 0)
      return modtask.nop ;


   var ret = "";

   var j; 
   var map;
   var val;
   for(j=0; j < maps.length; ++j)
   {
      var hascustomerid = false;
      map = maps[j];
      values = [];
      fields = [];
      for(p in map) {
         fields.push(p);

         val = map[p] + "";
         if (val.indexOf("NOQUOTE__") == 0)
            values.push(val.replace(/^NOQUOTE__/, ""));
         else 
            values.push("'" + modtask.ldmod('encodedecode/sql').encodeStringToSQLStrSingleQuoted(val) + "'");
      } 
      ret += Minicore.newLine + 
         ("(" + values.join(",") + "),"); 
   }  
   ret =  ret.substr(0, ret.length-1);
   ret =  operator + " INTO " + tbl  +  " " +
      "(`" + fields.join("`,`")  + "`) " + 
        "  VALUES " + 
      ret;

   var j;
   if (upsert) {
      ret += ' ON DUPLICATE KEY UPDATE ';
      for(j=0; j < fields.length; ++j) {
         ret += '`' + fields[j] +'` = VALUES(`' + fields[j] + "`),"
      };
      ret = ret.substr(0, ret.length-1);
   }
   return ret;     
}

modtask.__$d = ['encodedecode/sql'];
