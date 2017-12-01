



var modtask = 
{
	shortMonth3Names : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	shortMonthNames :  ["Jan", "Feb", "March", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
	longMonthNames : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	core : false,


   // Set this to the context timezone for your datetime strings. The default (below) is MST (Arizona)
   timezone_context_inmins : -8*60,  

   adjustfortimezone : function(timeinms)
   {
      var d = new Date();
      // In minutes 
      var utcminuslocal = d.getTimezoneOffset(); 
      // minutes
      var serverminuslocal = utcminuslocal + modtask.timezone_context_inmins;
      var dt = timeinms - serverminuslocal*60*1000; 
      return dt;
   },  
   		  
	// http://stackoverflow.com/questions/1197928/how-to-add-30-minutes-to-a-javascript-date-object	
	// direction is either up or down 
	adjustMiliseconds : function(dt, milisecs)
	{
		return modtask.getDateTime(false, new Date(this.dateInMilisecs(dt)*1+(milisecs*1)));
 	},	

	adjustSeconds : function(dt, secs)
	{
		return modtask.adjustMiliseconds(dt, 1000*secs);
 	},	

	getTodayDate : function(daydelta)
	{
		var currentTime = new Date();
		var month = (currentTime.getMonth() + 1);
		var day = currentTime.getDate();
		var year = currentTime.getFullYear();

		if (daydelta)
		{
			var yeardelta = Math.round(daydelta / 365);
			monthdelta = Math.round((daydelta - yeardelta*365)/30);
			daydelta = Math.round(daydelta - monthdelta * 30 - yeardelta*365);
			month -= monthdelta ; if (month < 1) month = 1;
			year -= yeardelta ; 
			day -= daydelta; if (day < 1) day = 1;
		}
 		return  modtask.modstr.twoDigits(month) + "/" + modtask.modstr.twoDigits(day) + "/" +  year; 
	},


	getDateTime : function(timeonly, currentTime)
	{
		if (!currentTime)
		{
			currentTime = new Date();
		}
		var hours = currentTime.getHours();
		var minutes = currentTime.getMinutes();
		var seconds = currentTime.getSeconds();
		var month = currentTime.getMonth() + 1;
		var day = currentTime.getDate();
		var year = currentTime.getFullYear();
		if (timeonly)
			return modtask.modstr.twoDigits(hours) + ":" + modtask.modstr.twoDigits(minutes) + ":" + modtask.modstr.twoDigits(seconds);
		else 
			return year + "-" + modtask.modstr.twoDigits(month) + "-" + modtask.modstr.twoDigits(day) + " " + modtask.modstr.twoDigits(hours) + ":" + modtask.modstr.twoDigits(minutes) + ":" + modtask.modstr.twoDigits(seconds);
	},

	dateInMilisecs : function(dt)
	{
		var dateObj;
		if (dt)
		{
			dt  = this.processDMTYDate(dt, false, true);
			// Note, JS months are zero based
			dateObj = new Date(dt["py"], dt["pm"]-1, dt["pd"], dt["hour"], dt["mins"], dt["secs"]);
		}
		else 
		{
			dateObj = new Date();
		}
		return dateObj.getTime() + "";
	},

	nowInMilisecs : function()
	{
		return this.dateInMilisecs();
	},

	milisecsToDateTime : function(ms)
	{
		return modtask.adjustMiliseconds(false, ms - modtask.nowInMilisecs() ); 
	},

	calcFriendlyNames : function(inputdate, ret, timeportion, referencedt)
	{
		var mul, num ;

      var deltatype =  "ago"; 
      delta = modtask.dateInMilisecs(referencedt.fulldt) - modtask.adjustfortimezone(modtask.dateInMilisecs(inputdate));
      if (delta < 0)
      {
         delta = -1*delta;
         deltatype = "from now";
      }
         
      delta = delta / 1000; 
      ret["deltainsecs"] = delta;
      map = 
      {
         "sec"  : 60,
         "min"  : 60,
         "hour" : 24,
         "day"  : 30,
         "month" : 12,
         "year"  : 1000
      }; 
      mul = 1;
      for(p in map)
      {
         if (delta <  map[p]*mul)
         {
            num = Math.round(delta / mul);
            ret["shortfriendlyname"] = "" + modtask.modstr.twoDigits(num) + " " + p + (num == 1 ? " " : "s") + " " + deltatype;
            ret["friendlyname"] = modtask.modstr.twoDigits(ret.pm) + "/" + ret.pd + ret["shortfriendlyname"]; 
            break;
         }
         else 
         {
            mul = map[p]*mul;
         }  
      }
		return ret;		
	},		

	// Input could be a string with either of these formats 
	// Sat Nov 6 14:44:51 PST 2010 
	// 2010-11-06 14:44:51 (SQL DateTime Format)
	processDMTYDate : function(inputdate, referencedt, dontprocessfriendlyname)
	{
		if (!referencedt)
		{
			referencedt = { 
				"fulldt" : modtask.getDateTime()
			} 
		};	
		var ret = {
			"pd" : "",
			"pm" : "",
			"py" : "",
			"daysago" : "",
			"friendlyname" : "N/A",
         "shortfriendlyname" : "N/A"
		};

		if (inputdate == null)
			return ret;
		inputdate = inputdate + ""; 
      if (inputdate == "")
         return ret; 
		var tmp1;
		var timeportion = "";

		
		if (inputdate.indexOf("-")>=0)
		{
			tmp1 = inputdate.split("-");
			ret["pm"] = tmp1[1];
			ret["pd"] = tmp1[2].split(" ")[0];
			ret["py"] = tmp1[0];
			timeportion = tmp1[2].split(" ")[1];
		}
		else 
		{		
			var dt = (inputdate + "").split(" ");
			ret["pm"] =  modtask.core.arrayIndexMatch(dt[1], modtask.shortMonth3Names) + 1;
			ret["pd"] = modtask.modstr.twoDigits(dt[2]);
			ret["py"] = dt[dt.length-1];
			timeportion = dt[3];
		}
		var timed = timeportion.split(":");
		ret["hour"] = timed[0];
		ret["mins"] = timed[1];
		ret["secs"] = timed[2];		
		if (dontprocessfriendlyname)
		{
		}
		else 
		{
			modtask.calcFriendlyNames(inputdate, ret, timeportion, referencedt);
		} 
		return ret;
	},

	formatAgoFrom : function(val, str)
	{
		var ret = "";
		if (val == 0)
			return false;
		if (val < 0)
			ret = modtask.modstr.twoDigits(val*-1)  + " " + str + "s " + "from now"; 
		else
		{	
			if (str == "day" && val == 1)
				ret = "-yesterday-";
			else 
				ret = modtask.modstr.twoDigits(val)  + " " + str + "s " + "ago";
		}
 		return " " + ret + " ";  
	},		

	init : function()
	{
		modtask.modstr = modtask.ldmod("core\\string");
		modtask.core = modtask.ldmod("core\\core");
	},

	getDependencies : function(moduleconfig)
	{
 		var ret = 
		[
 			["modtask", "core\\string"],
			["modtask", "core\\core"]
		];
		return ret;
	}			
}
