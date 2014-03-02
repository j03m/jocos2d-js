
jc.log(['camera'], 'cc undefined:' + (cc == undefined));
jc.log(['camera'], 'cc.ActionInterval undefined:' + (cc.ActionInterval == undefined));
jc.log(['camera'], 'cc.ActionInterval looks like:' + cc.ActionInterval);
if (jc.isBrowser){
    jc.PanAndZoom = cc.ActionInterval.extend(/** @lends cc.PanAndZoom# */{
        /**
         * @param {Number} duration duration in seconds
         * @param {cc.Point} position
         * @return {Boolean}
         */
        initWithDuration:function (duration, position, sx, sy) {
            if (position.x == undefined || position.y==undefined){
                throw "Position is not a point";
            }
            if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
//            if (sx >1 ){
//                sx = 1;
//            }
//            if (sy>1){
//                sy = 1;
//            }
                position.x = position.x*sx;
                position.y = position.y*sy;
                this._endPosition = position;
                this._endScaleX = sx;
                this._endScaleY = (sy != null) ? sy : sx;

                return true;
            }

            return false;
        },

        /**
         * @param {Number} target
         */
        startWithTarget:function (target) {
            cc.ActionInterval.prototype.startWithTarget.call(this, target);
            this._previousPosition = this._startPosition = target.getPosition();
            this._delta = cc.pSub(this._endPosition, this._startPosition);
            this._startScaleX = target.getScaleX();
            this._startScaleY = target.getScaleY();
            this._deltaX = this._endScaleX - this._startScaleX;
            this._deltaY = this._endScaleY - this._startScaleY;

        },

        /**
         * @param {Number} time time in seconds
         */
        update:function (time) {
            if (this._target) {
                var currentPos = this._target.getPosition();
                var diff = cc.pSub(currentPos, this._previousPosition);
                this._startPosition = cc.pAdd(this._startPosition, diff);
                var newPos = cc.p(this._startPosition.x + this._delta.x * time,
                    this._startPosition.y + this._delta.y * time);
                this._target.setPosition(newPos);
                this._previousPosition = newPos;
                this._target.setScale(this._startScaleX + this._deltaX * time, this._startScaleY + this._deltaY * time);
            }
        },
        _endPosition:cc.p(0, 0),
        _startPosition:cc.p(0, 0),
        _delta:cc.p(0, 0),
        _scaleX:1,
        _scaleY:1,
        _startScaleX:1,
        _startScaleY:1,
        _endScaleX:0,
        _endScaleY:0,
        _deltaX:0,
        _deltaY:0
    });

    /**
     * @param {Number} duration duration in seconds
     * @param {cc.Point} position
     * @return {cc.MoveTo}
     * @example
     * // example
     * var actionTo = cc.MoveTo.create(2, cc.p(windowSize.width - 40, windowSize.height - 40));
     */
    jc.PanAndZoom.create = function (duration, position, scaleX, scaleY) {
        var go = new jc.PanAndZoom();
        go.initWithDuration(duration, position, scaleX, scaleY);

        return go;
    };

}else{
    jc.PanAndZoom = {};
    jc.PanAndZoom.create = function(){}
}

