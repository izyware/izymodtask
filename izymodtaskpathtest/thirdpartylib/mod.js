var modtask = function(expectedPath) {
  var props = ['modtask.__myname', 'expectedPath', '__dirname'];
  console.log('************** module ***************');
  for(var i=0; i < props.length; ++i) {
    console.log(props[i], eval(props[i]));
  }
}
