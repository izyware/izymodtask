
var modtask = {};

// http://cr.yp.to/immhf/date.html#timestamp
// There are two possibilities for the time zone
// - sign and 4 digits (and optional paren)
// - obsolete: nicknames (RFC 822)
//
modtask.parse = function(mimedatestr)
{
   var ret = { "reason" : "", "success" : false, "timezone" : "" };
   var timezone = ""; 
   timezone = mimedatestr.split(":")[2];
   timezone = timezone.substr(timezone.indexOf(" ") + 1);

   // 
   // +0000 (UTC)
   // PDT 
   // 
   
   // clear up paren and whitespace 
   timezone = timezone.split("(")[0].replace(/\s/g, "");

   var map = 
   {         
      "UT"   : "+0000",
      "GMT"  : "+0000",     
      "EST"  : "-0500",
      "EDT"  : "-0400",               
      "CST"  : "-0600",
      "CDT"  : "-0500", 
      "MST"  : "-0700",
      "MDT"  : "-0600", 
      "PST"  : "-0800",
      "PDT"  : "-0700"
   };

   if (map[timezone])
      timezone = map[timezone];    

   if (timezone.match(/[+|-][0-9][0-9][0-9][0-9]/))
   {
      ret.timezone = timezone.substr(0, 3) + ":" + timezone.substr(3,2);
      ret.success = true;
   }
   else 
   {
      ret.reason = "Cannot parse " + timezone; 
   };
   return ret; 
}   
