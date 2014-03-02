var jc = jc || {};

jc.assetWildCard = "{v}";

jc.multiSheetPrefix = 'multisheet-';

jc.multiSheetWildCard = "{n}";

//this assumes you want landscape. todo: mod for portrait
jc.resolutions = {};


jc.resolutions.iphone = cc.size(480,320);
jc.resolutions.iphone.scale =   0.234375;
jc.resolutions.iphone.charScale =   0.55;
jc.resolutions.iphone.scaledArea = cc.size(480,270);

jc.resolutions.iphone5 = cc.size(1136,640);
jc.resolutions.iphone5.scale = 0.554688;
jc.resolutions.iphone5.charScale =   0.85;
jc.resolutions.iphone5.scaledArea = cc.size(1136,640);


jc.resolutions.iphone4 = cc.size(960,640);
jc.resolutions.iphone4.scale = 0.46875;
jc.resolutions.iphone4.charScale = 0.75;
jc.resolutions.iphone4.scaledArea = cc.size(960,541);

jc.resolutions.ipadhd = cc.size(2048, 1536);
jc.resolutions.ipadhd.scale = 1;
jc.resolutions.ipadhd.charScale = 1;
jc.resolutions.ipadhd.scaledArea = cc.size(2048,1154);


jc.setDesignSize = function(size){
    jc.designSize = size;
}


jc.bestAssetDirectory = function(){
    //height switched because screen always reports portrait,
    //you can use window.orientation to determine rotation, but I don't care
    //this game runs in landscape
    if (jc.isBrowser){
        var dpr = Math.ceil(window.devicePixelRatio);

        if (window.orientation){
            jc.screenSize = cc.size(screen.height*dpr, screen.width*dpr);
        }else{
            jc.screenSize = cc.size(screen.width*dpr, screen.height*dpr);
        }

        var canvas =  window.document.getElementById("gameCanvas");
        jc.actualSize = cc.size(canvas.width, canvas.height);

    }else{
        jc.actualSize = cc.Director.getInstance().getWinSize();
        jc.screenSize = jc.actualSize;
        jc.log(['resource'], "Size:" + JSON.stringify(jc.screenSize));

    }

    var actualSize = jc.actualSize;
    //determine what asset size we should be using.
    //in our game we follow http://www.codeandweb.com/blog/2012/12/14/scaling-content-for-retina-display-iphone-and-ipad
    //we are designing for iphone 5, but scaling down from ipad 3
    //so we mostly care about width, our height will get cut.
    var maxSet = "";
    var charMinSet = "";
    var max = 0;
    var charMin = Number.MAX_VALUE;
    var scaleFactor;
    var charScaleFactor;
    for(var res in jc.resolutions){
        if (jc.resolutions[res].width<= actualSize.width){
            if (jc.resolutions[res].width > max){
                max = jc.resolutions[res].width;
                maxSet = res;
                scaleFactor = jc.resolutions[res].scale;
            }
        }

        if (jc.resolutions[res].width>= actualSize.width){
            if (jc.resolutions[res].width < charMin){
                charMin = jc.resolutions[res].width;
                charMinSet = res;
                charScaleFactor = jc.resolutions[res].charScale;
            }
        }

    }
    jc.log(['resource'], "selected: " + maxSet + " for assets dir.");
    jc.assetCategory = maxSet;
    jc.characterAssetCategory = charMinSet;
    jc.assetScaleFactor = scaleFactor;
    jc.characterScaleFactor =  charScaleFactor;
    jc.assetCategoryData = jc.resolutions[maxSet];
    jc.assetCategoryData.adjustx = (actualSize.width - jc.resolutions[maxSet].scaledArea.width)/2;
    jc.assetCategoryData.adjusty = (actualSize.height - jc.resolutions[maxSet].scaledArea.height)/2;
};

if (!jc.isBrowser){
    jc.bestAssetDirectory();
}