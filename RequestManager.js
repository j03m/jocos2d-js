var jc = jc || {};
var RequestManager = function(){
	this.gameQueue = [];
	this.resourceQueue = [];
	jc.log(['requestManager'], 'scheduling updates');
	cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(this, this.worker, .01);
	
}

RequestManager.gameQId = 'game.queue.storage';
RequestManager.resQId = 'resource.queue.storage';
RequestManager.events = {};
RequestManager.types = {};
RequestManager.events.GameRequestQueued = 'game.req.queued';
RequestManager.events.ResourceRequestQueued = 'res.req.queued';
RequestManager.events.GameRequestSuccess = 'game.req.success';
RequestManager.events.GameRequestFailed = 'game.req.failed';
RequestManager.events.GameRequestStarted = 'game.req.started';
RequestManager.events.ResourceRequestSuccess = 'resource.req.success';
RequestManager.events.ResourceRequestFailed = 'resource.req.failed';
RequestManager.events.ResourceRequestStarted = 'resource.req.started';
RequestManager.types.game = 'game';
RequestManager.types.res = 'res';



RequestManager.prototype.queueGameRequest = function(request){
	request.type = RequestManager.types.game;
	this.gameQueue.push(request);
	jc.log(['requestManager'], 'gameRequest queued');
	this.emit('game.request.queued')
	this.serializeGameQueue();
}

RequestManager.prototype.queueResourceRequest = function(request){
	request.type = RequestManager.types.res;
	this.resourceQueue.push(request);
	jc.log(['requestManager'], 'resRequest queued');
	this.serializeResQueue();
}

RequestManager.prototype.getGameReq = function(){
	var req = this.gameQueue.shift();
	this.serializeGameQueue();
	return req;
}

RequestManager.prototype.getResourceReq = function(){
	var req = this.resourceQueue.shift();
	this.serializeResQueue();
	return req;
}

RequestManager.prototype.serializeToLocalStorage = function(id, item){
	sys.localStorage[id] = JSON.stringify(item);
}

RequestManager.prototype.serializeGameQueue = function(){
	this.serializeToLocalStorage(this.gameQid, this.gameQueue);
}

RequestManager.prototype.serializeResQueue = function(){
	this.serializeToLocalStorage(this.resQId, this.resourceQueue);
}


RequestManager.prototype.testEventFire = function(name, data){
	this._instance.emit(name, data);
}

RequestManager.prototype.worker = function(){
		cc.Director.getInstance().getScheduler().pauseTarget(this);
		
		//pull a request off the game queue, unless empty
		var req = this.getGameReq();
		if (req){	
			this.emit(RequestManager.events.GameRequestStarted, req);
		}else{
			req = this.getResourceReq();
			if (req){
				this.emit(RequestManager.events.GameRequestStarted, req);				
			}
		}
		
		if (req){ //there is a request in the queue
			//send the request
			req.success = this.success.bind(this);
			req.failure = this.failure.bind(this);
			jc.log(['requestManager'], 'sending request');
			ajax(req);
			
		}else{ //queue is empty...todo: anything to do here?
			
		}
		
		cc.Director.getInstance().getScheduler().resumeTarget(this);
}

RequestManager.prototype.success = function(req, res){
	var event;
	jc.log(['requestManager'], 'Request success');
	if (req.type == RequestManager.types.game){
		event = RequestManager.events.GameRequestSuccess;
	}else if (req.type == RequestManager.types.res){
		event = RequestManager.events.ResourceRequestSuccess;
	}else{
		throw 'unknown request type in request manager';
	}
	this.emit(event, {'req':req, 'res':res});		
}

RequestManager.prototype.failure = function(req, res){
	var event;
	jc.log(['requestManager'], 'Request failure');
	if (req.type == RequestManager.types.game){
		event = RequestManager.events.GameRequestFailure;
	}else if (req.type == RequestManager.types.res){
		event = RequestManager.events.ResourceRequestFailure;
	}else{
		throw 'unknown request type in request manager';
	}
	this.emit(event, {'req':req, 'res':res});		
}

RequestManager.getInstance = function(){
    if (!this._instance) {
		this._instance=new RequestManager();
		_.extend(this._instance, new jc.EventEmitter2({
			      						 wildcard: false,
			      						 newListener: false
			    					 }));
		
    }
    return this._instance;
}

jc.RequestManager = RequestManager;



//use case:
//dude queues a request

//request gets serialized to disk

//scheduler pulls a request, sends it out

//send/response fires event (what's the mean in this case? node style 'on'

