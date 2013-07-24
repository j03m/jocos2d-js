var RequestManager = function(){
	this.gameQueue = [];
	this.resourceQueue = [];
}

RequestManager.prototype.queueGameRequest = function(request){
	this.gameQueue.push(request);
}

RequestManager.prototype.queueResourceRequest = function(request){
	this.resourceQueue.push(request);
}

RequestManager.prototype.getGameQueue = function(){
	return this.gameQueue.shift();
}

RequestManager.prototype.getResourceQueue = function(){
	return 	this.resourceQueue.shift();
}

RequestManager.prototype.testEventFire = function(name, data){
	this._instance.emit(name, data);
}

RequestManager.prototype.serialize = function(){
	var gameQueue = JSON.stringify(this.gameQueue);
	var resourceQueue = JSON.stringify(this.resourceQueue);
	this.toDisk(gameQueue, "gameQueue.js");
	this.toDisk(resourceQueue, "resourceQueue.js");
}

RequestManager.prototype.toDisk = function(data, file){
	console.log("data sent to disk");
}

RequestManager.getInstance = function(){
    if (!this._instance) {
		this._instance=new RequestManager();
		_.extend(this._instance, new jc.EventEmitter2({
		      						 wildcard: false,
		      						 newListener: false,
		      						 maxListeners: 1,
		    					 }));
    }
    return this._instance;
}
var jc = jc || {};
jc.RequestManager = RequestManager;



//use case:
//dude queues a request

//request gets serialized to disk

//scheduler pulls a request, sends it out

//send/response fires event (what's the mean in this case? node style 'on'

