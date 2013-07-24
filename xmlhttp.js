function ajax(cfg)
{
    var xhr,
    url = cfg.url,
    method = cfg.method || 'GET',
    success = cfg.success || function () {},
    failure = cfg.failure || function () {};
    
    try {
        xhr = new XMLHttpRequest();
    } catch (e) {
        throw ("Couldn't create xmlhttp = " + e);
        //xhr = new ActiveXObject("Msxml2.XMLHTTP");
    }
    
    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                success.call(null, xhr);
            } else {
                failure.call(null, xhr);
            }
        }
    }
    
    xhr.open(method, url);
    xhr.send(null);
}