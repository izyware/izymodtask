
var modtask = {};
modtask.mimepart = {};
modtask.getParts = function(filter, outcomepush)
{
   var i;
   var ret = { "success" : true, "results" : [] } ;
   modtask.getPart(filter, modtask.mimepart, ret); 
   outcomepush(ret);
}

modtask.getPart = function(filter, mimepart, ret)
{
   var match = true;
   var p;
   for(p in filter)
   {
      if (filter[p] != mimepart[p])
      {
         match = false;
         break;
      }
   }
   if (match)
   {
      ret["results"].push(mimepart);
      return;
   }
   else 
   {
      var i;
      for(i=0; i < mimepart.mime_parts.length; ++i)
         modtask.getPart(filter, mimepart.mime_parts[i], ret);
   }
}
