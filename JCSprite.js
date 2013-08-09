//REQUIRES: https://github.com/alexei/sprintf.js

jc.AnimationTypeOnce=1;
jc.AnimationTypeLoop=0;

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
    layer:undefined, //parent reference
	initWithPlist: function(plist, sheet, firstFrame, name) {
		this.animations = [];
		this.batch = null;
		this.state = -1;
		this.moving = 0;
		this.currentMove = null;
		this.nextState = 0;
		this.idle = 0;
		this.name = name;
		cc.SpriteFrameCache.getInstance().addSpriteFrames(plist);
		this.batch = cc.SpriteBatchNode.create(sheet);
		var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(firstFrame); 		
		this.initWithSpriteFrame(frame);
		return this;
	},
	cleanUp: function(){
		this.stopAction(this.currentMove);
		this.currentMove.release();
		this.currentMove = undefined;
		this.stopAction(this.animations[this.state].action);
		this.state = -1;
		for(var i =0; i<this.animations.length; i++){
			this.animations[i].action.release();
		}
	},
	addDef: function(entry) {
		if (entry.nameFormat==undefined){
            throw "Nameformat is required in a sprite definition.";
        }
        if (entry.state==undefined){
            throw "State is required in a sprite definition.";
        }
        if (entry.type==undefined){
            throw "Animation type 'type' is required in a sprite definition.";
        }
        if (entry.delay==undefined){
            throw "Animation delay 'delay' is required in a sprite definition.";
        }

        var action = this.makeAction(entry);
        action.retain();
		entry.action = action;
		this.animations[entry.state] = entry;				
	},
	makeAction: function(entry){
		var animFrames = [];
		var str = "";
		var frame;
		var start = entry.start;
        var end = entry.end;
        if (start == undefined){
            start = 0;
        }
        if (end == undefined){
            if (entry.frames == undefined){
                throw "You must provide either an end range or a number of frames when creating an entry.";
            }
            end = entry.frames-1;
        }

		//loop through the frames using the nameFormat and init the animation
        for (var i = start; i <= end; i++) {
			str = entry.nameFormat.format(i); 
			frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
			if (!frame){
				throw "Couldn't get frame. What is: " + str;
			}
			animFrames.push(frame);			
		}
    	//make the animation
		var animation = cc.Animation.create(animFrames, entry.delay);		
		var action;
		//if the entry type is a loop create a forver action
		if (entry.type == jc.AnimationTypeLoop){
 			action = cc.RepeatForever.create(cc.Animate.create(animation));
			action.tag = entry.state;

		}else{
			//otherwise assume a one play with animationDone as an ending func
	        //we'll extend this with more types later. This is all I need right now
	        var ftAction = cc.Animate.create(animation);
			var repeater = cc.Repeat.create(ftAction, 1);
			var onDone = cc.CallFunc.create(this.animationDone, this);
			action = cc.Sequence.create(repeater, onDone);
			action.tag = entry.state;

		}
		return action;
	},
	moveTo: function(point, state, velocity, callback){
		jc.log(['sprite', 'move'],"Moving:"+ this.name);
		var moveDiff = cc.pSub(point, this.getPosition());
		var distanceToMove = cc.pLength(moveDiff);
		var moveDuration = distanceToMove/velocity;
		//todo: update this to transition
		if (this.currentMove != undefined){
			jc.log(['sprite', 'move'],'Stopping move in process.');
			this.stopAction(this.currentMove);
			this.currentMove.release();
			this.currentMove = undefined;
		}
		
		//set our moving state    
		jc.log(['sprite', 'move'],'Setting state to required move.');
		this.setState(state);
		
		//if a callback wasn't supplied, set callback to the internal moveEnded
		if (!callback){
			callback = this.moveEnded.bind(this);
		}
		
		//bust a move
		var moveAction = cc.MoveTo.create(moveDuration, point);
		
		jc.log(['sprite', 'move'],'creating the move sequence');
		this.currentMove = cc.Sequence.create(moveAction, cc.CallFunc.create(callback));
		this.currentMove.retain();
		
		//run it
		jc.log(['sprite', 'move'],'running move sequence');
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
		jc.log(['sprite', 'state'],"State Change For:" + this.name + ' from:' + currentState + ' to:' + this.state);	
		if (this.state == currentState){
			jc.log(['sprite', 'state'],"Trying to set a state already set, exit");
			return;
		}
		var startMe = this.animations[this.state];		
		if (currentState != -1){
			var stopMe = this.animations[currentState];
			if (startMe && stopMe){
				this.nextState = startMe.transitionTo;
	            jc.log(['sprite', 'state'],"Stopping action.")
	            this.stopAction(stopMe.action);
	            jc.log(['sprite', 'state'],"Starting action.")
	            this.runAction(startMe.action);
				
			}else{
				throw "Couldn't set state. What is state: " + state + " currentState:" + currentState;			
			}			
		}else{
			this.nextState = startMe.transitionTo;
            jc.log(['sprite', 'state'],"Starting action.")
            this.runAction(startMe.action);
		}
	},
	centerOnScreen:function(){
		var size = cc.Director.getInstance().getWinSize();
		var x = size.width/2;
		var y = size.height/2;
		this.setPosition(cc.p(x,y));		
	},
    setBehavior: function(behavior){
        var behaviorClass = BehaviorMap[behavior];
        if (!behaviorClass){
            throw 'Unrecognized behavior name: ' + behavior;
        }

        this.behavior = new behaviorClass(this);
    },
    think:function(dt){
        this.behavior.think(dt);
    }
});

jc.Sprite.spriteGenerator = function(allDefs, def, png, plist){


    var character = allDefs[def];
    var sprite = new jc.Sprite();

    var nameFormat = character.name + ".{0}.png";
    if (character.inherit){
        //find who we inherit from, copy everything that doesn't exist over.
        var parent = allDefs[character.inherit];
        for (var prop in parent){
            if (character[prop]==undefined){
                character[prop] = parent[prop];
            }
        }
    }

    if (character['animations']== undefined){
        throw def + " has a malformed configation. Animation property missing.";
    }

    var firstFrame = character.animations['idle'].start;
    sprite.initWithPlist(plist, png, nameFormat.format(firstFrame), character.name);

    for (var animation in character.animations){
        //use this to create a definition in the sprite
        character.animations[animation].nameFormat = nameFormat; //jack this in.
        character.animations[animation].state = animation;
        sprite.addDef(character.animations[animation]);
        if (animation == 'idle'){
            sprite.idle = animation;
        }
        if (animation == 'walk'){
            sprite.moving = animation;
        }
        if (animation == 'fly'){
            sprite.moving = animation;
        }
    }
    return sprite;
}

jc.randomNum= function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}