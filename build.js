
var modtask = function() {};
modtask.SHIP = function() {
	var entrypoint = modtask.ldmod('kernel/path').rel('entrypoint');
	modtask.ldmod('g_packer').pakfuscatedisabled(true);
	var js = modtask.ldmod('codegen/gen').sp('verbose', true).genCustomePayload(
		entrypoint, // TOKEN_ROOTMODULE -- see modtask/minicore
		'host/nodejs/base', // TOKEN_HOSTINGMODULE -- see modtask/minicore
		'onSystemStart();module.exports=Kernel;', // callbackcode
		// extramodulestoinclude
		[
		// This is needed by Kernel (minicore) when processing ldmod('rel:...')
		['modtask', 'kernel/path']
		],
		false // Config
	);

	modtask.file = modtask.ldmod('file');

	var payloaddir = modtask.ldmod('deploy/paths').getTempBuildDir(entrypoint);
	var payloadfile = modtask.file.pathCombine(payloaddir, 'ljs.js');
	modtask.file.forceWriteFile(payloadfile, js);
	console.log('payloadfile', payloadfile);
};
