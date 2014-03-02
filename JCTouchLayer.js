var jc = jc || {};
jc.defaultTransitionTime = 0.25;
jc.defaultFadeLevel = 140;
jc.defaultNudge = 150 * jc.assetScaleFactor;
jc.touchEnded = 'end';
jc.touchBegan = 'began';
jc.touchMoved = 'moved';
jc.touchCancelled = 'cancel';
jc.touchPriorityNormal  = 3;
jc.touchPriorityButton  = 2;
jc.touchPriorityMask  = 0;
jc.touchPriorityLow  = 5;
jc.TouchLayer = cc.Layer.extend({
    init: function(touchPriority) {
        if (this._super()) {

            this.winSize =  jc.actualSize;
            this.superDraw = this.draw;
            this.draw = this.childDraw;
            this.superOnEnter = this.onEnter;
            this.onEnter = this.childOnEnter;
            this.superOnExit = this.onExit;
            this.onExit = this.childOnExit;
            this.touchTargets=[];
            if (touchPriority==undefined){
                touchPriority = jc.touchPriorityNormal;
            }
            this.priority = touchPriority;
            this.retain();
            return true;
        } else {
            return false;
        }
    },
    bubbleAllTouches:function(val){
        this.bubbleAll = val;
    },
    childOnEnter:function(){
        this.superOnEnter();
        this.wireInput(true);
        this.onShow();
    },
    hackOn:function(){
        this.wireInput(true);
        this.onShow();
    },
    hackOff:function(){
        this.wireInput(false)
        this.onHide();
    },
    childOnExit:function(){
        this.superOnExit();
        this.wireInput(false)
        this.onHide();
    },
    onShow:function(){},
    onHide:function(){},
    wireInput: function(val){
        if ('mouse' in sys.capabilities) {
            if (val){
                cc.Director.getInstance().getMouseDispatcher().addMouseDelegate(this, this.priority);
            }else{
                cc.Director.getInstance().getMouseDispatcher().removeMouseDelegate(this);
            }
        } else {
            if (val){
                cc.registerStandardDelegate(this,this.priority);
                //cc.registerTargetedDelegate(0,true, this);
                //cc.Director.getInstance().getTouchDispatcher()._addTargetedDelegate(this, 1, true);
            }else{
                cc.unregisterTouchDelegate(this);
                //cc.Director.getInstance().getTouchDispatcher()._removeDelegate(this);
            }
        }
    },
    onTouchesBegan: function(touches) {
        var claimed = this.hitSpriteTarget(jc.touchBegan, touches);
        jc.log(['TouchClaims'], "Touch Began: " + claimed + " name: " + this.name);
        return claimed;

    },
    onTouchesMoved: function(touches) {
        var claimed = this.hitSpriteTarget(jc.touchMoved, touches);
        jc.log(['TouchClaims'], "Touch Moved: " + claimed + " name: " + this.name);
        return claimed;

    },
    onTouchesEnded: function(touches) {
        var claimed = this.hitSpriteTarget(jc.touchEnded, touches);
        jc.log(['TouchClaims'], "Touch Ended: " + claimed + " name: " + this.name);
        return claimed;
    },
    onMouseDown: function(event) {
        return this.onTouchesBegan(event);

    },
    onMouseDragged: function(event) {
        return this.onTouchesMoved(event);

    },
    onMouseUp: function(event) {
        return this.onTouchesEnded(event);

    },
    onTouchCancelled: function(touch, event,sprite) {
        return this.hitSpriteTarget(jc.touchCancelled, touch);

    },
    targetTouchHandler: function(type, touch, sprites, touches) {
        throw "child must implement!"
    },
    hitSpriteTarget:function(type, touches, event){

        jc.log(['touchcore'], "Raw Touch:" + JSON.stringify(touches));

        var firstTouch = undefined;
        var convertedTouches = []
        if (touches instanceof Array){
            for (var i =0;i<touches.length;i++){
                var convertedTouch = this.touchToPoint(touches[i]);
                convertedTouches.push(convertedTouch);
                if (i==0){
                    firstTouch = convertedTouch;
                }
            }
        }else{
            firstTouch = this.touchToPoint(touches);
        }

        if (firstTouch == undefined){
            throw "Could not get a first touch  - it is undefined!";
        }

        jc.log(['touchcore'], "First Raw Touch Point:" + JSON.stringify(firstTouch));


        if (this.ftueMode && type == jc.touchEnded){
            if (this.pauseFTUE){ //todo implement me

            }else{
                this.showFTUE();
                return true;
            }

        }




        var handled = [];
        for (var i=0;i<this.touchTargets.length;i++){
            var parent = this.touchTargets[i].getParent();
			if (parent){
				var tmpTouch = parent.convertToNodeSpace(firstTouch);
			}else{
				var tmpTouch = this.convertToNodeSpace(firstTouch);
			}
			
            if ( this.touchTargets[i] instanceof jc.Sprite){ //jc.sprites in this game ahve like 512x512 - contentSize + boudningbox are unusable
                var rect = this.touchTargets[i].getTextureRect(); //texture rect gives us a width
                var pos = this.touchTargets[i].getBasePosition(); //base pos gives us bottom middle of sprite
                var cs = {};
                cs.width = rect.width *1.4;
                cs.height = rect.height*1.4;
                cs.x = pos.x - cs.width/2;
                cs.y = pos.y; //y should be bottom already

            }else if ( this.touchTargets[i] instanceof cc.LabelTTF){
                var cs = this.touchTargets[i].getBoundingBox();
                cs.width*=2;
                cs.height*=2;
            }else{
                var cs = this.touchTargets[i].getBoundingBox();
            }

            jc.log(['touchcore'], "Sprite:" + this.touchTargets[i].name);
            jc.log(['touchcore'], "Position:" + JSON.stringify(cs));
            var contains = cc.rectContainsPoint(cs, tmpTouch);

            if (contains){
                handled.push(this.touchTargets[i]);
            }
        }
        //if something of note was touched, raise it
        if ((handled.length>0 || this.bubbleAll) && !this.isPaused){
            return this.targetTouchHandler(type, firstTouch, handled, convertedTouches);
        }
        return false;
    },
    touchToPoint:function(touch){
        if (touch instanceof Array){
            return touch[0].getLocation()
        }else{
            return touch.getLocation();
        }
    },
    darken:function(){
        if (!this.shade){
            this.shade = cc.LayerColor.create(cc.c4(15, 15, 15, 255));
            this.addChild(this.shade);
        }
        this.shade.setPosition(new cc.p(0.0,0.0));

        this.shade.setOpacity(0);
        this.reorderChild(this.shade,0);
        this.fadeIn(this.shade, jc.defaultFadeLevel);
    },
    undarken:function(){
        this.fadeOut(this.shade);
    },
    fadeIn:function(item, opacity , time){
        if (!time){
            time = jc.defaultTransitionTime;
        }
        if (!opacity){
            opacity = jc.defaultFadeLevel;
        }
        if (!item){
            item = this;
        }

        var actionFadeIn = cc.FadeTo.create(time,opacity);
        item.runAction(actionFadeIn);
    },
    fadeOut:function(item, time){
        if (!time){
            time = jc.defaultTransitionTime;
        }
        if (!item){
            item = this;
        }
        var actionFadeOut = cc.FadeTo.create(time,0);
        item.runAction(actionFadeOut);

    },
    slide:function(item, from, to, time, nudge, when, doneDelegate){
        if (!time){
            time = jc.defaultTransitionTime;
        }
        if (!from){
            throw "From point required."
        }

        if (!to){
            throw "To point required."
        }

        item.setPosition(from);
        item.setVisible(true);
        var moveAction;
        var nudgeAction;

        if (!doneDelegate){
            doneDelegate = function(){};
        }
        var callFunc = cc.CallFunc.create(doneDelegate);

        //apply the inNudge first, then main move, then the out nudge
        if (nudge && when=='before'){
            var nudgePos = cc.pAdd(from, nudge); //apply inNudge to from
            moveAction = cc.MoveTo.create(time, to);
            nudgeAction = cc.MoveTo.create(time/2, nudgePos);
            moveAction.retain();
            nudgeAction.retain();
        }else if (nudge && when == 'after'){
            var antiNudge = cc.p(nudge.x*-1, nudge.y*-1);
            var extended = cc.pAdd(to, antiNudge);
            var nudgePos = cc.pAdd(extended, nudge); //apply inNudge to from
            moveAction = cc.MoveTo.create(time, extended);
            nudgeAction = cc.MoveTo.create(time/2, nudgePos);
            moveAction.retain();
        }else{
            moveAction = cc.MoveTo.create(time, to);
            moveAction.retain();
        }

        if (nudgeAction && when == 'before'){
            action = cc.Sequence.create(nudgeAction, moveAction, callFunc);
            item.runAction(action);
            jc.log(['touchlayer'], 'running action - nudge before');
        }else if (nudgeAction && when == 'after'){
            action = cc.Sequence.create(moveAction, nudgeAction, callFunc);
            item.runAction(action);
            jc.log(['touchlayer'], 'running action - nudge after');
        }else if (nudgeAction){
            throw "when var must be before or after";
        }else{
            action = cc.Sequence.create(moveAction, callFunc);
            jc.log(['touchlayer'], 'running action - sans nudge');
            item.runAction(action);
        }


    },
    slideInFromTop:function(item, time, to,doneDelegate){
        var itemRect = this.getCorrectRect(item);
        var fromX = this.winSize.width/2;
        var fromY = this.winSize.height+itemRect.height/2; //offscreen
        if (!to){
            var toX = fromX;
            var toY = this.winSize.height - ((itemRect.height/2)+ jc.defaultNudge);
            to = cc.p(toX, toY);
        }
        this.slide(item, cc.p(fromX,fromY), to, time, cc.p(0,jc.defaultNudge), 'after',doneDelegate);
    },
    slideTopToMid:function(item, time, doneDelegate){
        var itemRect = this.mainFrame.getTextureRect();
        var fromX = this.winSize.width/2;
        var fromY = (this.winSize.height + itemRect.width); //offscreen left
        var toX = fromX;
        var toY = this.winSize.height/2;
        var to = cc.p(toX, toY);
        this.slide(this.mainFrame, cc.p(fromX,fromY), to, jc.defaultTransitionTime, cc.p(0,jc.defaultNudge), "after",doneDelegate);
    },
	slideLeftToMid:function(item, time, doneDelegate){
        var itemRect = item.getTextureRect();
        var fromX = (0 - itemRect.width); //offscreen left
        var fromY = this.winSize.height/2;
        var toX = (this.winSize.width/2)-itemRect.width/2;
        var toY = fromY;
        var to = cc.p(toX, toY);
        this.slide(item, cc.p(fromX,fromY), to, time, cc.p(jc.defaultNudge*-1,0), 'before',doneDelegate);		
	},
	slideRightToMid:function(item, time, doneDelegate){
        var itemRect = item.getTextureRect();
        var fromX = (this.winSize.width + itemRect.width); //offscreen right
        var fromY = this.winSize.height/2;
        var toX = (this.winSize.width/2)+itemRect.width/2;
        var toY = fromY;
        var to = cc.p(toX, toY);
        this.slide(this.rightDoor, cc.p(fromX,fromY), to, time,  cc.p(jc.defaultNudge,0), 'before',doneDelegate);		
	},
    slideOutToTop:function(item, time,to,doneDelegate){
        var itemRect = this.getCorrectRect(item);
        if (!to){
            var toX = this.winSize.width/2;
            var toY = this.winSize.height+itemRect.height/2; //offscreen
            to = cc.p(toX,toY);
        }

        this.slide(item, item.getPosition(), to, time, cc.p(0,jc.defaultNudge * -1), 'before',doneDelegate);
    },
    slideInFromBottom:function(item, time, to,doneDelegate){
        var itemRect = this.getCorrectRect(item);
        var fromX = this.winSize.width/2;
        var fromY = 0 - itemRect.height; //offscreen bottom
        if (!to){
            var toX = fromX;
            var toY = itemRect.height/2 + jc.defaultNudge;;
            to = cc.p(toX, toY);
        }
        this.slide(item, cc.p(fromX,fromY), to, time, cc.p(0,jc.defaultNudge * -1), 'after',doneDelegate);
    },
    slideOutToBottom:function(item, time, to, doneDelegate){
        var itemRect = this.getCorrectRect(item);
        if (!to){
            var toX = this.winSize.width/2;
            var toY = 0 - itemRect.height; //offscreen bottom
            to = cc.p(toX,toY);
        }
        this.slide(item, item.getPosition(), to, time, cc.p(0,jc.defaultNudge), 'before',doneDelegate);
    },
    slideInFromLeft:function(item, time,to,doneDelegate){
        var itemRect = this.getCorrectRect(item);
        var fromX = (0 - itemRect.width); //offscreen left
        var fromY = this.winSize.height/2;
        if (!to){
            var toX = (itemRect.width/2) + jc.defaultNudge;
            var toY = fromY;
            to = cc.p(toX, toY);
        }
        this.slide(item, cc.p(fromX,fromY), to, time, cc.p(jc.defaultNudge * -1,0), 'after',doneDelegate);
    },
    slideOutToLeft:function(item, time, to, doneDelegate){
        var itemRect = this.getCorrectRect(item);
        var from = item.getPosition();
        if (!to){
            var toX = (0 - itemRect.width); //offscreen left

            to = cc.p(toX,from.y);
        }

        this.slide(item, from, to, time, cc.p(jc.defaultNudge,0), 'before',doneDelegate);
    },

    slideInFromRight:function(item, time,to,doneDelegate){
        var itemRect = this.getCorrectRect(item);
        var fromX = (this.winSize.width + itemRect.width); //offscreen left
        var fromY = this.winSize.height/2;
        if (!to){
            var toX = this.winSize.width - ((itemRect.width/2) + jc.defaultNudge);
            var toY = fromY;
            to = cc.p(toX, toY);
        }
        this.slide(item, cc.p(fromX,fromY), to, time, cc.p(jc.defaultNudge,0), 'after',doneDelegate);
    },
    slideOutToRight:function(item, time,to,doneDelegate){
        var itemRect = this.getCorrectRect(item);
        var from = item.getPosition();
        if (!to){
            var toX = (this.winSize.width + itemRect.width); //offscreen left

            to = cc.p(toX, from.y);
        }
        this.slide(item, from, to, time, cc.p(jc.defaultNudge * -1,0), 'before',doneDelegate);
    },
    getCorrectRect:function(item){
        if (item instanceof jc.Sprite){
            return item.getTextureRect();
        }else{
            return item.getContentSize();
        }
    },
    generateSprite:function(nameCreate){
        var sprite;
        sprite = jc.Sprite.spriteGenerator(spriteDefs, nameCreate, this);
        return sprite;
    },
    pause:function () {
        this.isPaused = true;
    },
    resume:function () {
        this.isPaused = false;
    },
    centerPoint:function(){
        return cc.p(this.getContentSize().width * this.getAnchorPoint().x,
            this.getContentSize().height * this.getAnchorPoint().y);
    },
    centerPointOffset:function(point){
            return cc.pAdd(this.centerPoint(),point);
    },
    makeWindow:function(size, spriteName, rect){
        if (!spriteName){
            throw "A window needs a sprite backdrop and a scale9 rect";
        }
        if (!rect){
            rect = cc.rect(45, 45, 350, 600)
        }
        var windowSprite  = cc.Scale9Sprite.create();
        windowSprite.initWithSpriteFrameName(spriteName, rect);
        windowSprite.setContentSize(size);
        windowSprite.setVisible(false);
        return windowSprite;
    },
    childDraw:function(){
        this.superDraw();
        //todo: reserve for later
    },
    drawBorder:function(sprite, color, width){
        var position = sprite.getPosition();
        var rect = sprite.getTextureRect();
        if (!this.drawNode){
            this.drawNode = cc.DrawNode.create();
            this.addChild(this.drawNode);
        }

        position.x = position.x - rect.width/2;
        position.y = position.y - rect.height/2;
        this.drawNode.setPosition(position);

        var fill = cc.c4f(0,0,0,0);
        var border = color;

        this.drawNode.clear();
        this.drawRect(this.drawNode, rect, fill, border,width);

    },
    drawRect:function(poly, rect, fill, border, borderWidth){
        var height = rect.height;
        var width = rect.width;
        var vertices = [cc.p(0, 0), cc.p(0, height), cc.p(width, height), cc.p(width, 0)];
        poly.drawPoly(vertices, fill, borderWidth, border);
    },
    runActionWithCallback: function(action, callback){
        var callbackAction = cc.CallFunc.create(callback);
        var seq = cc.Sequence.create(action, callbackAction);
        this.runAction(seq);
    },
    placeArrowOn:function(item, direction, offset){
        if (direction == "down"){
            var pos = item.getPosition();

            if (this.arrow){
                this.removeChild(this.arrow, true)
            }
            this.arrow = jc.playEffectAtLocation("arrow", cc.p(0,0), jc.topMost, this);
            this.centerThisPeer(this.arrow, item);
            //rotate
            if (direction == "down"){
                this.arrow.setRotation(90);
            }

            var size = this.arrow.getContentSize();
            var isize = item.getTextureRect();
            if (direction == "down"){
                pos.y += size.height + isize.height/2;

            }

            if (direction == "left"){
                pos.x += size.width;
            }

            if (offset){
                pos = cc.pAdd(pos, offset);
            }

            this.arrow.setPosition(pos);
        }
    },
    removeArrow: function(){
        if (this.arrow){
            this.removeChild(this.arrow, true);
        }
    },
    placeArrow:function(position, direction){
        //play effect at location
        if (this.arrow){
            this.removeChild(this.arrow, true)
        }
        this.arrow = jc.playEffectAtLocation("arrow", position, jc.topMost, this);

        //rotate
        if (direction == "down"){
            this.arrow.setRotation(90);
        }

        if (direction == 'left'){
            this.arrow.setRotation(180);
        }

        if (direction == 'up'){
            this.arrow.setRotation(270);
        }

    },
    showFTUE:function(){
        var step = hotr.blobOperations.getFtueStep();
        this.ftueMode = true;
        if (!hotr.subStep){
            hotr.subStep = 0;
        }

        if (step != hotr.currentStep){
            hotr.currentStep = step;
            hotr.subStep = 0;
        }

        continueActions = continueActions.bind(this);
        var tutorialData = tutorialConfig[hotr.currentStep][hotr.subStep];
        if (tutorialData){
            if (tutorialData.exit){
                this.removeTutorialStep(tutorialData.exit, tutorialData.exitDir, continueActions);
            }else{
                continueActions();
            }
        }

        function continueActions(){
            if (tutorialData.type == jc.tutorials.types.character){
                this.showTutorialStep( tutorialData.msg,
                    undefined,
                    tutorialData.direction,
                    tutorialData.actor,
                    undefined,
                    undefined,
                    tutorialData.y
                );
            }

            if (tutorialData.type == jc.tutorials.types.arrow){
                var position = cc.p(tutorialData.location.x*jc.assetScaleFactor, tutorialData.location.y*jc.assetScaleFactor);
                this.placeArrow(position, tutorialData.direction);
            }


            if (tutorialData.type == jc.tutorials.types.action){
                //?
            }


            if (tutorialData.check){
                var func = this[tutorialData.check].bind(this);
                func();
            }

            if (tutorialData.pause){
                this.pauseFTUE = true;
            }

            if (tutorialData.unpause){
                this.pauseFTUE = false;
            }

//            if (tutorialData.hightlightRect){
//                this.clickMask = new jc.LightLayer();
//                this.addChild(this.clickMask);
//                if (tutorialData.hightlightRect instanceof cc.rect){
//                    this.clickMask.init(tutorialData.hightlightRect);
//                }else{
//                    var element = this[tutorialData.hightlightRect];
//                    if (element instanceof Function){
//                        var rect = element();
//                    }else{
//                        var pos = element.getPosition();
//                        var size = element.getContentSize();
//                        var pad = cc.p(0,0);
//                        if (tutorialData.hightlightRectPad){
//                            pad = tutorialData.hightlightRectPad;
//                            pad.x = pad.x * jc.characterScaleFactor;
//                            pad.y = pad.y * jc.characterScaleFactor;
//                        }
//                        var rect = cc.rect(pos.x - pad.x, pos.y+size.height + pad.y, size.width, size.height);
//                    }
//                    this.clickMask.init(rect);
//                }
//
//
//            }

            hotr.subStep++;
        }

    },

    getGuide:function(char){
        if (char == 'girl'){
            return "priestessEarth_pose.png";
        }else if (char == 'orc'){
            return "orc_pose.png";
        }else if (char == 'demon'){
            return "gargoyleFire_pose.png";
        }else if (char == 'dwarf'){
            return "dwarvenKnightEarth_pose.png";
        }else{
            throw "unknown tutorial character...";
        }


    },
    showTutorialStep:function(msg, time, direction, character, callbackIn, callbackOut, yLevel){
        jc.log(['tutorials'], 'showing:' + character);
        if (!this.guideCharacters){
            jc.log(['tutorials'], 'init');
            this.guideCharacters={};
        }

        if (!this.guideCharacters[character]){
            jc.log(['tutorials'], 'making:'+character);
            this.guideCharacters[character] = jc.makeSpriteWithPlist(tutorialPlist, tutorialPng, this.getGuide(character));
            this.guideCharacters[character].setZOrder(jc.topMost+1);
            this.getParent().addChild(this.guideCharacters[character]);
        }

        if (this.guideCharacters[character].guideVisible){
            this.attachMsgTo(msg, character, direction=='left'?'right':'left');
            return;
        }

        var itemRect = this.guideCharacters[character].getContentSize();
        if (character == 'girl'){
            var adjust = 4.5;
        }else if (character == 'orc'){
            var adjust = 3.5;
        }else{
            var adjust = 3.5;
        }

        if (direction == 'right'){
            jc.log(['tutorials'], 'direction:right');

            var fromX = (this.winSize.width + itemRect.width);
            jc.log(['tutorials'], 'fromX:'+fromX);

            var toX = (this.winSize.width +  jc.defaultNudge) - (itemRect.width);
            jc.log(['tutorials'], 'toX:'+toX);

            var nudge =  cc.p(jc.defaultNudge,0);
            jc.log(['tutorials'], 'nudge:'+  jc.defaultNudge);
        }else{
            var fromX = (0 - itemRect.width);
            jc.log(['tutorials'], 'fromX:'+fromX);

            var toX = ((itemRect.width) - jc.defaultNudge);
            jc.log(['tutorials'], 'toX:'+toX);

            var nudge =  cc.p(jc.defaultNudge*-1,0);
            jc.log(['tutorials'], 'nudge:' + jc.defaultNudge);
        }

        if (yLevel != undefined){
            var fromY = yLevel + itemRect.height/2;
        }else{
            var fromY = this.winSize.height/2 -  (itemRect.height/adjust);
        }
        jc.log(['tutorials'], 'fromY:'+fromY);

        if (yLevel != undefined){
            var toY = yLevel + itemRect.height/2;
        }else{
            var toY = fromY -  (itemRect.height/adjust);
        }
        jc.log(['tutorials'], 'toY:'+toY);

        var to = cc.p(toX, toY);

        jc.log(['tutorials'], 'sliding');
        this.slide(this.guideCharacters[character], cc.p(fromX,fromY), to, jc.defaultTransitionTime,nudge, 'after',function(){
            //show ms
            this.guideCharacters[character].guideVisible = true;
            this.attachMsgTo(msg, character, direction=='left'?'right':'left');
            jc.log(['touchlayer'], 'scheduling tutorial removal');
            if(callbackIn){
                callbackIn();
            }
            if (time){
                this.scheduleOnce(function(){
                    this.removeTutorialStep(undefined, callbackOut);
                }.bind(this), time);
            }

        }.bind(this));
    },
    removeTutorialStep: function(character, direction, callback){
        if (!character){
            character = 'girl';
        }
        if (!direction){
            direction = 'left';
        }
        if (this.guideCharacters[character]){
            this.shrinkBubble();
            if (direction == 'right'){
                this.slideOutToRight(this.guideCharacters[character], jc.defaultTransitionTime, undefined, function(){
                    this.guideCharacters[character].guideVisible = false;
                    if (callback){
                        callback();
                    }
                }.bind(this));
            }

            if (direction =='left'){
                this.slideOutToLeft(this.guideCharacters[character], jc.defaultTransitionTime, undefined, function(){
                    this.guideCharacters[character].guideVisible = false;
                    if (callback){
                        callback();
                    }
                }.bind(this));
            }

        }
    },
    attachMsgTo:function(msg, character, where){
        if (this.bubble){
            this.shrinkBubble(function(){
                this.doBubble(msg, character, where);
            }.bind(this));
        }else{
            this.doBubble(msg, character, where);
        }
    },
    doBubble:function(msg, character, where){
        this.bubble = jc.makeSpriteWithPlist(uiPlist, uiPng, "dialog1.png");
        if (where == 'left'){
            this.bubble.setFlippedX(true);
        }
        if(!character) {
            throw "nope, need character now.";
        }

        if (!where){
            throw "nope, need where now.";
        }

        var element = this.guideCharacters[character];
        var elPos = element.getPosition();
        var elSize = element.getContentSize();
        elSize.width += 50 *jc.assetScaleFactor;

        if (this.name == "Arena"){
            var y = this.winSize.height/2;
           // y = y - (y * .25); //move down by 25%
            this.bubble.setPosition(cc.p(this.winSize.width/2, y));
        }else{
            this.bubble.setPosition(cc.p(this.winSize.width/2, this.winSize.height/2));
        }



        var size = this.bubbleMsgSize(msg);
        this.bubble.msg = cc.LabelTTF.create(msg, jc.font.fontName, jc.font.fontSize, size , cc.TEXT_ALIGNMENT_CENTER);
        this.bubble.msg.setColor(cc.black());
        this.bubble.msg.setString(msg);

        this.bubble.msg.retain();
        this.getParent().addChild(this.bubble);
        this.bubble.setZOrder(jc.topMost-1);
        this.getParent().addChild(this.bubble.msg);
        this.bubble.msg.setZOrder(jc.topMost);
        this.bubble.setScale(0.01, 0.01);
        this.centerThisPeer(this.bubble.msg, this.bubble);
//        this.bubble.msg.adjustPosition(20*jc.assetScaleFactor, 50*jc.assetScaleFactor);
        this.popBubble(element, where);

    },
    bubbleMsgSize:function(msg){
        var bubbleSize = this.bubble.getContentSize();
        var lineLen = 25;
        var lineSize = lineLen * jc.font.fontSize;
        if (jc.font.fontSize* msg.length < lineSize){
            return cc.size(jc.font.fontSize* msg.length, jc.font.fontSize);
        }else{
            var times = (jc.font.fontSize * msg.length)/lineSize;
            return cc.size(lineSize, jc.font.fontSize*times);
        }
    },
    msgSize:function(msg){
        return cc.size(jc.font.fontSize* msg.length, jc.font.fontSize);
    },
    popBubble:function(element, where, cb){
        var cs = this.bubble.getContentSize();
        var cs2 = this.bubble.msg.getContentSize();
        var scaleVal = (cs2.width/(cs.width *0.75));
        var scaleValY = (cs2.height)/(cs.height*0.55);
        if (scaleValY < 0.5){
            scaleValY = 0.5;
        }
        scaleVal = Math.max(scaleVal, 1);

        var origPos = this.bubble.getPosition();
        var origSize = this.bubble.getContentSize();
        var scale = cc.ScaleTo.create(1,scaleVal,scaleValY);

        var diff = cs2.width - origSize.width;
        var diffh = cs2.height - origSize.height;
        if (where == 'left' && scaleVal>1){
            origPos.x -= diff/2;
        }else if (where == 'right' && scaleVal > 1){
            origPos.x += diff/2;
        }

        if (scaleValY > 1){
            if (diffh < 0){
                diffh*=-1;
            }
            origPos.y += diffh/2;
        }

        this.bubble.setPosition(origPos);
        origPos.y += 25* jc.assetScaleFactor;
        this.bubble.msg.setPosition(origPos);

        scale.retain();
        var elastic = cc.EaseElasticOut.create(scale, 0.3);
        elastic.retain();
        var func = cc.CallFunc.create(function(){
            if (cb){
                cb();
            }
            jc.log(['bubble'], 'bubble popped!')
            scale.release();
            elastic.release();
            seq.release();
            func.release;

//            var eleBox = element.getBoundingBox();
//            var bubbleBox = this.bubble.getBoundingBox();

//            if (where == 'left'){
//                this.bubble.setPosition(cc.p(bubbleBox.size.width/2 - eleBox.origin.x, bubbleBox.origin.y));
//            }else{
//                this.bubble.setPosition(cc.p(eleBox.origin.x + eleBox.size.width + bubbleBox.size.width/2, bubbleBox.origin.y));
//            }

        }.bind(this));
        func.retain();
        var seq = cc.Sequence.create(elastic, func);
        seq.retain();
        this.bubble.runAction(seq);

    },
    shrinkBubble:function(cb){
        if (!this.bubble){
            if (cb){
                cb();
            }
            return;
        }
        var scale = cc.ScaleTo.create(0.25,0.01,0.01);
        var elastic = cc.EaseElasticOut.create(scale, 0.3);
        this.getParent().removeChild(this.bubble.msg, true);
        var func = cc.CallFunc.create(function(){
            this.getParent().removeChild(this.bubble, true);
            this.bubble.msg.release();
            this.bubble.msg = undefined;
            this.bubble.release();
            this.bubble = undefined;
            jc.log(['bubble'], 'bubble shrunk!')
            if (cb){
                cb();
            }
        }.bind(this));
        var seq = cc.Sequence.create(elastic, func);
        this.bubble.runAction(seq);
        this.bubble.msg.runAction(elastic);
    },
    floatMsg: function(msg){
        if (!this.msgStack){
            this.msgStack = [];
        }
        var floater = cc.LabelTTF.create(msg, jc.font.fontName, jc.font.fontSize, this.msgSize(msg), cc.TEXT_ALIGNMENT_CENTER);
        floater.setColor(cc.red());
        floater.setText(msg);
        floater.retain();
        if (this.msgStack.length!=0){
            var lastLabel = this.msgStack[this.msgStack.length-1];
            var pos = lastLabel.getPosition();
            var nextPos = cc.p(pos.x, pos.y + (50*jc.assetScaleFactor));
            floater.setPosition(nextPos);
        }else{
            floater.setPosition(this.winSize.width/2, this.winSize.height/2);
        }
        floater.setZOrder(jc.topMost);
        this.getParent().addChild(floater);
        this.scheduleOnce(function(){
            jc.fadeOut(floater, undefined, function(){
                floater.release();
                this.getParent().removeChild(floater,true);
            }.bind(this));
        }.bind(this),3);

    },
    centerThisPeer:function(centerMe, centerOn){
        jc.centerThisPeer(centerMe, centerOn);
    },
    centerThisChild:function(centerMe, centerOn){
        jc.centerThisChild(centerMe, centerOn);
    },
    scaleTo:function(scaleMe, toMe){
        jc.scaleTo(scaleMe, toMe);
    },


});