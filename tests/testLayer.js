var TestLayer = cc.Layer.extend({	
	init: function() {
		if (this._super()) {
			TestRunner.runAll();
			//TestRunner.run([requestStartedEvent]);	
			return true;
		} else {
			return false;
		}
	},
});

TestLayer.create = function() {
	var ml = new TestLayer();
	if (ml && ml.init()) {
		return ml;
	} else {
		throw "Couldn't create the RequestManagerTestLayer. Something is wrong.";
	}
	return null;
};

TestLayer.scene = function() {
	var scene = cc.Scene.create();
	var layer = TestLayer.create();
	scene.addChild(layer);
	return scene;
};
