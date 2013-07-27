var eventTest = _.extend({
    'name':'emit an event',
	'test--':function() {
		jc.log(['tests'],"test--emit an event running");
		var manager = jc.RequestManager.getInstance();
		manager.once('data', this['validateAsync'].bind(this));
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
			'url':'http://localhost:1337/tests.html',
			'method':'GET',
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
		jc.RequestManager.getInstance().once(jc.RequestManager.events.GameRequestStarted, this.validateAsync.bind(this));
		jc.RequestManager.getInstance().queueGameRequest({
			id:'requestStartedEvent',
			url:'http://localhost:1337/tests.js',		
		    method:'GET'
		});
	},
	'validateAsync':function(req){
		if (req.id == 'requestStartedEvent'){
			this.assert(req.url == 'http://localhost:1337/tests.js');
			this.assert(req.method == 'GET');
			this.emit('validate',null);			
		}		
	}
}, new TestRunner());

var requestSuccessEvent = _.extend({
	'name':'verify that I can send an http request and I will get an event stating it completed',
	'test--':function(){
		jc.RequestManager.getInstance().once(jc.RequestManager.events.GameRequestSuccess, this.validateAsync.bind(this));
		jc.RequestManager.getInstance().queueGameRequest({
			id: 'requestSuccessEvent',
			url:'http://localhost:1337/index.html',		
		    method:'GET'
		});
	},
	'validateAsync':function(answer){
		if (answer.req.id == 'requestSuccessEvent'){ //otherwise this isn't our request, ignore
			this.assert(answer.req.url == 'http://localhost:1337/index.html');
			this.assert(answer.req.method == 'GET');
			this.assert(answer.res.response != undefined);
			this.assert(answer.res.status == 200);
			this.emit('validate',null);					
		}
	}
}, new TestRunner());


var requestFailEvent = _.extend({
	'name':'verify that I can send an http request and I will get an event stating it completed if it fails',
	'test--':function(){
		jc.RequestManager.getInstance().once(jc.RequestManager.events.GameRequestFailure, this.validateAsync.bind(this));
		jc.RequestManager.getInstance().queueGameRequest({
			id: 'requestFailEvent',
			url:'http://localhost:1337/index1.html', //doesn't exist		
		    method:'GET'
		});
	},
	'validateAsync':function(answer){
		if (answer.req.id == 'requestFailEvent'){ //otherwise this isn't our request, ignore
			this.assert(answer.req.url == 'http://localhost:1337/index1.html');
			this.assert(answer.req.method == 'GET');
			this.assert(answer.res.status == 404);
			this.emit('validate',null);					
		}
	}
}, new TestRunner());

//todo: get async working up in this bizitch
var xmlHttpTest = _.extend({
	'name':'verify that I can send multiple http requests',
	'test--':function(){
		var done=0;
		ajax({
			method:'GET',
			url:'http://localhost:1337/index.html',
			success:function(){
				done++
				if (done>=3){
					this.emit('validate', null);
				}
			}.bind(this),
			failure:function(){
				this.assert(false);
			}.bind(this)			
		});
		ajax({
			method:'GET',
			url:'http://localhost:1337/index.html',
			success:function(){
				done++
				if (done>=3){
					this.emit('validate', null);
				}
			}.bind(this),
			failure:function(){
				this.assert(false);
			}.bind(this)			
		});
		ajax({
			method:'GET',
			url:'http://localhost:1337/index.html',
			success:function(){
				done++
				if (done>=3){
					this.emit('validate', null);
				}
			}.bind(this),
			failure:function(){
				this.assert(false);
			}.bind(this)
			
		});		
	},
	'validateAsync':function(answer){
		this.emit('validate', null);
	}
}, new TestRunner());


TestRunner.addTests([eventTest, xmlHttpTest, requestFailEvent, requestSuccessEvent, requestStartedEvent, requestQueueSerializationTest, diskTest, eventTest]);