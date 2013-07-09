//REQUIRES: https://github.com/alexei/sprintf.js

var jc = jc || {};

jc.AnimationTypeOnce=0;
jc.AnimationTypeLoop=1;  

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}
  
jc.Sprite = cc.Sprite.extend({
	initWithPlist: function(plist, sheet, firstFrame) {
		this.animations = [];
		this.batch = null;
		this.state = 0;
		this.moving = 0;
		this.currentMove = null;
		this.nextState = 0;
		cc.SpriteFrameCache.getInstance().addSpriteFrames(plist);
		this.batch = cc.SpriteBatchNode.create(sheet);
		var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(firstFrame); 		
		this.initWithSpriteFrame(frame);
		return this;
	},
	addDef: function(entry) {
		var animFrames = [];
		var str = "";
		var frame;
		//loop through the frames using the nameFormat and init the animation
		for (var i = 0; i < entry.frames; i++) {
			//https://github.com/alexei/sprintf.js <--must have
			str = entry.nameFormat.format(i); 
			frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
			if (!frame){
				throw "Couldn't get frame. What is: " + str;
			}
			animFrames.push(frame);			
		}
    	//make the animation
		var animation = cc.Animation.create(animFrames, entry.delay);		

		//if the entry type is a loop create a forver action
		if (entry.type == jc.AnimationTypeLoop){
 			var action = cc.RepeatForever.create(cc.Animate.create(animation));
			action.tag = entry.state;
			entry.action = action;
		}else{
			//otherwise assume a one play with animationDone as an ending func
	        //we'll extend this with more types later. This is all I need right now
	        var ftAction = cc.Animate.create(animation);
			var repeater = cc.Repeat.create(ftAction, 1);
			var onDone = cc.CallFunc.create(this.animationDone, this);
			var seq = cc.Sequence.create(repeater, onDone);
			seq.tag = entry.state;
			entry.action = seq;			
		}
		
		this.animations[entry.state] = entry;				
	},
	moveToLocationWithStateAndVelocity: function(point, state, velocity, callback){
		var moveDiff = cc.Sub(point, this.position);
		var distanceToMove = cc.Length(moveDiff);
		var moveDuration = distanceToMove/velocity;
		
		if (this.state == this.idle){
			this.setState(this.moving);
		}else if (this.state == this.moving){
			this.stopAction(this.currentMove);
		}
		
		//if a callback wasn't supplied, set callback to the internal moveEnded
		if (!callback){
			callback = this.moveEnded;
		}
		
		//bust a move
		var moveAction = cc.MoveTo.create(moveDuration, location);
		this.currentMove = cc.Sequence.create(moveAction, cc.CallFunc.create(callback.bind(this)));
		
		//run it
		this.runAction(this.currentMove);		
	},
	moveEnded: function(){
		this.setState(this.idle);
		this.stopAction(this.currentMove);		
	},
	animationDone:function(){
		this.setState(this.nextState);
	},
	setState:function(state){
		var currentState = this.state;
		this.state = state;
		var startMe = this.animations[this.state];
		var stopMe = this.animations[currentState];
		if (startMe && stopMe){
			this.nextState = startMe.transitionTo;
			this.stopAction(stopMe.action);
			this.runAction(startMe.action);
		}else{
			throw "Couldn't set state. What is state: " + state + " currentState:" + currentState;			
		}
	},
	centerOn:function(point, xmax, ymax, xmin, ymin){
		var size = cc.Director.getInstance().getWinSize();;
	    var x = Math.max(point.x, xmax);
	    var y = Math.max(point.y, ymax);
	    x = Math.min(x, xmin);
		y = Math.min(y, ymin);
		var actualPosition = cc.p(x,y);
		var centerOfView = cc.p(size.width, size.height);
		var viewPoint = cc.pSub(centerOfView, actualPosition);
		this.setPosition(viewPoint);
		
	}
});
