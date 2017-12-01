
var modtask =
{
   content_types : [], 
   content_transfer_encodings : ["base64", "quoted-printable", "7bit"],              
	TOKEN_BOUNDARY : "boundary=",

   // These are ordered lists 
   TOKENS_NEWLINE : ["\r\n\r\n", "\n\n"],
  

	cleanupCommas : function(fld)
	{
		return fld.replace(/,\r\n/g, ",").replace(/,\n/g, "").replace(/, \s+/g, ", ");

	},	

   parseHeaderAndContent : function(ret)
   {
      modtask.modheader = modtask.ldmod("rel:header");
      
      var msg = ret["raw"];

      ret["boundary"] = "";
      ret["mime_parts"] = [];
      ret["content-transfer-encoding"] = "";
      ret["content-type"] = ""; 
      ret["content-type-raw"] = "";
      ret["content-transfer-encoding-raw"] = "";
      ret["content-id"] = "";

      var header = modtask.extractRawHeaderFromStr(ret["raw"]);
      
      // The DKIM signatures in the header field can become problematic,
      // as they may have Content-Encoding, etc. so get rid of them
      
     
      header = modtask.modheader.cleanupDKIM(header);

      ret["rawheader"] = header;
      ret["body"] = modtask.extractRawBodyFromStr(ret["raw"]);  
      if (ret["body"] == false)
         ret["body"] = "Parser Error: Cannot extract body from message";
      else 
      {          
   		ret["content-type-raw"] = modtask.modheader.extract(header, "Content-Type", true).val;
         ret["content-type"] = modtask.matchValue(ret["content-type-raw"], modtask.ldmod("rel:const").content_types);
	      if (ret["content-type"] == '') {
		      ret["content-type"] = 'text/plain';
	      }
         switch(ret["content-type"])
         {
	         case "multipart/report" :
            case "multipart/related" : 
            case "multipart/alternative" :
            case "multipart/mixed" :  
               // 
               // Multi part content type -- the encoding will described in each part. 
               // Note that each part may also be multipart (like a tree) 
               //
               modtask.ldmod("rel:multipart").extractMultiPartAlternative(ret);
               break;
           default : 
               // 
               // Non-multi part content type -- the encoding will described in the header 
               //

               ret["content-id"] = modtask.modheader.extract(header, "Content-ID", true).val;
               ret["content-transfer-encoding-raw"] = modtask.modheader.extract(header, "Content-Transfer-Encoding", true).val;
               ret["content-transfer-encoding"] = modtask.matchValue(ret["content-transfer-encoding-raw"], modtask.content_transfer_encodings); 

               ret["body"] = modtask.decodeBody(ret);
               break;     
         }
      }
   },      
 
	parseMsg : function(msg)
	{
		var ret = {}, boundary, i;
		ret["date"] = "UNPARSED";
      ret["cc"] = "UNPARSED";
 		ret["raw"] = msg;			
		ret["to"] = "UNPARSED";
		ret["body"] = "UNPARSED";
		ret["sender"] = "UNPARSED";
		ret["subject"] = "UNPARSED";
      ret["outcome"] = { "success" : true, "reason" : "" };

		var header; 
   

      modtask.parseHeaderAndContent(ret);
      header = ret["rawheader"];

		ret["to"] = modtask.modheader.extract(header, "To", true).val;
		ret["to"] = modtask.cleanupCommas(ret["to"]);

		ret["cc"] = modtask.modheader.extract(header, "Cc", true).val;
		ret["cc"] = modtask.cleanupCommas(ret["cc"]); 

      ret["date"] = modtask.modheader.extract(header, "Date", true).val; 
		ret["sender"] = modtask.modheader.extract(header, "From", true).val;  
		try {
			ret["subject"] = modtask.modheader.extract(header, "Subject").val;   
			ret["subject"] = modtask.cleanupSubject(ret["subject"]);

		} catch(e) { ret["subject"] = ""; } ;
		return ret;
	},
 
	// name <email> case 
	parseEmailNameAddr : function(str)
	{
		var ret = { "name" : "", "email" : "" } ;
		ret["email"] = str;
		if (modtask.modstr.contains(str, "<"))
			ret["email"] = str.split("<")[1].split(">")[0];
		return ret; 
	},		

	cleanupSubject : function(str)
	{
		str = str.replace(/^ +/g, "");
		str = str.replace(/\r/g, "");		
		return str;
	},		

   
   dontdecode : false,

    
   decodeBase64 : function(msg)
   {
      if (modtask.dontdecode)
         return msg;
      if (!modtask.modbase64)
         modtask.modbase64 = modtask.ldmod("encodedecode/base64");
      return modtask.modbase64.dec(msg); 
   },

   decodeQP : function(msg)
	{
      if (modtask.dontdecode)
         return msg;

      if (!modtask.modqp)
         modtask.modqp = modtask.ldmod("encodedecode/qp/main");
      return modtask.modqp.dec(msg);
	},		

	extractRestAfterToken : function(msg, token, returnfalseifnotfound)
	{
		var index = msg.indexOf(token);
		if (returnfalseifnotfound && index == -1)
			return false;

		return msg.substr(index + token.length, msg.length - index);
	},



   // http://www.ietf.org/rfc/rfc2822.txt
   // The body is simply a sequence of characters that follows the header and is separated from the header by an empty line 
   // (i.e., a line with nothing preceding the CRLF).
   // 
   // It appears that some clients use \n instead of \r\n
   //
   extractRawHeaderFromStr : function(msg)
   {
      var i = 0;
      do
		{
			header = modtask.extractRestAfterToken(msg, modtask.TOKENS_NEWLINE[i++], true);
		} while(header == false && ( i < modtask.TOKENS_NEWLINE.length)); 
 		header = msg.substr(0, msg.length-header.length); 
      return header;
   },   


   extractRawBodyFromStr : function(msg)
   {
  		var tempbody = msg;
		var i = 0;
		do
		{
			tempbody = modtask.extractRestAfterToken(msg, modtask.TOKENS_NEWLINE[i++], true);
		} while(tempbody == false && ( i < modtask.TOKENS_NEWLINE.length));
		return tempbody;
   },
   

	init : function()
	{
	       	modtask.modstr = modtask.ldmod("core/string");
	}
}

modtask.decodeBody = function(mimepart)
{     
   var ret = mimepart["body"];
   switch(mimepart["content-transfer-encoding"])
   {
      case "quoted-printable" :
         ret = modtask.decodeQP(mimepart["body"]);
         break;
      case "base64" : 
         ret = modtask.decodeBase64(mimepart["body"]);
         break; 
   }
   return ret;
};

modtask.__$d = ["encodedecode/base64", "encodedecode/qp/main", "rel:multipart", "rel:header", 'rel:const'];

modtask.matchValue = function(raw, vals)
{ 
   var i;
   var ret = "";
   for(i=0; i < vals.length; ++i)
   {
      if (modtask.modstr.contains(raw.toLowerCase(), vals[i].toLowerCase() ))
      {
         ret = vals[i];
         break;
      }
   }
   return ret;
}

