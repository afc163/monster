function log(o){
	var str='';
	for(var a in o){
		str+=a+':'+o[a]+'\r\n';
	}
	if(console && console.log){
		console.log(str);
	}else{
		alert(str);
	}
}
function tips(str){
	$('.tips').html(str);
}

function getVal(n){
	return localStorage[n];
}
function setVal(n,v){
	localStorage[n] = v;
}
function clearConfig() {
    localStorage.clear();
}

function export2str(o){
	var arr=[];
	for(var i in o){
	    arr.push(i + ':' + type2str((typeof (getVal(i) != 'undefined') ? getVal(i) : '')));
	};
	return arr;
}
function type2str(t){
	var str='';
	var tp = getType(t);
	switch(tp){
		case 'string':
			str = "'"+t+"'";
		break;
		case 'array':
			str = "['"+t.toString().split(',').join("','")+"']";
		break;
		case 'function':
			
		break;
		
		default:
			str=t;
	}
	return str;
}
function getType(o) {
  var _t; return ((_t = typeof(o)) == "object" ? o==null && "null" || Object.prototype.toString.call(o).slice(8,-1):_t).toLowerCase();
}

var getValue = function (name, valueHandler, scope) {
    var thisObj = scope || window;
    chrome.extension.sendRequest({ action: 'getLocalStorage', name: name }, function (response) {
		if (typeof (response.val) == 'undefined') {
            valueHandler.call(thisObj, eval('CONFIG.' + name));
            //valueHandler.call(thisObj, undefined);
        } else {
            valueHandler.call(thisObj, response.val);
        }
    });
}

