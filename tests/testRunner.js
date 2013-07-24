var TestRunner = function(){
	
}


TestRunner.run = function(test){
	for(var pro in test){
		if (pro.indexOf('test--')!=-1){
			test[pro](test);
		}
	}
	
	console.log("All tests complete.");
}

TestRunner.assert = function(theCase){
	if (!theCase){
		throw "Assert failed.";
	}
}
