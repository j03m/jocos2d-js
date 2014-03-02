var jc = jc || {};
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
	alive:true,
    initWithPlist: function(plist, sheet, firstFrame, config) {
        this.HealthBarWidth = 20;
        this.HealthBarHeight = 5;
        this.animations = {};
		this.batch = null;
		this.state = -1;
		this.moving = 0;
		this.currentMove = null;
		this.idle = 0;
		this.name = config.name;
        this.baseOffset = config.baseOffset;


        if (jc.config.batch){
            jc.log(['batching'], 'in sprite creation');
            if (!jc.spriteBatch){
                jc.log(['batching'], 'jc batches not defined, defining');
                jc.spriteBatch = {};
            }

            if (!jc.spriteBatch[sheet]){
                jc.log(['batching'], 'Sheet: ' + sheet + ' not batched, creating');
                jc.spriteBatch[sheet] = cc.SpriteBatchNode.create(sheet);
                jc.spriteBatch[sheet].sheet = sheet;
                jc.spriteBatch[sheet].retain();
            }

            this.batch = jc.spriteBatch[sheet];
        }

        if (plist instanceof Array){
            _.each(plist, function(plistitem){
                cc.SpriteFrameCache.getInstance().addSpriteFrames(plistitem);
                jc.parsed[plistitem] = true;
            });
        }else if (!jc.parsed[plist]){
            cc.SpriteFrameCache.getInstance().addSpriteFrames(plist);
            jc.parsed[plist] = true;
        }

        this.effects = {};
        jc.log(['batching'], 'init from frame');
        var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(firstFrame);
        if (!frame){
            throw firstFrame + " for sprite: " + config.name + " was not found.";
        }
		this.initWithSpriteFrame(frame);
        jc.log(['batching'], 'add child to batch');

        if (jc.config.batch){
            this.batch.addChild(this);
        }

        this.retain(); //j03m fix leak
        this.type = config.type;
        if(this.type != 'background'){
            this.initHealthBar();
            this.initShadow();
            this.scheduleUpdate();
        }

        this.debug = false;

        //if we don't have a behavior, default to tank
        if (!config.behavior){
            config.behavior = 'tank';
        }

        //look up behavior
        var behaviorClass = BehaviorMap[config.behavior];
        if (!behaviorClass){
            throw 'Unrecognized behavior name: ' + config.behavior;
        }


        this.gameObject = new jc.GameObject();
        if(config.gameProperties){
            _.extend(this.gameObject, config.gameProperties);
        }
        this.gameObject.init();


        var behavior = new behaviorClass(this);

        this.behavior = behavior;
        this.behaviorType = config.behavior;

        this.getTexture().generateMipmap();

		return this;
	},
    ready: function(){
        this.isReady = true;
        this.updateHealthBarPos();
        this.updateShadowPosition();
        this.setVisible(true);

    },
    die:function(){
        this.imdeadman=true;
        this.layer.removeChild(this, true);
        this.healthBar.setVisible(false);
    },
    fallToShadow:function(){
        var pos = this.shadow;
        var moveDiff = cc.pSub(pos, this.getPosition());
        var distanceToMove = cc.pLength(moveDiff);
        var moveDuration = distanceToMove/this.gameObject.speed;
        var action = cc.MoveTo.create(pos, moveDuration);
        this.runAction(action);
    },
    disableHealthBar:function(){
        this.hideHealthbar = true;
    },
    initShadow:function(){
        this.updateShadowPosition();
    },
    initHealthBar:function(){
        if (!this.healthBar){
            this.healthBar = cc.DrawNode.create();
            this.healthBar.retain(); //j03m fix leak
            this.healthBar.contentSize = cc.size(this.HealthBarWidth, this.HealthBarHeight);
            this.healthBar.name = "healthBar";
            this.layer.addChild(this.healthBar);
        }

        this.updateHealthBarPos();
    },
    reset: function(){
        this.clearEffects();
        this.removeAllChildren(true);
        this.behavior.reset();

        this.gameObject.hp = this.gameObject.MaxHP;
        this.initHealthBar();
        this.healthBar.setVisible(true);
        this.drawHealthBar();

    },
	cleanUp: function(){
		if (this.currentMove){
            this.stopAction(this.currentMove);
            this.currentMove.release();
            this.currentMove = undefined;
        }

        //this.stopAction(this.animations[this.state].action);
		this.state = -1;
        this.layer.removeChild(this.healthBar, true);
        for(var i =0; i<this.animations.length; i++){
			this.animations[i].action.release();
		}
        //this.batch.release();

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
            action.retain(); //j03m fix leak
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
    getTargetRadius:function(){
        return this.gameObject.targetRadius * jc.characterScaleFactor;
    },
    getTargetRadiusY:function(){
        if (this.behaviorType == 'range' || this.behaviorType == 'healer'){
            return this.gameObject.targetRadius* jc.characterScaleFactor;
        }else{
            return (this.gameObject.targetRadius/2) *  jc.characterScaleFactor;

        }

    },
    removeAnimation:function(name){
        if (this.effectAnimations && this.effectAnimations[name]){
            this.effectAnimations[name].sprite.stopAction(this.effectAnimations[name].animation);
            this.removeChild(this.effectAnimations[name].sprite, false);
            this.effectAnimations[name].playing = false;
        }


    },
    getSeekRadius: function(){
        return this.gameObject.seekRadius;
    },
    getBasePosition:function(){
        //get the position of this sprite, push the y coord down to the base (feet)
        var point = this.getPosition();
        var box = this.getContentSize();
        point.y -= box.height/2;
        return point;
    },
    setBasePosition:function(point){
        if (!this.box){
            this.box = this.getContentSize();
        }

        point.y += this.box.height/2;
        if (!this.lastPoint){
            this.layer.reorderChild(this, point.y*-1);
            this.lastPoint = point;
        }else{
            var diff = Math.abs(this.lastPoint.y - point.y);
            if (diff > 25 * jc.characterScaleFactor) {
                this.layer.reorderChild(this, point.y*-1);
                this.lastPoint = point;
            }
        }
        point.x = Math.ceil(point.x);
        point.y = Math.ceil(point.y);
        this.setPosition(point);

        this.updateHealthBarPos();
        this.updateShadowPosition();

        if (this.id){ //if i hae an id that means we're tracking slices
            this.layer.trackSlice(this.id, this.team, this.gameObject.movementType, this, point);
        }

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
    isAlive: function(){
        if (this.gameObject.hp>0){
            return true;
        }else{
            return false;
        }
    },
	moveEnded: function(){
		this.setState(this.idle);
		this.stopAction(this.currentMove);		
	},
	animationDone:function(){
        var call;
        if (this.animations[this.state].callback){
            call = this.animations[this.state].callback;
        }
        //this.setState(this.nextState);
        if (call){
            call(this.nextState);
        }
	},
    getState:function(){
        return this.state;
    },
    addEffect:function(effect){
        this.effects[effect.name]= effect;
    },
    removeEffect:function(effect){
        delete this.effects[effect];
    },
    clearEffects:function(){
        this.effects = {};
    },
	setState:function(state, callback){
        if (!state){
            throw "Undefined state passed to setState";
        }
		//catch next state and current state
        var currentState = this.state;
		this.state = state;

        if (this.state == 'dead'){
            this.setZOrder(jc.shadowZOrder+1);
        }

        jc.log(['sprite', 'state'],"State Change For:" + this.name + ' from:' + currentState + ' to:' + this.state);

        //no need to do anything
        if (this.state == currentState){
			jc.log(['sprite', 'state'],"Trying to set a state already set, exit");
			return;
		}

        //if I'm dead, return state shouldn't be idle
        if (this.isAlive()){
            this.nextState = 'idle';
        }else{
            this.nextState = 'dead';
        }


        //make sure start state is known
        var startMe = this.animations[this.state];
        var stopMe = this.animations[currentState];
        if (!startMe){
            throw "Couldn't start state. What is state: " + this.state + " currentState:" + currentState;
        }

        //capture callback if one is provided
        startMe.callback = callback;

        //if this isn't my first state call, we need to stop an action
        if (currentState != -1){
            //make sure the stop state exists
            if (!stopMe){
                throw "Couldn't stop state. What is currentState:" + currentState;
            }
            jc.log(['sprite', 'state'],"Stopping action.");
            if(stopMe.action){
                this.stopAction(stopMe.action);
            }
		}

        jc.log(['sprite', 'state'],"Starting action.");
        if (startMe.action){
            this.runAction(startMe.action);
        }

        if (this.type!='background'){
            this.updateHealthBarPos();
            this.updateShadowPosition();
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
    think:function(dt, selected){
        this.behavior.think(dt, selected);
    },
    drawBorders:function(){

        var position = this.getBasePosition();
        var rect = this.getTextureRect();
        if (!this.debugTextureBorder){
            this.debugTextureBorder = cc.DrawNode.create();
            this.layer.addChild(this.debugTextureBorder);
            position.x = position.x - rect.width/2;
            this.debugTextureBorder.setPosition(position);
        }

        var color = cc.c4f(0,0,0,0);
        var border = cc.c4f(35.0/255.0, 28.0/255.0, 40.0/255.0, 1.0);

        this.debugTextureBorder.clear();
        this.drawRect(this.debugTextureBorder, this.getTextureRect(), color, border,4);

    },
    drawRect:function(poly, rect, fill, border, borderWidth){
        var height = rect.height;
        var width = rect.width;
        var vertices = [cc.p(0, 0), cc.p(0, height), cc.p(width, height), cc.p(width, 0)];
        poly.drawPoly(vertices, fill, borderWidth, border);
    },
    drawHealthBar: function(){
        jc.log(['healthbar'], "hide health bar?" + this.hideHealthbar);
        if (!this.hideHealthbar){
            jc.log(['healthbar'], "healthbar");
            this.healthBar.clear();
            var verts = [];
            verts[0] = cc.p(0.0, 0.0);
            verts[1] = cc.p(0.0, this.HealthBarHeight - 1.0);
            verts[2] = cc.p(this.HealthBarWidth - 1.0, this.HealthBarHeight - 1.0);
            verts[3] = cc.p(this.HealthBarWidth - 1.0, 0.0);

            var clearColor = cc.c4f(255.0/255, 0.0, 0.0, 1.0);
            var fillColor;
            if (!this.healthBarColor){
                fillColor = cc.c4f(26.0/255.0, 245.0/255.0, 15.0/255.0, 1.0);
            }else{
                fillColor = this.healthBarColor;
            }

            var borderColor = cc.c4f(35.0/255.0, 28.0/255.0, 40.0/255.0, 1.0);

            this.healthBar.drawPoly(verts,clearColor,0.7, borderColor);

            var verts2 = [];
            var hpRatio = this.gameObject.hp/this.gameObject.MaxHP;
            if (hpRatio <0){
                hpRatio = 0;
            }

            verts2[0] = cc.p(0.0, 0.0);
            verts2[1] = cc.p(0.0, this.HealthBarHeight - 1.0);
            verts2[2] = cc.p((this.HealthBarWidth - 2.0)* hpRatio + 0.5, this.HealthBarHeight - 1.0);
            verts2[3] = cc.p((this.HealthBarWidth - 2.0)* hpRatio + 0.5, 0.0);


            this.healthBar.drawPoly(verts2,fillColor,0.7, borderColor);
            jc.log(['healthbar'], "healthbar");
        }
    },
    update:function(){
        this.drawHealthBar();
    },
    updateHealthBarPos:function(){
        if (this.type != 'background' && this.isVisible()){
            var myPos = this.getBasePosition();
            var tr = this.getTextureRect();
            myPos.y += tr.height + 10;
            myPos.x -= this.HealthBarWidth/2;
            this.healthBar.setPosition(myPos);

        }
    },
    updateShadowPosition:function(){
        if (this.type!='background'){
            var pos = this.getBasePosition();
            if (this.gameObject && this.gameObject.flightAug){
                pos.y-= this.gameObject.flightAug.y/2; //for flight, shadow should be further away
            }

            this.shadow = pos;
        }
    }
});

//jc.Sprite.remapAnimations = function(character){
//    jc.Sprite.getMinMax(character);
//    var total = config.endFrame - character.startFrame;
//    for (var anim in character.animations){
//        character.animations[anim].start = (character.animations[anim].start+1) - character.startFrame; //normalize to 1
//        character.animations[anim].end = (character.animations[anim].end+1) - character.startFrame;
//    }
//
//}

jc.Sprite.getMinMax = function(character){
    var min = 99999;
    var max = -1;
    for (var anim in character.animations){
        if (character.animations[anim].start < min){
            min = character.animations[anim].start;
        }
        if (character.animations[anim].end > max){
            max = character.animations[anim].end;
        }
    }

    if (min == 99999){
        throw "something wrong..."

    }
    if (max == 99999){
        throw "something wrong..."
    }

    character.startFrame = min;
    character.endFrame = max;
}



jc.Sprite.spriteGenerator = function(allDefs, def, layer){

    //get details for sprite def
    var character = allDefs[def];

    if (!character){
        throw "Character not found: " + def;
    }

    //make a sprite
    var sprite = new jc.Sprite();

    //set the layer
    sprite.layer= layer;

    //nameformat
    var nameFormat = character.name + ".{0}.png";

    //if this character is inherited, find the parent
    if (character.inherit){
        //find who we inherit from, copy everything that doesn't exist over.
        var nameSave = character.name;
        _.extend(character, allDefs[character.inherit]);
        character.name = nameSave;
        character.parentOnly = undefined;
    }

    //are we brokified?
    if (character['animations']== undefined){
        throw def + " has a malformed configation. Animation property missing.";
    }


    //remap animations
    //jc.Sprite.remapAnimations(character);

    //what is our init frame?
    var firstFrame = character.animations['idle'].start;

    //make a game object, merge with props
    var gameObject = new jc.GameObject();
    _.extend(gameObject,character.gameProperties);

    //init
    character.type = 'character';
    sprite.initWithPlist(g_characterPlists[def], g_characterPngs[def], nameFormat.format(firstFrame), character);

    //create definitions from the animation states
    for (var animation in character.animations){
        //use this to create a definition in the sprite
        var useThis = jc.clone(character.animations[animation]);
        useThis.nameFormat = nameFormat; //jack this in.
        useThis.state = animation;
        sprite.addDef(useThis);
        if (animation == 'idle'){
            sprite.idle = animation;
        }
        if (animation == 'move'){
            sprite.moving = animation;
        }

    }

    //create an effect sprite and attach it if it exists.
    if (character.effect){
        jc.playEffectOnTarget(character.effect, sprite, layer, true);
    }

    //return the sprite

    return sprite;
}



jc.randomNum= function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}