
var MainLayer = cc.Layer.extend({
	ryu: null,
	ryuBatch: null,
	wizardBatch: null,
	wizards: [],
	stateIdle: 0,
	stateWalking: 1,
	statePunching: 2,
	init: function() {
		if (this._super()) {
			this.tileMapAndHero();
			
			//make 80 wizards arranged in a circle around ryu
			
			//onmouse or touch move ryu
		
			return true;
		} else {
			return false;
		}
	},
	tileMapAndHero: function(){
		//make ryu
		var size = cc.Director.getInstance().getWinSize();;
		this.ryu = new jc.Sprite();
		this.ryu.initWithPlist(ryuPlist, ryuSheet, 'stance00.png');
		var idle = {
			state:this.stateIdle,
			nameFormat:"stance0%d.png",
			frames: 9,
			delay:.1,
			type:jc.AnimationTypeLoop			
		};
		
		var walk = {
			state:this.stateWalking,
			nameFormat:"walkf0%d.png",
			frames: 9,
			delay:.1,
			type:jc.AnimationTypeLoop			
		};		
		
		var punch = {
			state:this.statePunching,
			nameFormat:"walkf0%d.png", //todo change me
			frames: 9,
			delay:.1,
			type:jc.AnimationTypeOnce
		};
		
				
		this.ryu.addDef(idle);
		this.ryu.addDef(walk);
		this.ryu.addDef(punch);	
		this.ryu.idle = this.stateIdle;
		this.ryu.moving = this.stateWalking;	
		this.ryu.setState(this.ryu.idle);
		this.addChild(this.ryu.batch);
		this.addChild(this.ryu);
		this.ryu.centerOn({x:300,y:300}, size.width/2, size.height/2, 150,150);
		
	},
	onTouchBegan: function(touch, event) {
		//todo convert to [], move sprite
		var pos = touch[0].getLocation();
		var id = touch[0].getId();
		cc.log("onTouchBegan at: " + pos.x + " " + pos.y + " Id:" + id);
		return true;
	},
	onTouchMoved: function(touch, event) {
		var pos = touch[0].getLocation();
		var id = touch[0].getId();
		cc.log("onTouchBegan at: " + pos.x + " " + pos.y + " Id:" + id);
		return true;

	},
	onTouchEnded: function(touch, event) {
		var pos = touch[0].getLocation();
		var id = touch[0].getId();
		cc.log("onTouchBegan at: " + pos.x + " " + pos.y + " Id:" + id);

		//animate ryu
		//move ryu
		return true;

	},
	onMouseDown: function(event) {
		var pos = event.getLocation();
		this.animateRyu(pos);
		cc.log("onMouseDown at: " + pos.x + " " + pos.y);
		this.ryu.stopAction(this.stance);
		this.ryu.runAction(this.walk);
	},
	onMouseDragged: function(event) {
		var pos = event.getLocation();
		cc.log("onMouseDragged at: " + pos.x + " " + pos.y);
	},
	onMouseUp: function(event) {
		var pos = event.getLocation();
		cc.log("onMouseUp at: " + pos.x + " " + pos.y);
		this.ryu.stopAction(this.walk);
		this.ryu.runAction(this.stance);
	},
	onRightMouseDown: function(event) {
		var pos = event.getLocation();
		cc.log("onRightMouseDown at: " + pos.x + " " + pos.y);
	},
	onTouchCancelled: function(touch, event) {
		var pos = touch[0].getLocation();
		var id = touch[0].getId();
		cc.log("onTouchBegan at: " + pos.x + " " + pos.y + " Id:" + id);
		return true;
	},
	animateRyu: function(pos) {


	}

});




MainLayer.create = function() {
	var ml = new MainLayer();
	if (ml && ml.init()) {
		return ml;
	} else {
		throw "Couldn't create the main layer of the game. Something is wrong.";
	}
	return null;
};

MainLayer.scene = function() {
	var scene = cc.Scene.create();
	var layer = MainLayer.create();
	scene.addChild(layer);
	return scene;
};
