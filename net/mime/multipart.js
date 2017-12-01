
var modtask = function() {};

// http://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
//
// The encapsulation boundary MUST NOT appear inside any of the encapsulated part
//
// The encapsulation boundary following the last body part is a distinguished delimiter that indicates that no further body parts will follow. Such a delimiter is identical to the previous delimiters, with the addition of two more hyphens at the end of the line
//
modtask.extractMultiPartAlternative = function(ret)
{
   modtask.getBoundary(ret);

 
   ret["mime_parts"] = [];
   var rawparts = ret["body"].split(ret["boundary"]);

   ret["body"] = "";

   var i, mime_part, index;
   for(i=1; i < rawparts.length-1; ++i)
   {
      rawparts[i] = modtask.cleanupLastLine(rawparts[i]); 

      mime_part =  { "raw" : rawparts[i] + "" }; 
      modtask.__modtask.parseHeaderAndContent(mime_part);
  
      ret["mime_parts"].push(mime_part);
      if (mime_part["content-type"] == "text/html")
         ret["body"] = mime_part["body"];
      if (mime_part["content-type"] == "text/plain" && ret["body"] == "")
         ret["body"] = mime_part["body"];

      if (mime_part["content-type"] != "text/html" && mime_part["content-type"] != "text/plain" && ret["body"] == "")
         ret["body"] = mime_part["body"]; 
   } 
}    

modtask.cleanupLastLine = function(str)
{ 
   var arr = ["\r", "\n"];   
   var i = 0;
   for(i=0; i < arr.length; ++i)
   {  
      var index = str.lastIndexOf(arr[i]);
      if (index > 0)
      {
         str = str.substr(0, index);
         break;
      }
   }
   return str;
}

// http://ftp.isi.edu/in-notes/rfc2046.txt
// Boundary may not have a ';' character

modtask.getBoundary = function(ret)
{
   ret["boundary"] = ret["content-type-raw"].split(modtask.__modtask.TOKEN_BOUNDARY)[1].split("\n")[0].split(";")[0];
   ret["boundary"] = ret["boundary"].replace(/\r/g, "").replace(/\n/g, "").replace(/^"/g, "").replace(/\"$/g, "");
};
