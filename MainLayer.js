var MainLayer = cc.Layer.extend({
	ryu: null,
	ryuBatch: null,
	wizardBatch: null,
	wizards: [],
	init: function() {
		if (this._super()) {

			if ('mouse' in sys.capabilities) {
				this.setMouseEnabled(true);
			} else {
				this.setTouchMode(cc.TOUCH_ALL_AT_ONCE);
				this.setTouchEnabled(true);
			}
			JCSprite.init();

			cc.log("ryuPlist:" + ryuPlist);
			cc.SpriteFrameCache.getInstance().addSpriteFrames(ryuPlist);
			cc.SpriteFrameCache.getInstance().addSpriteFrames(wizardPlist);
			//make tilemap
			//make ryu
			//make wizards
			this.ryuBatch = cc.SpriteBatchNode.create(ryuSheet);
			this.ryu = cc.Sprite.createWithSpriteFrameName("stance00.png");
			var animFrames = [];
			var str = "";
			var frame;
			for (var i = 0; i < 8; i++) {
				str = "stance0" + i + ".png";
				frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
				animFrames.push(frame);
			}

			var animation = cc.Animation.create(animFrames, 0.05);
			this.stance = cc.RepeatForever.create(cc.Animate.create(animation));
			this.ryu.runAction(this.stance);
			i = 0;
			for (i = 0; i < 8; i++) {
				str = "walkf0" + i + ".png";
				frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
				animFrames.push(frame);
			}
			var animation = cc.Animation.create(animFrames, 0.05);
			this.walk = cc.RepeatForever.create(cc.Animate.create(animation));


			this.ryuBatch.addChild(this.ryu);
			this.addChild(this.ryuBatch);
			this.ryu.setPosition(cc.p(100, 100));

			this.wizardBatch = cc.SpriteBatchNode.create(wizardSheet);
			var wizFrames = [];
			for (var i = 0; i < 24; i++) {
				str = "wizard.Idle." + i + ".new.png";
				frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
				wizFrames.push(frame);
			}
			animation = cc.Animation.create(wizFrames, .05);

			//wizards
			var size = cc.Director.getInstance().getWinSize();;

			for (var i = 0; i < 80; i++) {
				this.wizards.push(cc.Sprite.createWithSpriteFrameName("wizard.Idle.0.new.png"));
				this.wizards[i].runAction(cc.RepeatForever.create(cc.Animate.create(animation)));
				this.wizardBatch.addChild(this.wizards[i]);
				var x = Math.floor(Math.random() * size.width);
				var y = Math.floor(Math.random() * size.height);
				this.wizards[i].setPosition(cc.p(x, y));
			}
			this.addChild(this.wizardBatch);

			return true;
		} else {
			return false;
		}
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
