
var modtask = {};

modtask.cleanupDKIM = function(header, token1)
{
   var i,j, right, left;
   if (!token1)
   {
      header = modtask.cleanupDKIM(header, "DKIM-Signature:");
      header = modtask.cleanupDKIM(header, "DomainKey-Signature:");
      return header; 
   }
   do 
   {
      i = header.indexOf(token1);
      if (i < 0) break;
      left = header.substr(0, i);
      right = header.substr(i + token1.length); 
      j = right.indexOf("b=");
      if (j >= 0)
        right = right.substr(j, right.length-j); 
      header = left + "CLEANUP_DKIM:" + right;        
   } while( i >= 0);
   return header;
}

// http://tools.ietf.org/html/rfc2822 - 2.2.3. Long Header Fields
// The process is called Folding 
// The field value may spready over more than 1 line 
modtask.extract = function(msg, field, cleanupsourroundingws)
{
   var ret1 = { "reason" : "", "success" : false, "timezone" : "" };

   var ret = "", tmp = "";
   

   var token = field + ":";

   var loc = msg.indexOf(token);

   if (loc == 0)
   {
   }   
   else 
   {
      token = "\n" + token;
      loc = msg.indexOf(token);
   }

   if (loc == -1)
   {
      ret1 = { "reason" : "notfound", "success" : false, "val" : "" };
      return ret1;
   }

   loc += token.length;
   msg = msg.substr(loc, msg.length-loc);

   tmp = msg.split("\n");  
   ret += tmp[0].replace(/\r$/g, "");
   var i;
   for(i=1; i < tmp.length; ++i)
   {
      if (tmp[i].match(/^\s/))
      {
         ret = ret + tmp[i].replace(/\r$/g, "");
      }
      else 
         break;
   }
   ret = modtask.parseEncodedWordFields(ret).val;

   if (cleanupsourroundingws)
   {
      ret = ret.replace(/^\s+/g, "");
      ret = ret.replace(/\s+$/g, ""); 
   }

   ret1 = { "reason" : "", "success" : true, "val" : ret };
   return ret1; 
};


// http://tools.ietf.org/html/rfc1342
// RFC 1342 is a recommendation that provides a way to represent non ASCII characters inside e-mail headers in a way that won�t confuse e-mail servers.
// =?charset?encoding?encoded-text?=
// The encoding must be either B or Q, these mean base 64 and quoted-printable respectively

modtask.parseEncodedWordFields = function(val, charset, encoding)
{
   var ret = { "val" : val, "success" : false } ;
   
   if (!charset)
   {
      var charsets = ["UTF-8", "utf-8"];
      var encodings = ["Q", "B"];
      var i, j;
      for(i=0; i < charsets.length; ++i)
      {
         for(j=0; j < encodings.length; ++j)
         {
            ret = modtask.parseEncodedWordFields(val, charsets[i], 
                  encodings[j]);
            if (ret.success)
               return ret;
         }
      }
      return ret;
   }

   var token = "=?" + charset + "?" + encoding + "?";
   var token2 = "?=";
   while(val.indexOf(token) > 0)
   {
      ret.success = true;
      var i1, i2;

      i1  = val.indexOf(token) + token.length;
      i2  = val.substr(i1, val.length- i1).indexOf(token2);
  
      var data = val.substr(i1, i2);

      switch(encoding)
      {
         case "Q" :
            data = modtask.__modtask.decodeQP(data);
            break;
         case "B" :
            data = modtask.__modtask.decodeBase64(data); 
            break;
      }
      val = val.substr(0, i1-token.length) + data + val.substr(i1+i2+token2.length, val.length-(i1+i2+token2.length));
      // Just to be safe :-)
      break;
   }
   ret.val = val;
   return ret;
};
