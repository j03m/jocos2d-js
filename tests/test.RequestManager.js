
var eventTest = _.extend({
    'name':'emit an event',
	'test--':function() {
		jc.log(['tests'],"test--emit an event running");
		var manager = jc.RequestManager.getInstance();
		manager.on('data', this['validateAsync'].bind(this));
		manager.emit('data', {
			'hi': 'hi'
		});
	},
	'validateAsync': function(someData) {
		jc.log(['tests'],"test--emit validating");
		this.assert(someData.hi=='hi');
		this.emit('validate',null);
	}
}, new TestRunner());

var diskTest = _.extend({
    'name':'verify that storage works',
	'test--': function(){
		var obj = {
			a:1,
			b:2,
			c:"hi",
			d:{
				a:1,
				c:"hi"
			}
		};
		sys.localStorage.setItem('gq', JSON.stringify(obj));
	},
	'validate': function(someData){
		var raw = sys.localStorage.getItem('gq');
		var obj = JSON.parse(raw);
		this.assert(obj.a == 1);
		this.assert(obj.b == 2);
		this.assert(obj.c == "hi");
		this.assert(obj.d.a == 1);
		this.assert(obj.d.a == 1);
		this.assert(obj.d.c == "hi");						
	}
}, new TestRunner);

var requestQueueSerializationTest = _.extend({
    'name':'verify that when I queue game stuff they end up on disk',
	'test--':function(){
		var manager = jc.RequestManager.getInstance();	
		manager.queueGameRequest({
			'url':'http://localhost:1337/index.html',
			'data':{
				'randomstuff':'stuff'
			}
		});
	},
	'validate':function(someData){
		var raw = sys.localStorage.getItem('gq');		
	}
}, new TestRunner());

var requestStartedEvent = _.extend({
	'name':'verify that I can send an http request and I will get an event stating it started',
	'test--':function(){
		//todo:
		//Left off here, writing tests to verify that the request manager fires events correctly
		//write tests to verify that the request manager sends and receives data to/from server coms.
		jc.RequestManager.getInstance().on(jc.RequestManager.events.GameRequestStarted, this.validateAsync);
		jc.RequestManager.queueGameRequest({
			url:'http://localhost:1337/index.html',		
		    method:'GET'
		});
	},
	'validateAsync':function(req){
		this.assert(req.url == 'http://localhost:1337/index.html');
		this.assert(req.method == 'GET');
		this.emit('validate',null);
		
	}
}, new TestRunner());

var RequestManagerTestLayer = cc.Layer.extend({	
	init: function() {
		if (this._super()) {
			TestRunner.run([eventTest, diskTest, requestQueueSerializationTest]);	
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








