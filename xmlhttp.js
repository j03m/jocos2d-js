function ajax(cfg)
{
    var xhr,
    url = cfg.url,
    method = cfg.method || 'GET',
    success = cfg.success || function () {},
    failure = cfg.failure || function () {},
	data = cfg.data || {};
    
    try {
        xhr = new XMLHttpRequest();
    } catch (e) {
        throw ("Couldn't create xmlhttp = " + e);
        //xhr = new ActiveXObject("Msxml2.XMLHTTP");
    }
    
    xhr.onreadystatechange = function (req)
    {
        return function(){
			if (xhr.readyState == 4) {
	            if (xhr.status == 200) {
	                success(req, {'status':xhr.status,'response':xhr.responseText});
	            } else {
	                failure(req, {'status':xhr.status,'response':xhr.responseText});
	            }
	        }	
		}
    }(cfg)
    
    xhr.open(method, url);
    xhr.send(data);
}