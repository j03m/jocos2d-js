var jc = jc || {};

jc.UiConf = {};
jc.woodRect = cc.rect(220,220,293,293);
jc.topMost = 10000;


jc.UiElementsLayer = jc.TouchLayer.extend({
    windowConfig:{
        "window":{

            "type":"scale9",
            "anchor":['top'],
            "transitionIn":"top",
            "transitionOut":"bottom",
            "size":{ "width":50, "height":50},
            "scaleRect":jc.UiConf.frame19Rect,
            "sprite":"frame 19.png",
            "padding":{
                "all":0
            }
            ,
            "kids":{
                "subwindow1":{
                    "cell":8,
                    "type":"scale9",
                    "input":true,
                    "size":{ "width":50, "height":50},
                    "scaleRect":jc.UiConf.frame20Rect,
                    "sprite":"frame 20.png",
                    "padding":{
                        "all":0
                    }
                },
                "subwindow2":{
                    "cell":2,
                    "type":"scale9",
                    "input":true,
                    "size":{ "width":50, "height":50},
                    "scaleRect":jc.UiConf.frame20Rect,
                    "sprite":"frame 20.png",
                    "padding":{
                        "all":0
                    }
                }
            }
        }
    },
    init: function() {
        if (this._super()) {
            this.windowConfigs = [];
            return true;
        }else{
            return false;
        }
    },
    done: function(){
        //transition windows out
        this.runningType = 'out';
        for(var i =0; i< this.windowConfigs.length; i++){
            var windowConfig = this.windowConfigs[i];
            if (windowConfig.config.transitionOut){
                this.doTransitionOut(windowConfig, this.onTransitionComplete.bind(this));
            }else{
                windowConfig.window.setVisible(false);
                this.onTransitionComplete();
            }
        }
    },
    blackBoxElement:function(elementName){
        var size = this[elementName].getContentSize();
		this.blackBox(size);
	},
	blackBoxScene:function(){
        var inSize = jc.designSize;
        var width=inSize.width*jc.assetScaleFactor;
        var height=inSize.height*jc.assetScaleFactor;
        var size = cc.size(width,height);
        var verticalBarThickness= (this.winSize.width - size.width)/2;
        var horizontalBarThickness = (this.winSize.height - size.height)/2;
        this.leftBar = cc.DrawNode.create();
        this.rightBar = cc.DrawNode.create();
        this.topBar = cc.DrawNode.create();
        this.bottomBar = cc.DrawNode.create();

        this.getParent().addChild(this.leftBar);
        this.getParent().addChild(this.rightBar);
        this.getParent().addChild(this.topBar);
        this.getParent().addChild(this.bottomBar);

        var color = cc.c4f(0,0,0,1);
        var border = cc.c4f(0, 0, 0 , 1);
        this.leftBar.clear();
        this.rightBar.clear();
        this.topBar.clear();
        this.topBar.clear();
        this.leftBar.setPosition(cc.p(0,0));
        var rbPos = cc.p(this.winSize.width - verticalBarThickness,0);
        this.rightBar.setPosition(rbPos);
        var tbPos = cc.p(0,this.winSize.height - horizontalBarThickness);
        this.topBar.setPosition(tbPos);
        this.bottomBar.setPosition(cc.p(0,0));

        this.drawRect(this.leftBar, cc.rect(0,0,verticalBarThickness,this.winSize.height) , cc.black(), border,1);
        this.drawRect(this.rightBar, cc.rect(rbPos.x,rbPos.y,verticalBarThickness,this.winSize.height) , cc.black(), border,1);
        this.drawRect(this.topBar, cc.rect(tbPos.x,tbPos.y,this.winSize.width,horizontalBarThickness) , cc.black(), border,1);
        this.drawRect(this.bottomBar, cc.rect(0,0,this.winSize.width,horizontalBarThickness) , cc.black(), border,1);

        this.leftBar.setZOrder(jc.topMost);
        this.rightBar.setZOrder(jc.topMost);
        this.topBar.setZOrder(jc.topMost);
        this.bottomBar.setZOrder(jc.topMost);
    },
    blackBox:function(inSize){
		var width=inSize.width*jc.assetScaleFactor;
		var height=inSize.height*jc.assetScaleFactor;
		var size = cc.size(width,height);
        var verticalBarThickness= (this.winSize.width - size.width)/2;
		var horizontalBarThickness = (this.winSize.height - size.height)/2;
        this.leftBar = cc.DrawNode.create();
        this.rightBar = cc.DrawNode.create();
        this.topBar = cc.DrawNode.create();
        this.bottomBar = cc.DrawNode.create();

        this.addChild(this.leftBar);
        this.addChild(this.rightBar);
        this.addChild(this.topBar);
        this.addChild(this.bottomBar);
		
        var color = cc.c4f(0,0,0,1);
        var border = cc.c4f(0, 0, 0 , 1);
        this.leftBar.clear();
        this.rightBar.clear();
        this.topBar.clear();
        this.topBar.clear();
        this.leftBar.setPosition(cc.p(0,0));
		var rbPos = cc.p(this.winSize.width - verticalBarThickness,0);
        this.rightBar.setPosition(rbPos);
		var tbPos = cc.p(0,this.winSize.height - horizontalBarThickness);
        this.topBar.setPosition(tbPos);
        this.bottomBar.setPosition(cc.p(0,0));

        this.drawRect(this.leftBar, cc.rect(0,0,verticalBarThickness,this.winSize.height) , cc.black(), border,1);
        this.drawRect(this.rightBar, cc.rect(rbPos.x,rbPos.y,verticalBarThickness,this.winSize.height) , cc.black(), border,1);
        this.drawRect(this.topBar, cc.rect(tbPos.x,tbPos.y,this.winSize.width,horizontalBarThickness) , cc.black(), border,1);
        this.drawRect(this.bottomBar, cc.rect(0,0,this.winSize.width,horizontalBarThickness) , cc.black(), border,1);

        this.leftBar.setZOrder(jc.topMost);
        this.rightBar.setZOrder(jc.topMost);
        this.topBar.setZOrder(jc.topMost);
        this.bottomBar.setZOrder(jc.topMost);
		

    },
    flash:function(){
        //layer color, full screen to white
        //fade out

        if (!this.whiteFlash){
            this.whiteFlash = cc.LayerColor.create(cc.c4(255, 255, 255, 255));
            this.whiteFlash.setContentSize(this.winSize);
            this.getParent().addChild(this.whiteFlash);
            this.whiteFlash.setVisible(false);
            this.whiteFlash.setPosition(cc.p(0,0));


        }

        this.whiteFlash.setVisible(true);
        this.whiteFlash.setOpacity(255);

        jc.fadeOut(this.whiteFlash, jc.defaultTransitionTime);

    },
    drawRect:function(poly, rect, fill, border, borderWidth){
        var height = rect.height;
        var width = rect.width;
        var vertices = [cc.p(0, 0), cc.p(0, height), cc.p(width, height), cc.p(width, 0)];
        poly.drawPoly(vertices, fill, borderWidth, border);
    },
    onTransitionComplete:function(){
        this.incTransition();
        this.checkTransitionsDone()
    },
    incTransition:function(){
        if (!this.transitions){
            this.transitions=0;
        }
        this.transitions++;
    },
    checkTransitionsDone:function(){
        if (this.transitions == this.windowConfigs.length){
            this.transitions = 0;
            if (this.runningType == 'out'){
                this.outTransitionsComplete();
            }else{				
                this.inTransitionsComplete();
            }
        }
    },
    outTransitionsComplete:function(){

    },
    inTransitionsComplete:function(){

    },
    start: function(){
        //transition windows in
		this.blackBox(jc.designSize);
        this.runningType = 'in';
        for(var i =0; i< this.windowConfigs.length; i++){
            var windowConfig = this.windowConfigs[i];
            if (windowConfig.z){
                windowConfig.window.setZOrder(windowConfig.z);
            }
            if (windowConfig.config.transitionIn){
                this.doTransitionIn(windowConfig,this.onTransitionComplete.bind(this));
            }else{
                windowConfig.window.setPosition(windowConfig.position);
                windowConfig.window.setVisible(true);
                this.onTransitionComplete();
            }
        }
    },
    doTransitionIn:function(windowConfig, doneDelegate){
        switch(windowConfig.config.transitionIn){
            case 'right':
                this.slideInFromRight(windowConfig.window, windowConfig.config.transitionInTime, windowConfig.position,doneDelegate);
                break;
            case 'left':
                this.slideInFromLeft(windowConfig.window, windowConfig.config.transitionInTime, windowConfig.position,doneDelegate);
                break;
            case 'top':
                this.slideInFromTop(windowConfig.window, windowConfig.config.transitionInTime, windowConfig.position,doneDelegate);
                break;
            case 'topToMid':
                this.slideTopToMid(windowConfig.window, windowConfig.config.transitionInTime, doneDelegate);
                break;
            case 'leftToMid':
                this.slideLeftToMid(windowConfig.window, windowConfig.config.transitionInTime, doneDelegate);
                break;
            case 'rightToMid':
                this.slideRightToMid(windowConfig.window, windowConfig.config.transitionInTime, doneDelegate);
                break;
            case 'bottom':
                this.slideInFromBottom(windowConfig.window, windowConfig.config.transitionInTime, windowConfig.position,doneDelegate);
                break;   case 'topToMid':
                break;
            case 'custom':
                this[windowConfig.config.executeIn](doneDelegate);
                break;
        }
    },
    doTransitionOut:function(windowConfig, doneDelegate){
        switch(windowConfig.config.transitionOut){
            case 'right':
                this.slideOutToRight(windowConfig.window, windowConfig.config.transitionOutTime, undefined,doneDelegate);
                break;
            case 'left':
                this.slideOutToLeft(windowConfig.window, windowConfig.config.transitionOutTime, undefined,doneDelegate);
                break;
            case 'top':
                this.slideOutToTop(windowConfig.window, windowConfig.config.transitionOutTime, undefined,doneDelegate);
                break;
            case 'bottom':
                this.slideOutToBottom(windowConfig.window, windowConfig.config.transitionOutTime, undefined,doneDelegate);
                break;
            case 'custom':
                this[windowConfig.config.executeOut](doneDelegate);
                break;
        }
    },
    getWindowFromConfig:function(config){

            var window = this.makeWindowByType(config);
            var kids = config.kids;
            for(var name in kids){
                var kid = config.kids[name];
                var kidWindow = this.makeWindowByType(kid);
                if (!kid.pos){
                    kidWindow.setPosition(cc.p(0,0));
                }else{
                    kidWindow.setPosition(cc.p(kid.pos.x*jc.assetCategoryData.scale, kid.pos.y*jc.assetCategoryData.scale));
                }
				window[name] = kidWindow;
                window.addChild(kidWindow);
            }
            return window;

    },
    initFromConfig:function(configs, parent){
        for (var configName in configs){

            config = configs[configName];


            //parent is layer if parent doesn't exist
            if (!parent){
                parent = this;
            }

            if (config.isGroup && !this.designMode){
                this.initFromGroupConfig(configName, config, parent);
            }else{
                if (config.isGroup){
                    config.sprite = config.members[0].sprite;
                }
                var size = undefined;
                if (config.type == "scale9"){
                    size = this.calculateSize(config, parent);
                    jc.log(['ui'], "scale9 size:" + JSON.stringify(size));
                }

                //make it
                var window = this.makeWindowByType(config, size);

                if (!size){
                    size = window.getTextureRect();
                    jc.log(['ui'], "TextureRect size:" + JSON.stringify(size));
                }

                //what cell is it anchored to
                var position = this.getPos(config, size, parent);

                window.setPosition(cc.p(-1000,-1000));

                //have a variable for it
                this[configName] = window;
                window.name = configName;

                //add it to a collection
                this.windowConfigs.push({"window":window, "config":config, "position":position});

                //parent it
                parent.addChild(window);
                config.z = config.z | 0;
                parent.reorderChild(window, config.z);

                if (config.input || this.designMode){
                    this.touchTargets.push(window);
                }

                //what does it contain?
                if (config.kids){
                    this.initFromConfig(config.kids, window);
                }
            }
        }
    },
    makeWindowByType:function(config, size){
        var window;

        var type = config.type;
        var sprite = config.sprite;

        if (this.designMode && type == "button"){
            type = "sprite";
            sprite = config.main;
        }else if (this.designMode && type != "sprite" && type !="label" && type!="scale9"){
            type = "sprite";
        }

        if (type == "scale9"){
            window = this.makeWindow(size,sprite, config.rect);
        }else if (type == "sprite"){
            window = cc.Sprite.create();
            window.initWithSpriteFrameName(sprite);
            if (config.scale){
                window.setScaleX(config.scale/100);
                window.setScaleY(config.scale/100);
            }
        }else if (type == "button"){
            window = new jc.CompositeButton();
            if (config.touchDelegateName != undefined && !this[config.touchDelegateName]){
                throw "supplied:" + config.touchDelegateName + " for button click but it doesn't exist.";
            }

            if (config.pressDelegateName != undefined && !this[config.pressDelegateName]){
                throw "supplied:" + config.pressDelegateName + " for button press but it doesn't exist.";
            }
            var ontouch,onpress;
            if(config.touchDelegateName){
                ontouch = this[config.touchDelegateName].bind(this);
            }
            if(config.pressDelegateName){
                onpress = this[config.pressDelegateName].bind(this);
            }
            window.initWithDefinition(config,ontouch, onpress);
            if (config.scale){
                window.setScaleX(config.scale/100);
                window.setScaleY(config.scale/100);
            }
        }else if (type == "label"){
            var fntSize, lblSize;
            if (!this.designMode){
                fntSize = config.fontSize*jc.assetScaleFactor;
                lblSize = cc.size(config.width*jc.assetScaleFactor, config.height*jc.assetScaleFactor);
            }else{
                fntSize = config.fontSize;
                lblSize = cc.size(config.width, config.height);
            }

            window = cc.LabelTTF.create(config.text, config.fontName, fntSize, lblSize, config.alignment);
            if (config.color){
                window.setColor(config.color);
            }

        }else if (type == 'tile'){
            window = new jc.PowerTile();
            window.initTile();
        }
        return window;
    },
    initFromGroupConfig:function(name, config, parent){
        if (!config.members){
            return;
        }
        var total = config.membersTotal | config.members.length;

        switch(config.type){
            case 'line':
                this.initGrid(name,config, parent, 1, total);
                break;
            case 'stack':
                this.initGrid(name,config, parent, total, 1);
                break;
            case 'grid':
                this.initGrid(name,config, parent, total/config.cols, config.cols);
                break;
        }
    },
    initGrid:function(name,config, parent, rows, cols){
        var total = config.membersTotal || config.members.length;
        var size = parent.getContentSize();
        var itemSize;
        var lastSize;
        var itemSizeHardSet = false;
        if (config.itemSize){
            var itemWidth = size.width * config.itemSize.width/100;
            var itemHeight = size.height* config.itemSize.height/100;
            itemSize = cc.size(itemWidth, itemHeight);
            itemSizeHardSet = true;
            jc.log(['ui'], "initGrid itemSize hard set:" + JSON.stringify(itemSize));
        }

        var x = -1;
        var y = -1;
        var rowCount=0;
        var colCount=0;
        var initialPosition;

        for(var i =0;i<total;i++){
            var member;
            if (config.membersTotal){
                member = config.members[0]; // use the first over and over
            }else{
                member = config.members[i];
            }

            var window = this.makeWindowByType(member, itemSize);
            var elementSize = window.getTextureRect();
            jc.log(['ui'], "element itemSize from boundingBox:" + JSON.stringify(elementSize));
            if (!itemSizeHardSet){
                jc.log(['ui'], "element itemSize not hard set, using elementSize");
                itemSize = elementSize; //buttons and sprites set their own sizes
            }

            if (x==-1 && y==-1){
                initialPosition = this.getPos(config, itemSize, parent);
                x = initialPosition.x;
                y = initialPosition.y;

            }else if (colCount!=0){
                //the last pass, we moved x from the previous elements center, to where our center should be.
                //however, this assumes we're the same size as the previous element
                //if we are not, we'll overlap them. So here, we also need to apply some logic that moves us further if we're larger then the
                //last element;
                    x+=itemSize.width/2;
            }

            //keep track
            jc.log(['ui'], "adding child:" + window.name);
            if (config.z == undefined){
                config.z = parent.getZOrder()+1;
            }
            jc.log(['ui'], "reordering child:" + config.z);
            parent.addChild(window);
            if (config.z !=0){
                this.reorderChild(window, config.z);
            }

            var instanceName;
            if (!member.name){
                instanceName = name+i;
            }else{
                instanceName = member.name;
            }
            window.name=instanceName;
            this[instanceName]=window;


            if (config.input || this.designMode){
                this.touchTargets.push(window);
            }

            //apply left side padding to everything but the first column of cells
            if (colCount!=0){
                if (config.itemPadding){
                    if (config.itemPadding.all){
                        x+=(config.itemPadding.all*jc.assetScaleFactor);
                    }else{
                        if (config.itemPadding.left){
                            x+=(config.itemPadding.left*jc.assetScaleFactor);
                        }
                    }
                }
            }

            var gridPos = cc.p(x,y);

            if (member.type == 'label'){
                gridPos.x+=window.getContentSize().width/2;
            }

            this.windowConfigs.push({"window":window, "config":member, "position":gridPos});


            //augment position for the next cell
            colCount++;
            if (colCount>=cols){
                rowCount++;
                x=initialPosition.x;
                y-=itemSize.height;
                if (config.itemPadding){
                    if (config.itemPadding.all){
                        y-=(config.itemPadding.all*jc.assetScaleFactor);
                    }else{
                        if (config.itemPadding.top){
                            y-=(config.itemPadding.top*jc.assetScaleFactor);
                        }
                    }
                }
                colCount = 0;
            }else{
                //move from my center, to the next center
                x+=itemSize.width/2;
                lastSize = itemSize;
            }

        }
    },

    calculateSize:function(config, parent){
        var size = parent.getContentSize();

        if (!config.size){
            config.size = size;
        }

        if (!this.designMode){
            config.size.width *= jc.assetScaleFactor;
            config.size.height *=jc.assetScaleFactor;
            if (config.size.width>jc.actualSize.width){
                config.size.width=jc.actualSize.width;
            }
            if (config.size.height>jc.actualSize.height){
                config.size.height=jc.actualSize.height;
            }
        }

        return config.size;
    },
    getPos:function(config, size, parent){
        if (!config){
            throw "Need a config!";
        }

        var x,y;
        if (config.pos){
            x = config.pos.x;
            y = config.pos.y;
        }else{
            x =this.winSize.width/2;
            y =this.winSize.height/2;
        }


        if (!this.designMode && config.pos){
            //if we are not in designmode, translate cooridinates based on our adjusted scale
            x*=jc.assetScaleFactor;
            y*=jc.assetScaleFactor;
        }


        if (config.applyAdjustments){
            if (jc.assetCategoryData.adjustx){
                x+= jc.assetCategoryData.adjustx;
            }
            if(jc.assetCategoryData.adjusty){
                y+= jc.assetCategoryData.adjusty;
            }
        }

        return cc.p(x,y);
    },
    getRow:function(cell){
        if (cell <= 3){
            return 0;
        }
        if (cell <= 6){
            return 1;
        }
        if (cell <= 9){
            return 2;
        }
        throw "Cell must be 1-9";
    },
    getCol:function(cell){
        if (cell == 1 || cell == 4 || cell == 7 ){
            return 0;
        }
        if (cell == 2 || cell == 5 || cell == 8 ){
            return 1;
        }
        if (cell == 3 || cell == 6 || cell == 9 ){
            return 2;
        }
        throw "Cell must be 1-9";
    }

});

jc.UiElementsLayer.create = function() {
    var ml = new jc.UiElementsLayer();
    if (ml && ml.init()) {
        return ml;
    } else {
        throw "Couldn't create the main layer of the game. Something is wrong.";
    }
    return null;
};

jc.UiElementsLayer.scene = function() {
    var scene = cc.Scene.create();
    var layer = jc.UiElementsLayer.create();
    scene.addChild(layer);
    return scene;

};

