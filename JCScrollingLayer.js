var jc = jc || {};
jc.ScrollingLayer = jc.TouchLayer.extend({
    init: function(definition){
        if (this._super()) {
            this.def = definition;
            this.sprites = this.def.sprites;
            this.metaData = this.def.metaData;
            this.doConvert = true;
            this.name = "JCScrollingLayer";
			this.configure();
            this.selectedIndex = 1;
            this.doUpdate = false;
            this.scheduleUpdate();
            return true;
        } else {
            return false;
        }
    },
    clear: function(){
        for(var i =0;i<this.sprites.length;i++){
            this.sprites[i].setVisible(false);
            this.removeChild(this.sprites[i], true);
            this.sprites[i].release();
            this.sprites[i] = undefined;
        }
        if (this.drawNode){
            this.drawNode.clear();
        }

        this.sprites = [];
    },
	configure:function(){
		var maxValue =0;
        var cellSize = 0;
		if (this.def.isVertical){
			cellSize = this.def.cellHeight;
		}else{
			cellSize = this.def.cellWidth;
		}
		
		for(var i=0;i<this.sprites.length;i++){
            this.touchTargets.push(this.sprites[i]);
            this.addChild(this.sprites[i]);
            var pos = ((cellSize/2) * i) + cellSize;
			if (this.def.isVertical){
				this.sprites[i].setPosition(cc.p(0,pos));	
			}else{
				this.sprites[i].setPosition(cc.p(pos,0));	
			}

			if (this.def.isVertical){
	            if (this.sprites[i].getTextureRect().width > maxValue){
	                maxValue =  this.sprites[i].getTextureRect().width;
	            }				
			}else{
	            if (this.sprites[i].getTextureRect().height > maxValue){
	                maxValue =  this.sprites[i].getTextureRect().height;
	            }								
			}
            this.reorderChild(this.sprites[i],3);
        }

		if (this.def.isVertical){
	        var h = this.sprites.length*this.def.cellHeight;
	        this.midPoint = this.def.height/2;
	        this.setContentSize(cc.size(maxValue,h));		
			
		}else{
	        var w = this.sprites.length*this.def.cellWidth;
	        this.midPoint = this.def.width/2;
	        this.setContentSize(cc.size(w,maxValue));					
		}
	},
    disableCell:function(index){
        if(this.sprites[index] && this.sprites[index].pic){
            if (jc.isBrowser){
                jc.shade(this.sprites[index].pic);
            }else{
                var darkgray = new cc.Color3B(100, 100, 100);;
                this.sprites[index].setColor(darkgray);
                if (this.sprites[index].pic){
                    this.sprites[index].pic.setColor(darkgray);
                }

            }
            this.sprites[index].disabled = true;
        }

    },
    addMeta:function(index, name, value){
        this.metaData[index][name]=value;
    },
    getMeta:function(index){
        return this.metaData[index];
    },
    getIndex:function(property, value){
        for(var i =0;i<this.metaData.length;i++){
            if (this.metaData[i][name]==value){
                return i;
            }
        }
        return -1;
    },
    placeSpriteOver:function(index, plist, png, frame){
        var mask = jc.makeSpriteWithPlist(plist, png, frame);
        this.sprites[index].mask = mask;
        this.addChild(mask);
        this.sprites[index].mask.setVisible(true);
        this.sprites[index].mask.setZOrder(this.sprites[index].getZOrder()+1);
        jc.scaleTo(this.sprites[index].mask, this.sprites[index]);
        jc.centerThisPeer(this.sprites[index].mask, this.sprites[index]);
    },
    setIndex: function(val){
        jc.log(['scroller'],"set on: "+val);
        this.doUpdate = false;

        if (val == undefined){
            jc.log(['scroller'], "Bad val for setIndex:");
            jc.dumpStack(['scroller']);
            return;
        }
        this.selectedIndex = val;
        this.centerOn(this.sprites[val]);

    },
    previous:function(){
        if (this.selectedIndex!=0){
            var next = this.selectedIndex-1;
            this.setIndex(next);
        }
    },
    next:function(){
        if (this.selectedIndex<this.sprites.length-1){
            var next = this.selectedIndex+1;
            this.setIndex(next);
        }
    },
	left:function(){
		this.previous();
	},
	right:function(){
		this.next();
	},
	up:function(){
		this.previous();
	},
	down:function(){
		this.next();
	},
    targetTouchHandler: function(type, touch, sprites) {
        if (!this.isVisible()){
            return;
        }

        if (this.drawNode){
            this.drawNode.clear();
        }

        if (type == jc.touchBegan){
            jc.log(['scroller'],"touchbegan");
            this.initialTouch = touch;
            this.scrollDistance = undefined;
        }

        if (type == jc.touchEnded && this.initialTouch){
            jc.log(['scroller'],"touchend");
            this.fling(touch, sprites);
        }

        if (type == jc.touchMoved && this.initialTouch){
            jc.log(['scroller'],"touchmove");
            this.scroll(touch);
        }
        return true;
    },
    fling:function(touch, sprites){
        this.isMoving=false;
        jc.log(['scroller'],"fling");
        if (this.scrollDistance == undefined){ //normal touch
            jc.log(['scroller'],"fling touch");
            if (sprites[0]){
                var selected = this.sprites.indexOf(sprites[0]);
                this.setIndex(selected);
            }
        }else{
            //if first cell middle is past center line, stop, adjust to first cell middle on center line
            //fix this:

            this.doUpdate = !this.edgeAdjust();
        }

    },
    edgeAdjust:function(){
        var pos = this.calcAbsolutePos(0);

        var fs = 0;;
        if (this.def.isVertical){
            fs = pos.y;
        }else{
            fs = pos.x;
        }

        if (fs> this.midPoint){
            this.doUpdate = false;
            this.isMoving = false;
            this.setIndex(0);
            jc.log(['scroller'],"edge");
            return true;
        }

        //if last sprite is past middle rect, stop adjust to last cell middle on center line
        var pos =this.calcAbsolutePos(this.sprites.length-1);
        var ls = 0;

        if (this.def.isVertical){
            ls = pos.y;
        }else{
            ls = pos.x;
        }

        if (ls < this.midPoint){
            this.doUpdate = false;
            this.isMoving = false;
            this.setIndex(this.sprites.length-1);
            jc.log(['scroller'],"edge2");
            return true;
        }
        return false;
    },
    centerOn: function(sprite){
        var pos = sprite.getPosition();
        var worldPos = this.convertToWorldSpace(pos);
        if (this.def.isVertical){
            var augment = this.midPoint - worldPos.y;
        }else{
            var augment = this.midPoint - worldPos.x;
        }

        jc.log(['scroller'],"Center needs:" + augment);
        if (augment !=0){
			if (this.def.isVertical){
				this.runEndingAdjustment(cc.p(0,augment));
			}else{
				this.runEndingAdjustment(cc.p(augment,0));
			}

        }else{
            this.raiseSelected();
        }

    },
    runEndingAdjustment:function(augment){
        if (!this.endAdjustmentRunning){
            this.endAdjustmentRunning = true;
            jc.log(['scroller'],"runEndingAdjustment:" + this.doUpdate);
            var func = cc.CallFunc.create(this.raiseSelected.bind(this));
            var action = cc.MoveBy.create(jc.defaultTransitionTime/2, augment);
            var seq = cc.Sequence.create(action, func);
            this.runAction(seq);
        }

    },
    raiseSelected:function(){
        jc.log(['scroller'],"raiseSelected:" + this.doUpdate);

        this.doUpdate=false;
        this.endAdjustmentRunning = false;
        this.applyHighlight(this.sprites[this.selectedIndex]);
        var md;
        if (this.metaData){
            md = this.metaData[this.selectedIndex];
        }
        if (!this.sprites[this.selectedIndex].disabled){
            this.def.selectionCallback(this.selectedIndex, this.sprites[this.selectedIndex], md);
        }else{
            this.def.selectionCallback(this.selectedIndex, undefined, md);
        }
    },
    applyHighlight:function(sprite){
        //todo: layer a nicer sprite
        var color = cc.c4f(255.0/255.0, 255.0/255.0, 0.0/255.0, 1.0);
        this.drawBorder(sprite,color,2);
    },
    update:function(dt){
        if (this.doUpdate){
            jc.log(['scroller'],"updating");
            if (!this.scrollDistance){
                this.doUpdate = false;
                return;
            }
            var scrollDistance =0;
            var cellSize = 0;
            if (this.def.isVertical){
                scrollDistance = this.scrollDistance.y;
                cellSize = this.def.cellHeight;
            }else{
            	scrollDistance = this.scrollDistance.x;
				cellSize = this.def.cellWidth;
            }

//			if (scrollDistance/cellSize > 3){
//				if (this.def.isVertical){
//					this.scrollDistance.y = 3 * this.def.cellHeight;
//				}else{
//					this.scrollDistance.x = 3 * this.def.cellWidth;
//				}
//
//			}


            this.setPosition(cc.pAdd(this.getPosition(), this.scrollDistance));
            if (!this.isMoving){
                var SCROLL_DEACCEL_RATE = 0.75;
                this.scrollDistance = cc.pMult(this.scrollDistance, SCROLL_DEACCEL_RATE);
                if (Math.abs(scrollDistance)<=1){
                    this.doUpdate = false;
                    this.adjust();
                }
            }

            this.doUpdate = !this.edgeAdjust();
        }
    },
    calcAbsolutePos:function(position){
          return this.convertToWorldSpace(this.sprites[position].getPosition());
    },
    adjust:function(){
        var min=-1;
        var closest;
        jc.log(['scroller'],"adjust");
        for(var i =0;i<this.sprites.length;i++){ //todo: change to math based
            var sprite = this.sprites[i];
            var bb = sprite.getBoundingBox();
            bb.origin = this.convertToWorldSpace(bb.origin);
            jc.log(['scroller'],"origin:" + JSON.stringify(bb.origin));
			if (this.def.isVertical){
				var diff = Math.abs(bb.origin.y + this.midPoint);
			}else{
				var diff = Math.abs(bb.origin.x - this.midPoint);				
			}
            jc.log(['scroller'],"diff:" + diff);
            if (min==-1 || min>diff){
                min = diff;
                closest = i;
            }
			
//			if (this.def.isVertical){
//	            if (cc.rectContainsPoint(bb, cc.p(bb.origin.x, this.midPoint))){
//	                this.setIndex(i);
//	                return;
//	            }
//			}else{
//                jc.log(['scroller'],"midpoint:" + JSON.stringify(this.midPoint));
//                if (cc.rectContainsPoint(bb, cc.p(this.midPoint, bb.origin.y))){
//	                this.setIndex(i);
//	                return;
//	            }
//			}
        }

        //if no one is on the rect, move the closest
        this.setIndex(closest);
    },
    scroll:function(touch){
        jc.log(['scroller'],"scroll");
        var bb = this.getBoundingBox();
        var moveDistance = cc.pSub(touch, this.initialTouch);
		if (this.def.isVertical){
			var change = cc.p(0,moveDistance.y );
		}else{
			var change = cc.p(moveDistance.x,0 );			
		}

        this.scrollDistance = change;
        this.doUpdate= true;
        this.isMoving = true;
    }

});