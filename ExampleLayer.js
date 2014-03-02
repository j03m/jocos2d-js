var Consts = {};
Consts.stateIdle=0;
Consts.stateWalking=1;
Consts.statePunching=2;
var ExampleLayer = cc.Layer.extend({
	ryu: null,
	ryuBatch: null,
	wizardBatch: null,
	badguys: [],
	init: function() {
		if (this._super()) {
			
			//make tilemap
			this.tilemap();
			
			//make ryu
			this.hero();
						
			//make 80 wizards arranged in a circle around ryu
			this.baddies();
									
			//onmouse or touch move ryu
			this.wireInput();
			
			this.lastFlip = 0;
			this.scheduleUpdate();
			
		
			return true;
		} else {
			return false;
		}
	},
	wireInput: function(){
		if ('mouse' in sys.capabilities) {
            jc.log(['general'], 'mouse capabilities detected');
			this.setMouseEnabled(true);
		} else {
            jc.log(['general'], 'defaulting to touch capabilities');
			this.setTouchEnabled(true);
		}
	},
	baddies: function(){
		var numBaddies = 3;
	    for (var i=0; i<numBaddies; i++){
	        var sliceSize = 360/numBaddies; //size of slice
			this.makeAndPlaceBaddy(sliceSize*i);
	    }
	 
	},
	makeAndPlaceBaddy: function(angle){
		var spriteGen = [this.makeAndPlaceAlex.bind(this), this.makeAndPlaceOrge.bind(this), this.makeAndPlaceIbuki.bind(this), this.makeAndPlaceWizard.bind(this)];
		var number = Math.floor(Math.random()*spriteGen.length);
		spriteGen[number](angle);
	},
	makeAndPlaceSprite: function(states, name, start, plist, png, angle){		
			var baddy = new jc.Sprite();
			baddy.initWithPlist(plist,png, start, name+angle);
			baddy.addDef(states.idle);
			baddy.addDef(states.walk);
			baddy.setPosition(this.getSpot(this.ryu.getPosition(),angle));
			baddy.idle = Consts.stateIdle;
			baddy.moving = Consts.stateWalking;
			baddy.setState(Consts.stateIdle);
			this.badguys.push(baddy);
			this.addChild(baddy.batch);			
			this.addChild(baddy);
	},
	makeAndPlaceAlex: function(angle){
		var states = {
			idle:{
				state:Consts.stateIdle,
				nameFormat:'stance{0}.png',
				frames:11,
				delay:0.03,
				type:jc.AnimationTypeLoop			
			},
			walk:{
				state:Consts.stateWalking,
				nameFormat:'walkf0{0}.png',
				frames:10,
				delay:0.03,
				type:jc.AnimationTypeLoop						
			}
		};
		this.makeAndPlaceSprite(states, 'alex', 'stance00.png', alexPlist, alexSheet, angle);
	},
	makeAndPlaceOrge: function(angle){
			var states = {
				idle:{
					state:Consts.stateIdle,
					nameFormat:'Orge.Idle.{0}.png',
					frames:24,
					delay:0.03,
					type:jc.AnimationTypeLoop			
				},
				walk:{
					state:Consts.stateWalking,
					nameFormat:'Orge.Idle.{0}.png',
					frames:24,
					delay:0.03,
					type:jc.AnimationTypeLoop						
				}
			};
			this.makeAndPlaceSprite(states, 'ogre', 'Orge.Idle.1.png', ogrePlist, ogreSheet, angle);
	},
	makeAndPlaceIbuki: function(angle){
		var states = {
			idle:{
				state:Consts.stateIdle,
				nameFormat:'stance0{0}.png',
				frames:10,
				delay:0.03,
				type:jc.AnimationTypeLoop			
			},
			walk:{
				state:Consts.stateWalking,
				nameFormat:'walkf{0}.png',
				frames:16,
				delay:0.03,
				type:jc.AnimationTypeLoop						
			}
		};
		this.makeAndPlaceSprite(states, 'ibuki', 'stance00.png', ibukiPlist, ibukiSheet, angle);
		
	},
	makeAndPlaceWizard: function(angle){
		var wizStates = {
			idle:{
				state:Consts.stateIdle,
				nameFormat:'wizard.Idle.{0}.new.png',
				frames:24,
				delay:0.03,
				type:jc.AnimationTypeLoop			
			},
			walk:{
				state:Consts.stateWalking,
				nameFormat:'wizard.Run.{0}.new.png',
				frames:24,
				delay:0.03,
				type:jc.AnimationTypeLoop						
			}
		};

		this.makeAndPlaceSprite(wizStates, 'wizard', 'wizard.Idle.1.new.png', wizardPlist, wizardSheet, angle);
	},
	getSpot: function(location,angle){
			var a = angle*(180/Math.PI); //angle to rads
		    var r = 200; //hard coded radius @ 200
		    var x = location.x + r * Math.cos(a);
		    var y = location.y + r * Math.sin(a);
		    return cc.p(x,y);
	},
	hero: function(){
		//make ryu
		var size = cc.Director.getInstance().getWinSize();
		this.ryu = new jc.Sprite();
		this.ryu.initWithPlist(ryuPlist, ryuSheet, 'stance00.png', 'ryu');
		var idle = {
			state:Consts.stateIdle,
			nameFormat:"stance0{0}.png",
			frames: 10,
			delay:.1,
			type:jc.AnimationTypeLoop			
		};
		
		var walk = {
			state:Consts.stateWalking,
			nameFormat:"walkf0{0}.png",
			frames: 11,
			delay:.1,
			type:jc.AnimationTypeLoop			
		};		
		
							
		this.ryu.addDef(idle);
		this.ryu.addDef(walk);

		this.ryu.idle = Consts.stateIdle;
		this.ryu.moving = Consts.stateWalking;	
		this.ryu.setState(this.ryu.idle);
		this.addChild(this.ryu.batch);
		this.addChild(this.ryu);	
		this.ryu.setPosition(this.heroSpawn);
		this.centerOnRyu();
		
	},
	tilemap:function(){
		this.tileMap = cc.TMXTiledMap.create(mapTiles);
		this.background = this.tileMap.getLayer("Background");
		this.addChild(this.tileMap, -1);
		this.heroSpawn = this.getHeroSpawn();		
	},
	getHeroSpawn:function(){
		var group = this.tileMap.getObjectGroup('Objects');
		if (!group){
			throw "Couldn't get the object group from the tilemap layer.";			
		}else{
			var spawn = group.objectNamed('SpawnPoint');
			return cc.p(spawn['x'], spawn['y']);
		}
	},
	moveHandler:function(){
        jc.log(['move'], 'moveHandler invoked');
        if (this.currentTouch){
        		jc.log(['move'], 'current touch is not null');
        		jc.log(['move'], 'current touch is:' + JSON.stringify(this.currentTouch));
				var touchLocation = this.convertToNodeSpace(this.currentTouch);
        		jc.log(['move'], 'mapped to node touch is:' + JSON.stringify(touchLocation));
				var size = cc.Director.getInstance().getWinSize();
				var velocity = size.width/3.0;
				this.ryu.moveTo(touchLocation, Consts.stateWalking, velocity, this.ryuMoveEnded.bind(this));		
				this.moveBaddiesRandom();		
				this.schedule(this.updateFunction.bind(this));			
		}

	},
	update:function (dt){
		var addMe =1;
		// for(var i = 0; i < 50; i++){
		// 		for(var j = 0; j < 50; j++){
		//             	var res = Math.cos(i) * Math.sin(j);
		// 			if (res>addMe){
		// 				addMe = res;
		// 			}
		// 		}	
		// 	}		

        this.lastFlip+=addMe;
		if (this.lastFlip>50){
			cc.log("*********FLIP");
			this.lastFlip = 0;
			this.moveBaddiesRandom();
			this.cycleBaddy();			

		}
	},
	moveBaddiesRandom:function(){
        for(var i=0;i<this.badguys.length;i++){
			var size = cc.Director.getInstance().getWinSize();
			var randX = Math.floor(Math.random()*size.width);
			var randY = Math.floor(Math.random()*size.height);			
			var velocity = size.width/(Math.floor(Math.random()*10)+5);
			var location = this.convertToNodeSpace(cc.p(randX,randY));
			this.badguys[i].moveTo(location, Consts.stateWalking, velocity);						
		}		
	},
	cycleBaddy:function(){
		var toSplice = Math.floor(Math.random()*this.badguys.length);
		var baddyToCycle = this.badguys.splice(toSplice,1)[0];
		baddyToCycle.cleanUp();
		this.removeChild(baddyToCycle, false);
		baddyToCycle = null;
		this.makeAndPlaceBaddy(Math.floor(Math.random()*360));
		cc.log("*****BAD GUYS:" + this.badguys.length);
	},
	moveBaddies:function(){
		var touchLocation = this.convertToNodeSpace(this.currentTouch);
		var size = cc.Director.getInstance().getWinSize();
		var velocity = size.width/5.0;
		var sliceSize = 360/this.badguys.length;

		for(var i=0;i<this.badguys.length;i++){
			var spot = this.getSpot(touchLocation, sliceSize*i);
			this.badguys[i].moveTo(spot, Consts.stateWalking, velocity);						
		}
	},
	onTouchesBegan: function(touch, event) {
		//todo convert to [], move sprite
		jc.log(['touchcore'], 'Touch began');
		jc.log(['touchcore'], 'Touch is: ' + JSON.stringify(touch[0].getLocation()));
		jc.log(['touchcore'], 'Event is: ' + JSON.stringify(event));
		this.currentTouch = touch[0].getLocation();
		this.moveHandler();
		return true;
	},
	onTouchesMoved: function(touch, event) {
		jc.log(['touchcore'], 'Touch moved');

		this.currentTouch = touch[0].getLocation();
	//	this.schedule(this.moveHandler.bind(this), .05, 1, 0);
		return true;

	},
	onTouchesEnded: function(touch, event) {
		jc.log(['touchcore'], 'Touch ended');
		this.currentTouch = null;
		return true;
	},
	onMouseDown: function(event) {
		jc.log(['mouse'], 'mouse down');
		this.onTouchesBegan([event], event);
		return true;
	},
	onMouseDragged: function(event) {
		jc.log(['mouse'], 'mouse moved');
		this.onTouchesMoved([event], event);
		return true;
	},
	onMouseUp: function(event) {
		jc.log(['mouse'], 'mouse up');
		this.onTouchesEnded([event], event);
		return true;
	},
	onTouchCancelled: function(touch, event) {
		jc.log(['touch'], 'touch cancelled up');
		return true;
	},
	ryuMoveEnded: function(){
		jc.log(['move'], 'ryu move ended');
		this.unschedule(this.updateFunction);
		if (this.currentTouch){
			jc.log(['move'], 'current touch is still defined, re-exec movehandler');
			this.moveHandler();
		}else{
			jc.log(['move'], 'returning ryu to idle');
			this.ryu.setState(Consts.stateIdle);
		}
	},
	updateFunction: function(){
		this.centerOnRyu();
	},
	centerOnRyu:function(){
		this.setViewCenter(this.ryu.getPosition());		
	},
	setViewCenter:function(point){
		var size = cc.Director.getInstance().getWinSize();
		var x = Math.max(point.x, size.width/2);
		var y = Math.max(point.y, size.height/2);
		x = Math.min(x, (this.tileMap.getMapSize().width* this.tileMap.getTileSize().width)-size.width/2);
		y = Math.min(y, (this.tileMap.getMapSize().height* this.tileMap.getTileSize().height)-size.height/2);
		var actualPosition = cc.p(x,y);
		var centerOfView = cc.p(size.width/2,size.height/2);
		var viewPoint = cc.pSub(centerOfView, actualPosition);
		this.setPosition(viewPoint);	
	}

});

ExampleLayer.create = function() {
	var ml = new ExampleLayer();
	if (ml && ml.init()) {
		return ml;
	} else {
		throw "Couldn't create the main layer of the game. Something is wrong.";
	}
	return null;
};

ExampleLayer.scene = function() {
	var scene = cc.Scene.create();
	var layer = ExampleLayer.create();
	scene.addChild(layer);
	return scene;
};

