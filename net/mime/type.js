var modtask = {};

modtask.filenametotype = function(file, ret)
{
   if (!ret)
      ret = {};
   ret["type"] = "image";
   ret["extention"] = "jpg";
   file = file.split(".");file = file[file.length-1];
   switch(file)
   {
      case "gif":
      case "jpg" : 
      case "jpeg" : 
      case "tiff" : 
      case "png": 
         ret.extention = file;
         ret.type = "image";
         break;
      case "pdf" :  
         ret.extention = file;
         ret.type = "application";
         break; 
      case "doc":
      case "docx" : 
         ret.extention = "msword";
         ret.type = "application";
         break; 
      default : 
         ret.type = "application";
         ret.extention = file;
   }
};   
