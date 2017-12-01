
var modtask = 
{
   encodeQuery : function(q, noheader, shift)
   { 
      var i, ret = "__enc";
      if (noheader) ret = "";
      if (!shift) shift = 1;
      for(i=0; i < q.length; ++i)
      {
         ret += String.fromCharCode(q.charCodeAt(i) + shift);
      }
      return ret; 
   },

   decodeQuery : function(q, shift)
   {
      q = q + "";
      var i;
      var ret = "";
      for(i=0; i < q.length; ++i)
      {
         ret += String.fromCharCode(q.charCodeAt(i) - shift);
      }
      return ret;     
   }      
}
