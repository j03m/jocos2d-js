var TestRunner = function(){
	_.extend(this, new jc.EventEmitter2({
	      						 wildcard: false,
	      						 newListener: false,
	      						 maxListeners: 1,
	    					 }));
}

TestRunner.addTests = function(tests){
	if (TestRunner.toRun == undefined){
		TestRunner.toRun = [];
	}
	
	TestRunner.toRun = TestRunner.toRun.concat(tests);
}

TestRunner.runAll = function(){
	TestRunner.run(TestRunner.toRun);
}

TestRunner.run = function(tests){
	TestRunner.count = 0;
	TestRunner.pending = tests.length;
	for (var i=0;i<tests.length;i++){
		var test = tests[i];
		for(var pro in test){
			if (pro.indexOf('test--')!=-1){
				jc.log(['tests'], "Running: " + test.name);				
				if (test.validate){
					test[pro](test);
					jc.log(['tests'], "Validating: " + test.name);
					test.validate();
					TestRunner.count++;
				}else{

					test.on('validate', function(name) { 
						return function(){
									jc.log(['tests'], "Validating: " + name);
									TestRunner.count++;
						}
					}(test.name));
					test[pro](test);
				}
			}
		}			
	}
	cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(TestRunner, TestRunner.worker, 1);
}

TestRunner.worker = function(){
	jc.log(['tests'], TestRunner.count + " of " + TestRunner.pending + " tests completed");
	if (TestRunner.count >= TestRunner.pending){
		jc.log(['tests'], "All Tests Done!");
		cc.Director.getInstance().getScheduler().unscheduleAllCallbacksForTarget(TestRunner);
	}
}

TestRunner.prototype.assert = function(theCase){
	if (!theCase){
		throw "TEST FAILED!!!! - " + this.name + "  - assert case failed. Info:" + JSON.stringify(this.getCallerInfo(), null, 4) ;
	}
}


TestRunner.prototype.getCallerInfo = function(){
	var level = 4;
	var err = (new Error);
	var obj = {};
	obj.stack = err.stack;	
	return obj;
}
	
	
