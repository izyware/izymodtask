
// TODO: this and the clients need to be revised to:
// 1. Only return the string after return
// 2. The higher layers will use row+comma decoding (from encode/decode) depending on the nature of their request
var modtask = {
	init : function() {
		modtask.modstr = modtask.ldmod("core\\string");
 	},	
	
	processResponse : function(res, advanced) {
		var ret = [];
		var failproperly = function(description) {
			if (typeof(advanced) == "object" && advanced["dontfail"]) {
				advanced["success"] = false;
				advanced["description"] = description;
				return description;
			} else {
				modtask.Fail(description);
			}
		};
		var successtoken = "SUCCESS: ";
		if (modtask.modstr.startsWith(res, successtoken)) {
			res = res.substr(successtoken.length);
			if (res == "OK" || res.length == 0) {
			} else {
				res = res.split("__ROW__");
				for(i=1; i < res.length; ++i) {
					var row = res[i].split(",");
					for(j=0; j < row.length; ++j) {
						row[j] = row[j].replace(/__COMMA__/g, ",");
					}
					ret.push(row);
				}
				// Non RowEncoded
				if (ret.length == 0) {
					ret.push(res);
				}
			}
			if (typeof(advanced) == "object") {
				advanced["success"] = true;
			}
			return ret;
		} else if (modtask.modstr.startsWith(res, "FAIL: ")) {
			description = res.substr(6, res.length-6);
            return failproperly(description);
		} else {
            return failproperly("Unrecognized response from node: " + res);
		}
	}
}
