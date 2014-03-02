var jc = jc || {};

if (!jc.isBrowser){
    function runBrowserMock(){
        window = jc;

        jc.addEventListener = function(entry, method){
            method();
        }
        jc.removeEventListener = function(){

        }
        document = {}
        document.readyState === 'complete'
        if (typeof screen === 'undefined') {
            var screen = jc;
        }

        if (typeof setTimeout === 'undefined') {
            setTimeout = function(execute, duration){
                duration = duration/10000;
                cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(this, execute, 0, 0, duration, undefined);
            }
        }


        if (typeof setInterval === 'undefined') {
            setInterval = function(execute, duration){
                duration = duration/10000;
                cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(this, execute, duration, 0, 0, undefined);
            }
        }

        if (typeof console === 'undefined') {
            console = {}
            console.log = function(printme){
                jc.log(['console'], printme);
            }
        }

        cc.Color3B = function(a,b,c){
            return cc.c4f(a, b, c, 1.0);
        }

        /**
         *  White color (255,255,255)
         * @constant
         * @type {Number,Number,Number}
         */
        cc.white = function () {
            return new cc.Color3B(255, 255, 255);
        };

        /**
         *  Yellow color (255,255,0)
         * @constant
         * @type {Number,Number,Number}
         */
        cc.yellow = function () {
            return new cc.Color3B(255, 255, 0);
        };

        /**
         *  Blue color (0,0,255)
         * @constant
         * @type {Number,Number,Number}
         */
        cc.blue = function () {
            return new cc.Color3B(0, 0, 255);
        };

        /**
         *  Green Color (0,255,0)
         * @constant
         * @type {Number,Number,Number}
         */
        cc.green = function () {
            return new cc.Color3B(0, 255, 0);
        };

        /**
         *  Red Color (255,0,0,)
         * @constant
         * @type {Number,Number,Number}
         */
        cc.red = function () {
            return new cc.Color3B(255, 0, 0);
        };

        /**
         *  Magenta Color (255,0,255)
         * @constant
         * @type {Number,Number,Number}
         */
        cc.magenta = function () {
            return new cc.Color3B(255, 0, 255);
        };

        /**
         *  Black Color (0,0,0)
         * @constant
         * @type {Number,Number,Number}
         */
        cc.black = function () {
            return new cc.Color3B(0, 0, 0);
        };

        /**
         *  Orange Color (255,127,0)
         * @constant
         * @type {Number,Number,Number}
         */
        cc.orange = function () {
            return new cc.Color3B(255, 127, 0);
        };

        /**
         *  Gray Color (166,166,166)
         * @constant
         * @type {Number,Number,Number}
         */
        cc.gray = function () {
            return new cc.Color3B(166, 166, 166);
        };
    }

    runBrowserMock();

}