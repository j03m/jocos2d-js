var jc = jc || {};
jc.CompositeButton = cc.Sprite.extend({
    initWithDefinition:function(def, onTouch){
        if (!def){
            throw "Must supply a definition";
        }
        if (!def.main){
            throw "Must supply main button state.";
        }
        if (!def.pressed){
            throw "Must supply pressed button state.";
        }
        this.def = def;
        this.onTouch = onTouch;
        this.initWithSpriteFrameName(def.main);
        if (this.def.subs){
            for(var i=0; i<def.subs.length;i++){
                var child = cc.Sprite.create();
                child.initWithSpriteFrameName(def.subs[i].name);
                this.addChild(child);
                child.setPosition(cc.p(def.subs[i].x,def.subs[i].y));
            }
        }
        if (this.def.text){
            this.label = cc.LabelTTF.create(this.def.text, this.def.font, this.def.fontSize);
            this.addChild(this.label);
            var size = this.getContentSize();
            this.label.setPosition(cc.p(size.width/2, size.height/2));
        }
        this.scheduleUpdate();
    },
    onEnter: function(){
        if ('mouse' in sys.capabilities) {
            cc.Director.getInstance().getMouseDispatcher().addMouseDelegate(this, 0);
        } else {
            cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, 0, true);
        }
    },
    onExit: function(){
        if ('mouse' in sys.capabilities) {
            cc.Director.getInstance().getMouseDispatcher().removeMouseDelegate(this);
        } else {
            cc.Director.getInstance().getTouchDispatcher().removeDelegate(this);
        }
    },
    onTouchBegan: function(touch) {
        if(this.frameCheck(touch)){
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(this.def.pressed);
            this.setDisplayFrame(frame);
            return true;
        }else{
            return false
        }
    },
    frameCheck:function(touch){

        if (this.isVisible() && this.isTouchInside(touch)){
            return true;
        }else{
            return false;
        }

    },
    getTouchLocation:function (touch) {
        var touchLocation = this.getParent().convertToNodeSpace(touch);  // Convert to the node space of this class

        return touchLocation;
    },
    isTouchInside:function (touch) {
        //todo: these touches not registering on mobile - debug with safari
        if (touch instanceof Array){
            touch= touch[0].getLocation()
        }else{
            touch= touch.getLocation();
        }

        return cc.rectContainsPoint(this.getBoundingBox(), this.getTouchLocation(touch));
    },
    onTouchMoved: function(touch) {
        return false;
    },
    onTouchEnded: function(touch) {
        if(this.frameCheck(touch)){
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(this.def.main);
            this.setDisplayFrame(frame);
            if (this.onTouch && !this.paused){
                this.onTouch();
            }
            return true;
        }else{
            return false;
        }
    },
    onMouseDown: function(event) {
        return this.onTouchBegan(event);
    },
    onMouseUp: function(event) {
        return this.onTouchEnded(event);
    },
    setTouchDelegate:function(inFunc){
        this.onTouch = inFunc;
    },
    pause:function(){
        this.paused = true;
    },
    resume:function(){
        this.paused = false;
    }


});