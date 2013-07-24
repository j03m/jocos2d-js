var eventTest = {
	'test--emit an event':function() {
		jc.log(['tests'],"test--emit an event running");
		var manager = jc.RequestManager.getInstance();
		manager.on('data', this['validate']);
		manager.emit('data', {
			'hi': 'hi'
		});
	},
	'validate': function(someData) {
		jc.log(['tests'],"test--emit validating");
		TestRunner.assert(someData.hi=='hi');
	}
}

var diskTest = {
	'test--queue a request verify it gets to disk': function(){
		jc.log(['tests'], sys);
		jc.log(['tests'], sys.localStorage);
	}
}


var RequestManagerTestLayer = cc.Layer.extend({	
	init: function() {
		if (this._super()) {
			TestRunner.run(eventTest);	
			TestRunner.run(diskTest);		
			// console.log(TestRunner);
			return true;
		} else {
			return false;
		}
	},
});

RequestManagerTestLayer.create = function() {
	var ml = new RequestManagerTestLayer();
	if (ml && ml.init()) {
		return ml;
	} else {
		throw "Couldn't create the RequestManagerTestLayer. Something is wrong.";
	}
	return null;
};

RequestManagerTestLayer.scene = function() {
	var scene = cc.Scene.create();
	var layer = RequestManagerTestLayer.create();
	scene.addChild(layer);
	return scene;
};








