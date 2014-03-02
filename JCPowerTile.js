jc.PowerTile = jc.CompositeButton.extend({
    tileSize:cc.size(50,50),
    borderPos: cc.p(130,130), //wtf is wrong with cocos positioning
    coolCheck: 0.05,
    initTile:function(){
        this.initWithSpriteFrameName("EmptyIcon.png");
        var cs = this.getContentSize();
        this.setScale(this.tileSize.width/cs.width, this.tileSize.height/cs.height);

        this.border = jc.makeSimpleSprite("powerFrame.png");
        this.addChild(this.border, 10);
        this.border.setPosition(this.borderPos); //wtf is wrong with cocos positioning

        this.onTouchBegan = this.touchBeganOverride;
        this.onTouchEnded = this.touchEndedOverride;


    },
    initFromName:function(name, parentLayer){
        if (!name){
            return;
        }
        this.parentLayer = parentLayer;
        this.name = name;
        cc.SpriteFrameCache.getInstance().addSpriteFrames(powerTiles[name].plist);
        var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(powerTiles[name].icon);
        this.setDisplayFrame(frame);
        this.on=true;

    },
    setSelected:function(){
        //apply the touched border sprite
        var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame("powerFrameSelected.png");
        this.border.setDisplayFrame(frame);

    },
    setUnselected:function(){
        //apply the touched border sprite
        var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame("powerFrame.png");
        this.border.setDisplayFrame(frame);
    },
    onTouch:function(){
        //if I'm cooling down, just exit
        if (this.cooling){
            return;
        }

        if (!this.on){
            return;
        }

        this.cooling = true;

        var shadeOp = 225;

        this.parentLayer.setSelected(this);

        //get config
        var config = powerTiles[this.name];
        this.executed = Date.now();
        var func = globalPowers[config['offense']].bind(this);
        if (config.type == "direct"){
            hotr.arenaScene.layer.nextTouchDo(function(touch, sprites){
                func(touch, sprites);
                jc.shade(this, shadeOp);
                this.parentLayer.scheduleThisOnce(this.doCoolDown.bind(this),this.coolCheck);
            }.bind(this));

        }else if (config.type == "global"){
            func();
            jc.shade(this, shadeOp);
            this.parentLayer.scheduleThisOnce(this.doCoolDown.bind(this),this.coolCheck);
        }else{
            throw "Unknown power type.";
        }

        return false;
    },
    doCoolDown:function(){
        var config = powerTiles[this.name];
        var time = Date.now() - this.executed;

        var ratio = time/config.cooldown;
        if (ratio >=1){
            this.shade.setContentSize(cc.size(this.tileSize.width, this.tileSize.height));
            this.cooling = false;
            jc.unshade(this);
        }else{
            //reduce height of this.shade by the percent of the cooldown that has passed
            var size = this.shade.getBoundingBox().size;
            size.height = this.tileSize.height - (this.tileSize.height* ratio);
            this.shade.setContentSize(size);
            this.parentLayer.scheduleThisOnce(this.doCoolDown.bind(this),this.coolCheck);

        }





    },
    touchBeganOverride: function(touch){
        if(this.frameCheck(touch)){
            return true;
        }
    },
    touchEndedOverride: function(touch) {
        if(this.frameCheck(touch)){
            if (this.onTouch && !this.paused){
                this.onTouch();

            }
            return true;
        }else{
            return false;
        }
    }

});

//place border

//place power behind border

//if power empty or length < display empty power

//add to sprite touch

//flash and fade (jc.utils)
