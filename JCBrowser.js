var jc = jc || {};

if (typeof window === 'undefined') {
    jc.isBrowser = false;
}else{
    jc.isBrowser = true;
}

if (!jc.isBrowser){
    var dirImg = "art/";
    var dirMusic = "sounds/";
}else{
    var dirImg = "web/";
    var dirMusic = "sounds/web/";

}