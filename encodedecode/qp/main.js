
var modtask = {};
modtask.dec = function(msg)
{
   var ret;	
   ret = msg;
   ret = ret.replace(/=\r\n/g, "");
   ret = ret.replace(/=\r/g, "");		
   ret = ret.replace(/=\n/g, "");				
   ret = ret.replace(/=([A-Fa-f0-9]{2})/g, function(m, g1) {
     return String.fromCharCode(parseInt(g1, 16));
   });  
   return ret;
}   
