/*
* Monster for Chrome v1.0.0
* http://ued.alipay.com/
*
* Copyright (c) 2010 Alipay UED
* Under the MIT licenses.
*
* Last-Modified: 2010-04-28 17:27:05 +0800
* Revision: 166
*/
window.Monster || (function () {
	
	var win = window,
		doc = win.document;
	
	jQuery.fn.outerHTML = function() { 
	    return jQuery(jQuery('<div></div>').html(this.clone())).html();
	}
	
	function encodeHTML(str){
		var entities = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;'
        };
		return str.replace(/[<>&]/g, function (m) { return entities[m]; })
	}
	function removeNode(el){
		return window.ActiveXObject ? el.removeNode(true) : el.parentNode.removeChild(el);
	}
	
	function findstring(str,findstr){
		if(findstr){
			var reg = new RegExp(findstr,"gi");
			return str.replace(reg, function (m) { return '<b class="mst-findstring">' + m + '</b>'; })
		}
		return str;
		
	}
	
	function create(tagName, prop){
		var ele = doc.createElement(tagName);
		if(prop === null) return ele;
		for(p in prop){
			if(p == 'class' || p == 'className'){
				ele.className = prop[p];
			}else if(p == 'style'){
				for (s in prop[p]){
					ele.style[s] = prop[p][s];
				}
			}else if(p === 'innerHTML'){
				ele.innerHTML = prop[p];
			}else if(p === 'appendTo'){
				prop[p].appendChild(ele);
			}else if(p === 'append'){
				ele.appendChild(prop[p]);
			}else{
				ele.setAttribute([p], prop[p]);
			}
		}
		return ele;
	}
	
	function print(obj){
		var type = obj.type,
			index = jQuery('.mst-' + type).length;
			
			create('div',{
				'id' : type + index,
				'class' : 'mst-' + type,
				'innerHTML' : '<p>' + obj.message + '</p><div class="mst-clear"></div>',
				'appendTo' : doc.getElementById('mst_' + type + '_ctr')
			})
			
			if (obj.elems) {
				jQuery('<div class="monster_outline mst-goto" title="' + M.getString('hilightelements') + '"></div>').insertAfter('#' + type + index + ' p').css({
					'float': 'left',
					'width': '15px',
					'height': '15px',
					'margin': '10px',
					'cursor': 'pointer'
				}).hover(function () {
					jQuery(this).css({
						'opacity': '1'
					});
				}, function () {
					jQuery(this).css({
						'opacity': '.5'
					});
				}).toggle(function () {
					
					jQuery('.mst-body-mixed-warn').remove();
					jQuery('.mst-body-mixed-err').remove();
					jQuery('.mst-body-mixed-info').remove();
					
					jQuery(obj.elems).each(function(j,el){
						var jq = jQuery(el);
						var pos = jq.offset(),
							hilight = el.getAttribute('data-findstring');
						
						var htm = jq.outerHTML();	
							if(jq.attr('class').indexOf(' ') != -1){
								htm = htm.replace(obj.cssClass,'');
							}else{
								htm = htm.replace('class="' + obj.cssClass + '"','');
							}
						
						M.UI.bubble({
							'id' : 'mst_' + type + '_goto_' + index + '_' + j,
							'type' : type,
							'text' : j + 1,
							'innerHTML' : findstring(encodeHTML(htm),obj.findstring),
							'pos' : [pos.top - 102, pos.left - 50]
						})
					})
					
					/*
					jQuery.each(M.all.err, function (k,o) {
						M.removeOutline(o);
					});
					jQuery.each(M.all.warn, function (k,o) {
						M.removeOutline(o);
					});
					jQuery.each(M.all.info, function (k,o) {
						M.removeOutline(o);
					});
					*/
					M.addOutline(obj);

				}, function () {
					jQuery('.mst-body-mixed-' + type).remove();
					M.removeOutline(obj);
				});
			}
			
			jQuery('#monster_' + type + '_num').text(index + 1);

	}
	
	function factory(obj){
		this.type = obj.type || 'info';
		this.message = obj.message || '';
		this.elems = obj.elems || null;
		this.cssClass = obj.cssClass || '';
		this.findstring = obj.findstr || '';
		print(this);
	}

    var M;
    M = win.Monster = {};
	
	/*
	* for Chrome
	* 
	*
	*/
	/* get local string */
	M.getString = chrome.i18n.getMessage;

	var handleBorderStyle = function (style) {
		this.css({
			'outline-style': (typeof (style) != 'undefined') ? style : CONFIG.eBdStyle
		});
	};
	var handleBorderWidth = function (width) {
		this.css({
			'outline-width': (typeof (width) != 'undefined') ? width + 'px' : CONFIG.eBdWidth + 'px'
		});
	};
	var handleBorderColor = function(color) {
		this.css({
			'outline-color': (typeof(color)!='undefined')?color:CONFIG.eBdColor
		});
	};

	
	M.pageUri = win.location.href;
	M.pluginUri = '';
    M.shown = false;
	/* fold flag */
    M.folded = false;
    M.timer = null;

    M.block = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'dl', 'pre', 'blockquote', 'form', 'div', 'table', 'fieldset', 'address'];

    /* 评分 */
    M.score = 0;

    /* 是否满足最低底线 */
    M.touchdown = false;

    /* 总分 */
    M.original_score = 105.1;

    M.outline = '2px solid red';

    /* 正则 */
    M.reg = {
        script: /<script[^>]*>[\s\S]*?<\/[^>]*script>/gi,
        comment: /<!--[\s\S]*?--\>/g,
        cssExpression: /expression[\s\r\n ]?\(/gi
    };
	
	M.arr = {
		property : ['class','id','style','type','tabIndex','readOnly','disabled','checked','hideFocus','value','title','dir','xml:lang','lang','accessKey','href','width','height','src','alt','target','base','action','method','enctype','accept','for','maxLength','pattern','required','min','max','step','name','http-equiv','content','rel','rev','xmlns','charset','data','media','usemap','coords','shape','language','code','codeBase','vAlign','align','frameBorder','scrolling','marginHeight','marginWidth','classid','border','cellPadding','cellSpacing','rules','summary','colSpan','rowSpan','scope','cols','rows','complete','autoComplete','sizset','sizcache','unSelectable','plugInspage','color','size','face','noWrap','bgColor','allowTransparency','hSpace','vSpace','contentEditable','wmode','link','vLink','aLink','aria-haspopup','clear','allowFullScreen','flashVars','allowScriptAccess','quality','menu','loop','autoFocus','defer'],
		inlinejs: ['onclick', 'onblur', 'onchange', 'oncontextmenu', 'ondblclick', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onresize', 'onscroll', 'onload', 'onunload', 'onselect', 'onsubmit']
	}

    M.all = {
        err: [],
        warn: [],
        info: [],
        htm: [],
		html: '',
        css: [],
        js: [],
		cssnodes : [],
		jsnodes : [],
		hasLayout : [],
        importcssnum: 0,
        cssnum: 0,
        jsnum: 0,
        minicssnum: 0,
        minijsnum: 0,
        csssize: [],
        jssize: [],
		jsmix : [],
		cssmix : [],
		checked : false
    }

    M.url = {
        htm: [],
        css: [],
        js: []
    };


    M.loaded = {
        htm: false,
        css: [],
        js: []
    };

    M.progressbar = null;

	//判断IE版本号
	M.ie = function(s) {
		var ua = navigator.userAgent.toLowerCase();
		var isIE6 = !window.XMLHttpRequest, 
			isIE8 = !!document.documentMode,
			isChrome = ua.indexOf("chrome") > 0,
			isIE7 = !isIE6 && !isIE8 && !isChrome; 
			var _I = { 6: isIE6, 7: isIE7, 8: isIE8 }; 
			if (isIE8) { 
				return (parseInt(document.documentMode) == s) ? true : false 
			}
			return _I[s] 
	}

	/* 去除数组重复项 */
    M.unique = function (arr) {
        var uni = [], inUni = false;
        uni[0] = arr[0];
        for (var i = 1, l = arr.length; i < l; i++) {
            inUni = false;
            // 查看当前第i个arr内容是否已存在与uni数组中
            for (var j = 0, k = uni.length; j < k; j++) {
                if (arr[i] == uni[j]) {
                    inUni = true;
                    break;
                }
            }
            if (!inUni) {
                uni.push(arr[i]);
            }
        }
        return uni;
    };

    /* 返回数组重复项 */
    M.dup = function (arr) {
        var r = [];
        var uni = [];
        var inUni = false;
        uni[0] = arr[0];
        for (var i = 1, l = arr.length; i < l; i++) {
            inUni = false;
            for (var j = 0, k = uni.length; j < k; j++) {
                if (arr[i] == uni[j]) {
                    inUni = true;
                    r.push(arr[i]);
                    break;
                }
            }
            if (!inUni) {
                uni.push(arr[i]);
            }
        }
        return r;
    }

    /* 查看某一数组中的所有元素是否都是true，即检查所有相关文件是否均加载完成 */
    M.allTrue = function (arr) {
        if (arr.length == 0) {
            return true;
        }
        var r = false;
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] != true) {
                r = false;
                break;
            }
            r = true;
        }
        return r;
    }

    M.addCssClass = function (obj, cssClass) {
        if (obj.elems) {
            var e = obj.elems;
            jQuery.each(e, function (i,o) {
                jQuery(o).addClass(cssClass);
            });
        }
    }
	
	M.setOutline = function(ele,callback){
	
		var e = jQuery(ele),
			rule = (M.ie(6) || M.ie(7)) ? 'border' : 'outline';
        if(e[0]){
			for(var i = 0; i < e.length; i++){
				callback(jQuery(e[i]), rule, i);
			}
		}
		
	}
	
    M.addOutline = function (Info) {
		M.setOutline(Info.elems,function(el, rule, i){
			if(el.css(rule) != M.outline){
				el.css(rule,M.outline);
			}
		})
    }

    M.removeOutline = function (Info) {
		M.setOutline(Info.elems,function(el, rule, i){
			var otl = el.css(rule);
				if (otl == M.outline) {
					el.css(rule,0);
				}
		})
    }

    M.getBytes = function (stream) {
        var stream = stream.replace(/\n/g, 'xx').replace(/\t/g, 'x');
        var escapedStr = encodeURIComponent(stream);
        return escapedStr.replace(/%[A-Z0-9][A-Z0-9]/g, 'x').length;
    }
    M.getSize = function (size) {
        return (size / 1024).toFixed(2);
    }

    //Console控制台输出
    M.log = function (obj) {
        if (win.console && console.log) {
           console.log(obj);
        };
    };

	/**
	* for Chrome
	* for Monster.htm
	*/
	M.initData = function(){
		
		//填充CSS数组
		M.all.cssnodes = jQuery('link[rel=stylesheet]');
        M.all.cssnodes.each(function (i,o) {
             if (/^\s*http/.test(o.href)) {
                 M.url.css.push(o.href);
             }
         });

         jQuery('style:not(html>style)').each(function (i, el) {
             //M.url.css.push('#inline#' + i);
         });

         jQuery.each(M.url.css, function (i) {
             M.loaded.css.push(false);
         });


         //填充JS数组
		 M.all.jsnodes = jQuery('script[src]');
         M.all.jsnodes.each(function (i,o) {
             if (/^\s*http/.test(o.src)) {
                 M.url.js.push(o.src);
             }
         });

         jQuery.each(M.url.js, function (i) {
             M.loaded.js.push(false);
         });
		 
		 var root = document.getElementsByTagName('html');
		 
		 if(root[0]){
			M.all.html = root[0].innerHTML;
		 }
	}
	
	M.getCSS = function () {
	
		if (M.url.css.length > 0) {
			//check external css file
			jQuery.each(M.url.css, function (i,url) {
				if (url.indexOf('#inline#') != -1) {
					M.loaded.css[i] = true;
				} else {
					chrome.extension.sendRequest({ action: 'single', sUrl: url, idx: i }, function (response) {
						//todo 404
						if (!response.txt) {
							var idx = jQuery('.mst-file-404').length,
								pos = jQuery(M.all.cssnodes[response.idx]).offset();
								
								M.UI.bubble({
									'id' : 'mst_css404err_goto_' + response.idx,
									'type' : 'err mst-file-404',
									'text' : '404',
									'innerHTML' : M.url.css[response.idx],
									'pos' : [-100,0]
								})

								jQuery('#mst_css404err_goto_' + response.idx).css({ 'left': idx * 160 + 5 }).animate({ 'top': window.innerHeight }, 'fast').animate({ 'top': 600 }, 'fast').animate({ 'top': 650 }, 'fast');
								M.loaded.css[response.idx] = true;

						} else {
						
							M.all.css.push({
								 url: url,
								 lastModified: response.dt,
								 fileSize: response.size,
								 contentType: response.chr,
								 text: response.txt,
								 index: response.idx
							})
							M.loaded.css[response.idx] = true;
						}
						
						
					});
				}
			});
		}
	}
	 
     M.getJS = function () {
	 
		if (M.url.js.length > 0) {
		
			jQuery.each(M.url.js, function (i,url) {

				chrome.extension.sendRequest({ action: 'static', sUrl: url, idx: i }, function (response) {

					if (response.err) {
						M.loaded.js[response.idx] = true;

							var idx = jQuery('.mst-file-404').length,
								pos = jQuery(M.all.jsnodes[response.idx]).offset();
								
								M.UI.bubble({
									'id' : 'mst_js404err_goto_' + response.idx,
									'type' : 'err mst-file-404',
									'text' : '404',
									'innerHTML' : M.url.js[response.idx]
								})

								jQuery('#mst_js404err_goto_' + response.idx).css({ 'left': idx * 160 + 5 }).animate({ 'top': window.innerHeight }, 'fast').animate({ 'top': 600 }, 'fast').animate({ 'top': 650 }, 'fast');

					} else {
					
							M.all.js.push({
								 url: url,
								 lastModified: response.dt,
								 fileSize: response.size,
								 contentType: response.chr,
								 text: response.txt,
								 index: response.idx
							 });
							M.loaded.js[response.idx] = true;
							 
					}
					
				});
				 
			});
		}
     }
	 
	function checkHTML(t){

		/* CHECK_FORM_INFORM */
		function check_form_inform() {
			var pass = true, pa, r = /<form[^>]*>(.*?)<\/form>/g;

			while ((pa = r.exec(t)) != null) {
				if (/<form>/.test(pa[1])) {
					pass = false;
				}
			}
			if (!pass) {
				var m = M.getString('forminform');
				var e = new factory({
					'type' : 'err',
					'message' : m
					});
				M.all.err.push(e);
				M.touchdown = true;
			}
			else {
				M.score += 3.2;
				M.UI.setScore(M.score);
			}
		}

		check_form_inform();
		/* BAN_BLOCKIN_INLINE */
		function ban_blockin_inline() {
			//是否通过检验
			var pass = true;
			/* 传入某一父元素标签，禁止在该父元素标签中添加block元素 */
			function verify_content(tag, childTag) {
				var pa, r = new RegExp("<" + tag + "[^>]*>(.*?)<\\/" + tag + ">", "g"), r2 = new RegExp("<" + childTag + ">");
				while ((pa = r.exec(t)) != null) {
					if (r2.test(pa[1])) {
						return false;
					}
				}
				return true;
			}
			var num = 0, elems = [];

			for (var i = 0, j = M.block.length; i < j; i++) {
				var o = M.block[i];
				if (!verify_content('a', o) || !verify_content('p', o) || !verify_content('pre', o)) {
					pass = false;
				}
			}

			if (!pass) {
				var m = M.getString('inlineblock');
				var e = new factory({
						'type' : 'err',
						'message' : m
					});
				M.all.err.push(e);
				M.touchdown = true;
			}
			else {
				M.score += 2.5;
			}
		}

		ban_blockin_inline();
		
		/* CHECK_HTML_MINIFY */
		function check_html_minify() {
			var lines = t.split(/\n/);
			var average_length_perline = t.length / lines.length;
			if (average_length_perline < 150) {
				var m = M.getString('htmlnomin');
				var e = new factory({
					'type' : 'warn',
					'message' : m
				});
				M.all.warn.push(e);
			}
			else {
				M.score += 8.2;
			}
		}
		getValue('CHECK_HTML_MINIFY',function(bl){
			if(bl){
				check_html_minify();
			}else{
				M.score += 8.2;
				M.UI.setScore(M.score);
			}
		});
		function getDocInfo() {
			var s = document.fileSize ?  M.getSize(document.fileSize) : (M.getBytes(t) / 1024).toFixed(2);
			var m = M.getString('htmlsize',[s]);
			var e = new factory({
					'type' : 'info',
					'message' : m
				});
			M.all.info.push(e);
		}
		getDocInfo();
	}
	
	//检测是否有标记未关闭
	function checkTagClosed(htm){
			
		var html = htm.replace(M.reg.comment, '');
		var tag = 'div,p,a,span,ul,ol,li,dd,em,strong,h1,h2,h3,h4,h5,h6,td,tr,tbody,tfoot,table,button,fieldset,form,label,textarea,select,option,script,style,iframe,object,map,noscript,sup,sub,pre'.split(',');
		var docCode = html.substring(html.indexOf('<body'), html.indexOf('</body>'));
		var hasErr = false;
		for (var i = 0; i < tag.length; i++) {
			var reg = new RegExp("<" + tag[i] + "[\\s>]", "gi");
			var reg2 = new RegExp("</" + tag[i] + ">", "gi");

			var tagstart = docCode.match(reg),
				tagend = docCode.match(reg2);
			
			var tagstartlen = (tagstart) ? tagstart.length : 0;
			var tagendlen = (tagend) ? tagend.length : 0;
			
			if (tagstartlen != tagendlen) {
				var num = Math.abs(tagstartlen - tagendlen);
				var m = M.getString('tagunclosed',[num,tag[i]]);
				var e = new factory({
						'type' : 'err',
						'message' : m
					});
				M.all.err.push(e);
				hasErr = true;
			}

		   }
			if (!hasErr) {
				M.score += 2;
			}
		
	}
	
	/* CHECK_STYLE_POS */
	function check_style_pos() {
		var num = 0, eles = [];
		jQuery('body style').each(function (i,o) {
			if (jQuery(o).parent().get(0).nodeName.toLowerCase() != 'head') {
				num++;
				eles.push(o);
			}
		});
		jQuery('body link[rel=stylesheet]').each(function (i,o) {
			if (jQuery(o).parent().get(0).nodeName.toLowerCase() != 'head') {
				num++;
				eles.push(o);
			}
		});
		if (num > 0) {
			var m = M.getString('styleinbody',[num,'<a href="#" id="ViewBodyStyle">' + M.getString('dtlnk') + '</a>']);
			var e = new factory({
					'type' : 'err',
					'message' : m
				});
			M.all.err.push(e);
			M.touchdown = true;

			jQuery('#ViewBodyStyle').live('click', function () {
				check_body_mixed(eles);
				return false;
			});
		}
		else {
			M.score += 2.5;
			M.UI.setScore(M.score);
		}
	}

	/* CHECK_SCRIPT_POS */
	function check_script_pos() {
		var num = 0;
		jQuery('#monster_source_pl .mst-js-block').each(function (i, el) {
			var ns = jQuery(el).nextAll(':visible');
				if(ns[0]){	//如果有可见元素，说明被混合在html中了
					num++;
					M.all.jsmix.push(jQuery('script')[i]);	//记录混合的JS索引
				}
		});
		num = M.all.jsmix.length;
		if (num > 0) {
			var m = M.getString('scriptinbody',[num]) +'<a href="#" rel="js" class="mst-view-static-mix" id="monster_view_jsmix">' + M.getString('dtlnk') + '</a>';
			var e = new factory({
				'type' : 'err',
				'message' : m
			});
			M.all.err.push(e);
			
		}else {
			M.score += 4.5;
			M.UI.setScore(M.score);
		}
		removeNode(doc.getElementById('monster_source_pl'));
	}
	
	/* CHECK_CSS_EXPRESSION */
	function check_css_expression(str, i) {
		var reg = M.reg.cssExpression;
		var mat = str.match(reg);
		if (mat) {
			var m = M.getString('cssexprssion',[mat.length,M.url.css[i].replace(/#inline#/g, '<style>')]);
			var e = new factory({
				'type' : 'warn',
				'message' : m
			});
			M.all.warn.push(e);
		} else {
			if (i == M.all.css.length - 1) { M.score += 4.6; }

		}
	}
		/* 检测混合在<body>标签中的script与style标签 */
        function check_body_mixed(arr) {

            jQuery(M.UI.pl).animate({ "left": "-795" }, 'fast', function () {
				jQuery(M.UI.pl).attr('data-mst-hide','1');
				
                jQuery(arr).each(function (i, el) {
					var htm = el.innerHTML || el.src || el.href;
					
					var eles = jQuery(el).nextAll('*:visible');
					var top = 0,
						left = 0;
						el = eles[0] ? eles[0] : el;
						
						if(el.id && el.id == 'monster_main'){
							el = jQuery(el).prevAll(':visible');
							top = jQuery(window).height() - 120;
							left = i * 100 + 50;
						}else{
							top = el.offsetTop;
							left = el.offsetLeft;
						}
                    jQuery('<div id="' + (i + 1) + '" class="mst-body-mixed"><span title="show">' + (i + 1) + '</span><em class="mst-hide" title="close"></em><div class="mst-body-mixed-ctr mst-hide" contenteditable="true">' + htm.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div></div>').appendTo('body').css({ 'top': top, 'left': left }).draggable({ 'cursor': 'move' });

                    jQuery('.mst-body-mixed span').click(function () {
                        jQuery(this).addClass('mst-hide');
                        jQuery('em', this.parentNode).removeClass('mst-hide');
                        jQuery('.mst-body-mixed-ctr', this.parentNode).removeClass('mst-hide');
                    });
                    jQuery('.mst-body-mixed em').click(function () {
                        jQuery(this).addClass('mst-hide');
                        jQuery('span', this.parentNode).removeClass('mst-hide');
                        jQuery('.mst-body-mixed-ctr', this.parentNode).addClass('mst-hide');
                    });
                });
                jQuery(M.UI.pl).one('mouseover', function () {
                    var attr = jQuery(M.UI.pl).attr('data-mst-hide');
						if(attr && attr == '1'){
							jQuery(this).animate({ "left": "100" }, 'fast');
						}

					jQuery(M.UI.pl).removeAttr('data-mst-hide');
                    jQuery('.mst-body-mixed').each(function (i, el) {
						jQuery(el).animate({ 'left': '-200em' }, 'fast',function(){jQuery(el).remove()});
                    });
                });
            });
        }
	function checkCSS(r, i, s, d) {

		check_css_expression(r, i);

		var t = r;
		M.all.cssnum++;

		/* CHECK_CSS_MINIFY */
		function check_css_minify() {
			var lines = t.split(/\n/);
			var average_length_perline = t.length / lines.length;
			if (lines.length > 10 && average_length_perline < 100) {
				M.all.minicssnum++;
			}
			if (M.all.cssnum == M.url.css.length && M.all.minicssnum > 0) {
				var m = M.getString('nomincss',[M.all.minicssnum]);
				var e = new factory({
					'type' : 'warn',
					'message' : m
				});
				M.all.warn.push(e);
			}
			if (M.all.cssnum == M.url.css.length && M.all.minicssnum == 0) {
				M.score += 8.2;
			}
		}
		getValue('CHECK_CSS_MINIFY',function(bl){
			if(bl){
				check_css_minify();
			}else{
				M.score += 8.2;
				M.UI.setScore(M.score);
			}
		})
		

		/* CHECK_CSS_SIZE */
		function check_css_size(s,d) {
			
			M.all.csssize.push(s);
			
			if (M.all.cssnum == M.url.css.length) {
			
				var jsize = 0, jsizeArr = [];
				for (var a = 0; a < M.all.csssize.length; a++) {
					jsize += M.all.csssize[a];
					jsizeArr.push(M.getSize(M.all.csssize[a]) + '|' + ((d) ? d : ''));
				}

				var size = M.getSize(jsize);
				var m = M.getString('csssize',[size,'<a href="#" target="_self" data-filetype="css" rel="' + jsizeArr.join('^') + '" class="mst-view-static">' + M.getString('dtlnk') + '</a>']);
				var e = new factory({
					'type' : 'info',
					'message' : m
				});
				M.all.info.push(e);

			}
		}

		check_css_size(s,d);

		/* BAN_CSS_IMPORT */
		function ban_css_import() {
			if (/@import/.test(t)) {
				M.all.importcssnum++;
			}
			if (M.cssCount == M.url.css.length && M.all.importcss > 0) {
				var m = M.getString('useimport',[M.all.importcssnum]);
				var e = new factory({
						'type' : 'err',
						'message' : m
					});
				M.all.err.push(e);
				M.touchdown = true;
			}
			if (M.cssCount == M.url.css.length && M.all.importcss == 0) {
				M.score += 2.7;
			}

		}

		ban_css_import();
	}

	///////////
	/* CHECK_JS_MINIFY */
	function check_js_minify(r, i) {
		
		var lines = r.split(/\n/);
		var average_length_perline = r.length / lines.length;
		if (lines.length > 10 && average_length_perline < 200) {
			M.all.js[i].minified = false;
			M.all.minijsnum++;
		}
		if (M.all.jsnum == M.url.js.length && M.all.minijsnum > 0) {
			var m = M.getString('nominjs',[M.all.minijsnum]);
			var src = [];
			jQuery(M.all.js).each(function(i, o){
				if(o.minified === false){
					src.push(M.url.js[o.index]);
				}
			})
			
			var e = new factory({
				'type' : 'warn',
				'message' : m + ' ' + src.join('，')
			});
			M.all.warn.push(e);
		}
		if (M.all.jsnum == M.url.js.length && M.all.minijsnum == 0) {
			M.score += 6.9;
		}
	}
	
	/* CHECK_JS_SIZE */
	function check_js_size(s, d) {

		M.all.jssize.push(s);
		if (M.all.jsnum == M.url.js.length) {
			var jsize = 0, jsizeArr = [];
			for (var a = 0; a < M.all.jssize.length; a++) {
				jsize += M.all.jssize[a];
				jsizeArr.push(M.getSize(M.all.jssize[a]) + '|' + ((d) ? d : ''));
			}

			var size = M.getSize(jsize);
			var m = M.getString('jssize',[size,'<a href="#" data-filetype="js" rel="' + jsizeArr.join('^') + '" class="mst-view-static">' + M.getString('dtlnk') + '</a>']);
			var e = new factory({
					'type' : 'info',
					'message' : m
				});
			M.all.info.push(e);
		}
	}
	
	
	function checkJS(r, i, s, d) {
		M.all.jsnum++;
		check_js_minify(r, i);
		check_js_size(s, d);
		
	}

	M.checkStatic = function(){
		//检查CSS
        if(M.url.css.length > 0){
		
			jQuery.each(M.all.css, function (i,o) {
				checkCSS(o.text, o.index, Number(o.fileSize), o.lastModified);
			})
			
        }else{
        
			M.score += 4.6 + 8.2 + 2.7;
			M.UI.setScore(M.score);
			
		}
		//检查JS
		getValue('CHECK_JS_MINIFY',function(bl){
			if(bl){
				if(M.url.js.length > 0 ){
					jQuery.each(M.all.js, function (i,o) {
						checkJS(o.text, o.index, Number(o.fileSize), o.lastModified);
					})
					
				}else{
			
					M.score += 6.9;
				}
			}else{
				M.score += 6.9;
			}
	
		});
		
		M.all.htm[0] && jQuery.each(M.all.htm,function(i,o){
					
			checkHTML(o);
			checkTagClosed(o.replace(M.reg.script, 'script'));
			create('div',{
				'id' : 'monster_source_pl',
				'innerHTML' : M.all.htm[0].substring(M.all.htm[0].indexOf('<body'),M.all.htm[0].indexOf('</body>')).replace(/src/gi,'data-src').replace(/<script/gi,'<textarea class="mst-js-block" ').replace(/<\/script>/gi,'</textarea>'),
				'appendTo' : doc.body//M.UI.pl
			});
			
			//check_style_pos();
			getValue('CHECK_STYLE_POS', function (style) {
				if (style) {
					check_style_pos();
				}else{
					M.score += 2.5;
				}
			});

			//check_script_pos();
			getValue('CHECK_SCRIPT_POS', function (js) {
				if (js) {
					check_script_pos();
				}else{
					M.score += 4.5;
				}
			});
			
		})
		
	
	}
	
	
	function checkRules() {
	
        /* CHECK_IMG_ALT */
        function check_img_alt() {
            var num = 0;
            var elems = [];
            jQuery('img').each(function (i,o) {

                if (jQuery(o).attr("alt") == "") {
                    num++;
                    elems.push(o);
                }
            });
            if (num > 0) {

                var m = M.getString('nosrc',[num]);
                var e = new factory({
						'type' : 'err',
						'message' : m, 
						'elems' : elems,
						'cssClass' : 'CHECK_IMG_ALT'
					});
                M.all.err.push(e);
                M.addCssClass(e, 'CHECK_IMG_ALT');
                M.touchdown = true;
            }
            else {
                M.score += 1.8;
            }
        }

        /* MAX_SCRIPT_NUM */
        function max_script_num(n) {
            var num = 0;
            jQuery('script').each(function (i,o) {
                if (o.src) {
                    num++;
                }
            });
            if (num > n) {
                var m = M.getString('maxjs',[num,n]);
                var e = new factory({
					'type' : 'warn',
					'message' : m
				});
                M.all.warn.push(e);
            }
            if (num <= 3) {
                M.score += 7.4;
            }
            else if (num == 4) {
                M.score += 5;
            }
            else if (num == 5) {
                M.score += 2.5;
            }
        }

        /* CHECK_HTTP_HTTPS */
        function check_http_https() {

            if (!/^https/.test(win.location.href)) {
                M.score += 3.6;
				M.UI.setScore(M.score);
                return;
            }
            var num = 0;
            var elems = [];
            var relate = ['iframe', 'img', 'embed'];
            jQuery.each(relate, function (i) {
                var tag = relate[i];
                jQuery(tag).each(function (j,o) {
                    var v = o.getAttribute('src');
                    if (tag == 'embed') {

                        if (v != null) {
                            if (!/^\s*https:/.test(v)) {
                                num++;
                                elems.push(o);
                            }
                        };

                    } else {
                        if (!v || !/^\s*https:/.test(v)) {
                            num++;
                            elems.push(o);
                        }
                    }

                });
            });
            if (num > 0) {
                var m = M.getString('nosrchttps',[num]);
                var e = new factory({
						'type' : 'err',
						'message' : m, 
						'elems' : elems, 
						'cssClass' : 'CHECK_HTTP_HTTPS'
					});
                M.all.err.push(e);
                M.addCssClass(e, 'CHECK_HTTP_HTTPS');

                M.touchdown = true;
            }
            else {
                M.score += 3.6;
            }
        }

        

        /* CHECK_ENCODING */
        function check_encoding() {
            var ch = document.charset || document.characterSet;
            var c = ch.toLowerCase();
            if (c.indexOf('utf-8') == -1 && c.indexOf('gbk') == -1) {
                var m = M.getString('encodingerr');
                var e = new factory({
					'type':'err',
					'message' : m
				});
                M.all.err.push(e);
            }
            else {
                M.score += 2.6;
				M.UI.setScore(M.score);
            }
        }

        /* MAX_LINKSTYLE_NUM */
        function max_linkstyle_num(n) {
		
			var num = jQuery('link').filter("[rel=stylesheet]").length;
            if (num > n) {
                var m = M.getString('maxcss',[num,CONFIG.MAX_LINKSTYLE_NUM]);
                var e = new factory({
					'type' : 'warn',
					'message' : m
				});
                M.all.warn.push(e);
            }
            if (num <= 2) {
                M.score += 7;
            }
            else if (num == 3) {
                M.score += 4.7;
            }
            else if (num == 4) {
                M.score += 2.4;
            }
        }
		
        /** CHECK_STYLE_MEDIA */
        function check_style_media() {
			
            var num = 0;
            var linkStyle = jQuery('link').filter("[rel=stylesheet]").each(function (i,o) {
                if (jQuery(o).attr('media') == "") {
                    num++;
                }
            });
            if (num > 0) {
                var m = M.getString('nomedia',[num]);
                var e = new factory({
					'type' : 'warn',
					'message' : m
				});
                M.all.warn.push(e);
                M.touchdown = true;
            }
            else {
                M.score += 2.1;
            }
        }

        /* MAX_CSSIMG_NUM */
        function max_cssimg_num(n) {
            var num, bg = [], ubg = [], url = [];
            jQuery('*', jQuery('body')).each(function (i,o) {
                var bgimg = jQuery(o).css('background-image');
                if (bgimg && bgimg != "none") {
                    if (bgimg.indexOf('file:') == -1) {     //Ignore Chrome extension elements background-image 04-21
						var imguri = bgimg.substring(bgimg.indexOf('(') + 1, bgimg.indexOf(')')).replace(/\"/g, "");
                        if(imguri != ''){	//2011.01.10
							bg.push(bgimg.replace(/\"/g, ""));
							url.push();
						}
                    }
                }
            });
            ubg = M.unique(bg);
            num = ubg.length;
            if (num > n) {
                var m = M.getString('maxbgimg',[num,CONFIG.MAX_CSSIMG_NUM,'<a href="#" rel="' + ubg.join('|') + '" class="ViewCSSBgImg">' + M.getString('dtlnk') + '</a>']);
                var e = new factory({
					'type' : 'warn',
					'message' : m
				});
                M.all.warn.push(e);
            }
            var urlarr = M.unique(url);
            if (urlarr.length > 1) check_404(urlarr, 'img');
            if (num <= 6) {
                M.score += 8.7;
            }
            else if (num >= 7 && num <= 10) {
                M.score += 6.5;
            }
            else if (num >= 11 && num <= 15) {
                M.score += 4.3;
            }
            else if (num >= 15 && num <= 19) {
                M.score += 2.1;
            }
        }

        /* CHECK_LOWER_CASE */
        function check_lower_case() {

        }

        /* BANNED_ELEMENT_TYPE */
        function banned_element_type() {
            var haveBan = false;
            var elems = CONFIG.BANNED_ELEMENT_TYPE;
            for (var i = 0, l = elems.length; i < l; i++) {
                var ifElem = jQuery(elems[i]);
                if (ifElem.length > 0) {
                    haveBan = true;
                    var m = M.getString('unsupport',[elems[i]]);
                    var e = new factory({
						'type' : 'err',
						'elems' : ifElem,
						'message' : m,
						'cssClass' : 'BANNED_ELEMENT_TYPE'
					});
                    M.all.err.push(e);
                    M.addCssClass(e, 'BANNED_ELEMENT_TYPE');
                    M.touchdown = true;
                }
            }
            if (!haveBan) {
                M.score += 2.7;
            }
        }

        /* CHECK_TITLE_INHEAD */
        function check_title_inhead() {
            var title = jQuery('head title');
            if (title.length != 1) {
                var m = M.getString('notitle');
                var e = new factory({
					'type' : 'err',
					'message' : m
				});
                M.all.err.push(e);
                M.touchdown = true;
            }
            else {
                M.score += 1.6;
            }
        }

        /* CHECK_FIRST_INHEAD */
        function check_first_inhead() {
            var hfirst = jQuery('head').children().get(0);
            var chr = hfirst.getAttribute('charset');

            if (chr) {
                //html5的编码声明
                M.score += 1.4;

            } else {
                if (hfirst.nodeName.toLowerCase() != 'meta' || !hfirst.getAttribute('http-equiv') || !hfirst.getAttribute('content')) {
                    var m = M.getString('metachr');
                    var e = new factory({
							'type' : 'err',
							'message' : m
						});
                    M.all.err.push(e);
                    M.touchdown = true;
                } else {
                    M.score += 1.4;

                }
            };
        }

        /** CHECK_INLINE_JS */
        function check_inline_js() {
            var num = 0,
				elems = [];
			
            jQuery('body, body *').each(function (i,el) {
			
                jQuery.each(M.arr.inlinejs, function (j,eo) {
					if (el.getAttribute(eo)) {
                        num++;
                        elems.push(el);
                    }

                });
            });
            if (num > 0) {
                var m = M.getString('inlinejs');
                var e = new factory({
						'type' : 'err',
						'elems' : elems,
						'message' : m,
						'cssClass' : 'CHECK_INLINE_JS'
					});
                M.all.err.push(e);
                M.addCssClass(e, 'CHECK_INLINE_JS');
            }
            else {
                M.score += 4.1;
            }
        }

        /* CHECK_SUBMIT_INFORM */
        function check_submit_inform() {
            var num = 0,
				elems = [];
            jQuery('form').each(function (i,o) {
                if (jQuery('input[type=submit]', o).length != 1) {
                    num++;
                    elems.push(o);
                }
            });
            if (num > 0) {
                var m = M.getString('nosubmit',[num]);
                var e = new factory({
					'type' : 'warn',
					'message' : m, 
					'elems' : elems, 
					'cssClass' : 'CHECK_SUBMIT_INFORM'
				});
                M.all.warn.push(e);
                M.addCssClass(e, 'CHECK_SUBMIT_INFORM');
            }
            else {
                M.score += 1.7;
            }
        }

        function check_input_hidden_pos() {
            var num = 0;
            var elems = [];
            jQuery('input[type=hidden]').each(function (i, el) {
                var pe = jQuery(this).nextAll(":not(input[type=hidden])");
                if (pe.get(0)) {
                    var pn = pe.get(0).nodeName.toLowerCase();
                    if (pn == 'table') {
                        num++;
                        elems.push(pe.get(0));
                    }
                }
            });
            if (num > 0) {
                var m = M.getString('inputhiddenerr',[num]);
                var e = new factory({
					'type' : 'warn',
					'message' : m, 
					'elems' : elems, 
					'cssClass' : 'CHECK_INPUT_HIDDEN'
				});
                M.all.warn.push(e);
                M.addCssClass(e, 'CHECK_INPUT_HIDDEN');
            }
        }

        function check_include_once() {
            var css = M.dup(M.url.css);
            var js = M.dup(M.url.js);
            if (css.length != 0) {
                var m = M.getString('repeatrequest',[M.unique(css).join('，'),'CSS']);
                var e = new factory({
					'type' : 'warn',
					'message' : m
				});
                M.all.warn.push(e);
            }
            if (js.length != 0) {
                var m = M.getString('repeatrequest',[M.unique(js).join('，'),'JS']);
                var e = new factory({
					'type' : 'warn',
					'message' : m
				});
                M.all.warn.push(e);
            }
        }

        /* CHECK_LABEL */
        function check_label() {
		
            var num = 0, elems = [], ele = [];
            jQuery('form input, form select, form textarea').each(function (i,o) {//, form button
            
				var hasId = o.id != "", hasWrap = jQuery(o).closest('label').length == 1, hasLabel = jQuery(o).closest('form').find('label[for=' + o.id + ']').length == 1;
                if (o.type == "hidden" || o.type == "button" || o.type == "submit") {
                    return;
                }

				if(hasWrap){ //嵌套
				
					if (hasId && !hasLabel){
						ele.push(o);
						ele.push(jQuery(o).closest('label')[0]);
					}
					
				}else{
				
					if ( !(hasId && hasLabel) ){
						num++;
						elems.push(o);
					}
				}
				
            });
            if (num > 0) {
                var m = M.getString('nolabel',[num]);
                var e = new factory({
					'type' : 'warn',
					'message' : m, 
					'elems' : elems,
					'cssClass' : 'CHECK_LABEL'
				});
                M.all.warn.push(e);
                M.addCssClass(e, 'CHECK_LABEL');
                M.touchdown = true;
            }
            else {
                M.score += 2.5;
            }
			if(ele.length>0){
			
				var m = M.getString('labelforerr',[ele.length/2]);	
				var e = new factory({
						'type' : 'warn',
						'message' : m, 
						'elems' : ele, 
						'cssClass' : 'CHECK_LABEL_FOR_ERR'
					});
					M.all.warn.push(e);
					
			}
        }

        /* MAX_ELEMENT_NUM */
        function max_element_num() {
            var num = jQuery('*').length;
            if (num > CONFIG.MAX_ELEMENT_NUM) {
                var m = M.getString('maxelement',[num,CONFIG.MAX_ELEMENT_NUM]);
                var e = new factory({
					'type' : 'warn',
					'message' : m
				});
                M.all.warn.push(e);
            }
            else {
                M.score += 2.8;
            }
        }

        function check_compat_mode(html5dtd) {

            if (html5dtd == 'html5') {
                if (document.doctype) {

                    if (document.doctype.name == 'html') {
                        M.score += 1;
                    } else {
                        if (M.data.htm[0].indexOf('<!DOCTYPE HTML>') != -1) {
                            M.score += 1;
                        } else {
                            var m = M.getString('doctypeerr');
                            var e = new factory({
								'type' : 'warn',
								'message' : m
							});
                            M.all.warn.push(e);
                        }
                    }

                } else {
                    var m = M.getString('doctypeerr');
                    var e = new factory({
							'type' : 'warn',
							'message' : m
						});
                    M.all.warn.push(e);
                }
            } else {
                if (document.compatMode == 'BackCompat') {
                     var m = M.getString('compatmodeerr',[document.doctype]) + M.getString('doctypeerr');
                    var e = new factory({
						'type' : 'warn',
						'message' : m
					});
                    M.all.warn.push(e);
                } else {
                    M.score += 1;
                }
            }
        }

        function check_html_word() {

        }

        /* CHECK_COOKIE_SIZE */
        function check_cookie_size() {
            try {
                var ck = document.cookie;
                var s = M.getBytes(ck);
                var size = M.getSize(s);
                if (size >= 30) {
                    var m = M.getString('maxcookie',[size,max]);
                    var e = new factory({
						'type' : 'warn',
						'message' : m
					});
                    M.all.warn.push(e);

                } else if (size >= 15) {
                    M.score += 3.2;
                } else {
                    M.score += 5.8;
                }

            } catch (e) {
            }
        }

        /* 404 */
        function check_404(arr, type) {
            jQuery(arr).each(function (i, el) {

                if (type == 'img') {
					var img = new Image();
                    img.src = el;
                    img.onerror = function () {
                        var idx = jQuery('.mst-body-mixed-err').length;
                        jQuery('<div class="mst-body-mixed mst-body-mixed-err"><span title="show">404</span><em class="mst-hide" title="close"></em><div class="mst-body-mixed-ctr mst-hide" contenteditable="true">' + ((el != '') ? el : 'background:url()') + '</div></div>').appendTo(document.body).draggable({ 'cursor': 'move' }).css({ 'left': idx * 160 + 5 }).animate({ 'top': document.documentElement.clientHeight }, 'fast').animate({ 'top': 600 }, 'fast').animate({ 'top': 650 }, 'fast');
                    }

                } else {
				
					/**
					* for Chrome
					*/
						chrome.extension.sendRequest({ action: 'static', sUrl: el, idx: i }, function (response) {
							if (response.err) {
								var m = M.getString('notfound',[response.url]);
								var e = new factory({
									'type' : 'warn',
									'message' : m
								});
								// todo
								//liWarn.push(e);
							}
						});
                }
            });
        }

        /* BAN_CSS_IMPORT */
        function ban_css_import() {
            jQuery('style').each(function (i,o) {
                if (/@import/.test(o.innerHTML)) {
                    M.all.importcss++;
                }
            });
        }

        /* NO_ID_SUBMIT */
        function no_id_submit() {
            var num = 0;
            var elems = [];
            if (jQuery('#submit').length != 0) {
                num++;
                var m = M.getString('idsubmit',[num]);
                var e = new factory({
					'type' : 'err',
					'message' : m, 
					'elems' : jQuery('#submit'), 
					'cssClass' : 'NO_ID_SUBMIT'
				});
                M.all.err.push(e);
                M.addCssClass(e, 'NO_ID_SUBMIT');
                M.touchdown = true;
            }
            else {
                M.score += 1.5;
            }
        }

        /* NO_DUP_ID */
        function no_dup_id() {
            var ids = [], elems = [];

            jQuery('*').each(function (i,o) {
                if (o.id && o.id != "") {
                    ids.push(o.id);
                }
            });
            var dups = M.dup(ids);
            if (dups.length != 0) {
                /* 重复的id值 */
                var uid = M.unique(dups);
                jQuery.each(uid, function (i) {
                    elems.push(jQuery('#' + uid).get(0));
                });
                var m = M.getString('ids',[dups.length]);
                var e = new factory({
					'type' : 'err',
					'elems' : elems,
					'message' : m,
					'cssClass' : 'NO_DUP_ID'
				});
                M.all.err.push(e);
                M.addCssClass(e, 'NO_DUP_ID');
                M.touchdown = true;
            }
            else {
                M.score += 1.5;
				M.UI.setScore(M.score);
            }
        }

		function check_haslayout(){
			
			var tags = ['div','span','p','a','li','ul','ol','dd','dt'];
			M.all.hasLayout = [];
				jQuery(tags).each(function(i,o){
						jQuery(o).each(function(j,e){
							var cs = e.currentStyle;
							!(cs.display=='inline' || cs.display=='' || cs.display==null) && !cs.hasLayout && M.all.hasLayout.push(e);
						});
				});
				if(M.all.hasLayout[1]){
					var m = M.getString('haslayout',[M.all.hasLayout.length,'<a href="#" class="view-haslayout">' + M.getString('dtlnk') + '</a>']);
					var e = new factory({
						'type' : 'warn',
						'message' : m
					});
					M.all.warn.push(e);
					
					jQuery('.view-haslayout').live('click',function(){
						jQuery(M.UI.pl).animate({ 'left': '-795px' }, 'fast',function(){
							jQuery(M.UI.pl).one('mouseover',function(){
								jQuery(this).animate({ "left": "100" }, 'fast');
								jQuery('.mst-tips-haslayout').remove();
							});
						});
						jQuery(M.all.hasLayout).each(function(i,e){
							jQuery('<a class="mst-tips-haslayout"><b>&lt;'+e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className?'.'+e.className:'')+'&gt;</b></a>').appendTo('body').css({'width':e.offsetWidth,'height':e.offsetHeight,'top':jQuery(e).offset().top+'px','left':jQuery(e).offset().left+'px'});
						});
						
						return false;
					});
				}

		}
		
		getValue('CHECK_HASLAYOUT',function(enc){
			//if(enc && (M.ie(6) || M.ie(7)))check_haslayout();
		})
		
		function contains(one){
			// 2011.01.10
			var arr = M.arr.property;
				arr = arr.concat(CONFIG.CUSTOM_PROPERTY_EXCEPTION);
				arr = arr.concat(M.arr.inlinejs);
			var bool = false;
			
			for(var i = 0;i < arr.length;i++){
				if(arr[i].toLowerCase() == one){
					bool = true;
					break;
				}
			}
			return bool;
		}
		
		function check_cumstom_property(){
			
			//bug 会找到界面上的东东
			jQuery('body,body *:not(.mst-main)').each(function (i,el) {
                var num = 0;
				var atts = el.attributes;
				
				for(var i = 0,j = atts.length; i < j; i++){
					var nm = atts[i].nodeName.toLowerCase();
					if(atts[i].specified && !contains(nm) && nm.indexOf('data-')!=0){
							var m = M.getString('customerattr',[atts[i].nodeName]);
							var e = new factory({
								'type' : 'warn',
								'message' : m, 
								'elems' : el, 
								'cssClass' : 'CHECK_CUSTOM_PROPERTY',
								'findstr' : atts[i].nodeName + '="' + atts[i].value + '"'
							});
							M.all.warn.push(e);
					}
				}
            });
		}
		
		function check_text_content(){
			var htmlsource = M.all.htm.join('');
			
			jQuery(CONFIG.CUSTOM_ERR_TEXT_CONTENT).each(function(i,el){
				if(htmlsource.indexOf(el)!=-1){
					var e = new factory({
						'type' : 'err',
						'message' : M.getString('spellingerr',[el, CONFIG.CUSTOM_RGT_TEXT_CONTENT[i]])
					});
						M.all.err.push(e);
						M.addCssClass(e, 'CHECK_TEXT_CONTENT');
				}
			})
			
		}
		
		getValue('CHECK_TEXT_CONTENT',function(enc){
			if(enc)check_text_content();
		})	

		function check_float(){
			var eles = jQuery('*',document.body);
				eles.each(function(i,o){
					var cs = o.currentStyle;
					if(cs.styleFloat==='left'){
						var e = o.parentNode;

						if(e && !e.currentStyle.hasLayout){
							jQuery('<a class="mst-tips-haslayout"><b>&lt;'+e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className?'.'+e.className:'')+'&gt;</b></a>').appendTo('body').css({'width':e.offsetWidth,'height':e.offsetHeight,'top':jQuery(e).offset().top+'px','left':jQuery(e).offset().left+'px'});
						}
					}
				});
		}
		//check_float();

        //max_script_num();
        getValue('MAX_SCRIPT_NUM', function (num) {
			
            if (typeof (num) != 'undefined') max_script_num(num);
        });

        //check_http_https();
        getValue('CHECK_HTTP_HTTPS', function (http) {
            if (http) {
                check_http_https();
            }
        });

        //check_encoding();
        getValue('CHECK_TITLE_INHEAD', function (enc) {
            if (enc) {
                check_encoding();
            }else{
				M.score += 2.6;
				M.UI.setScore(M.score);
            }
        });
		

        //max_linkstyle_num();
        getValue('MAX_LINKSTYLE_NUM', function (num) {
            if (typeof (num) != 'undefined') max_linkstyle_num(num);
        });

        //check_style_media();
        getValue('CHECK_STYLE_MEDIA', function (media) {
            if (media){
				check_style_media();
            }else{
				M.score += 2.1;
				M.UI.setScore(M.score);
            }
        });


        //max_cssimg_num();
        getValue('MAX_CSSIMG_NUM', function (num) {
            if (typeof (num) != 'undefined') max_cssimg_num(num);
        })

        //banned_element_type();
        getValue('BANNED_ELEMENT_TYPE', function (banned) {
            if (banned) banned_element_type();
        });
        //probar.animate({ 'width': '20%' }, 'fast');

        //check_title_inhead();
        getValue('CHECK_TITLE_INHEAD', function (title) {
            if (title) check_title_inhead();
        });

        //
        getValue('CHECK_COMPAT_MODE', function (js) {
            if (js) check_compat_mode();
        });

        //check_inline_js();
        getValue('CHECK_INLINE_JS', function (js) {
            if (js) check_inline_js();
        });

        //check_img_alt();
        getValue('CHECK_IMG_ALT', function (alt) {
            if (alt) check_img_alt();
        });

        //check_submit_inform();
        getValue('CHECK_SUBMIT_INFORM', function (sub) {
            if (sub) check_submit_inform();
        });

        check_input_hidden_pos();
        check_include_once();

        //check_label();
        getValue('CHECK_LABEL', function (lab) {
            if (lab){
				check_label();
            }else{
				M.score += 2.5;
				M.UI.setScore(M.score);
            }
        });

        //max_element_num();
        getValue('MAX_ELEMENT_NUM', function (num) {
            if (typeof (num) != 'undefined') max_element_num(num);
        });

        //ban_css_import();
        getValue('BAN_CSS_IMPORT', function (importcss) {
            if (importcss) ban_css_import();
        });

        //no_id_submit();
        getValue('NO_ID_SUBMIT', function (subId) {
            if (subId) no_id_submit();
        });

        //no_dup_id();
        getValue('NO_DUP_ID', function (dupId) {
            if (dupId) no_dup_id();
        });

        //check_cookie_size();
        getValue('CHECK_COOKIE_SIZE', function (js) {
            if (js) check_cookie_size();
        });

		
		
		function check_set_attr(){
			/*jQuery(M.all.js).each(function(i,el){
				if(eo.text.indexOf('.' + el) != -1)
					M.arr.property
				}
			})*/
		}
		
		function checkForIE6(){
			
			//为IE6、IE7检测maxLength大小写问题
			jQuery('input[maxlength]').each(function(i,el){
				jQuery(M.all.js).each(function(j,eo){
					if(eo.text.indexOf('.maxlength') != -1 || eo.text.indexOf('"maxlength"') != -1){
						var m = M.getString('maxlengtherr',[eo.url]),
							e = new factory({
								'type' : 'warn',
								'message' : m,
								'elems' : el , 
								'cssClass' : 'CHECK_MAX_LENGTH',
								'findstr' : 'maxlength'
							});
							M.all.warn.push(e);
					}
				})
			})
			
		}
		
		getValue('CHECK_FOR_IE6',function(bl){
			if(bl){
				checkForIE6();
			}
		})

		function addMarker(el,str,cls){
			jQuery('<b class="mst-marker'+(cls?' '+cls:'')+'"><u class="mst-marker-container">'+str+'</u></b>').insertBefore(el);
		}
		
		function show_tabindex(){
            jQuery('form input:not(input[type=hidden]),form select,form textarea,form button,form objcet,form embed').each(function (i,el) {
				addMarker(el,'tabindex:'+el.getAttribute('tabindex'),'mst-marker-tabindex');
            });
		}
		
		getValue('SHOW_TABINDEX',function(enc){
			if(enc)show_tabindex();
		})

		function show_empty_link(){
			var elems = [];
			jQuery('a').each(function(i,el){
				var uri = el.getAttribute('href');
				var nm = el.getAttribute('name');
				if(uri && uri !=''){
				}else{
					if(nm && nm !=''){
					}else{
						elems.push(el);
					}
				}
			})
			if(elems.length>0){
			
				var m = M.getString('emptylinks',[elems.length]);
				var e = new factory({
					'type' : 'warn',
					'message' : m, 
					'elems' : elems, 
					'cssClass' : 'CHECK_EMPTY_LINK'
				});
					M.all.warn.push(e);
					M.addCssClass(e, 'CHECK_EMPTY_LINK');
			}
		}
		
		getValue('CHECK_EMPTY_LINK',function(enc){
			if(enc)show_empty_link();
		})
		
		getValue('CHECK_CUSTOM_PROPERTY',function(enc){
			if(enc)check_cumstom_property();
		})
    }
	
	M.UI = {
		pl : null,
		progressbar : null,
		setScore : function(num){
			var score = jQuery('#monster_score_num');
			var eff = jQuery('#monster_score_effect');
			var txt = (num / M.original_score * 100).toFixed(2);
			eff.text(score.text()).stop().animate({
					'font-size' : 200,
					'opacity' : 0
				},
				'fast',
				function(){
					eff.text(txt).animate({
						'font-size' : 100,
						'opacity' : 1
					},'fast',function(){
						score.text(txt);
						M.UI.score.innerHTML = txt;
						M.UI.title.innerHTML = '<span style="color:red;">' + M.all.err.length + '</span> '+ M.getString('errors') + '，<span style="color:#ff0;">' + M.all.warn.length + '</span> '+ M.getString('warns') + '，<span style="color:#46A7F6">' + M.all.info.length + '</span> '+ M.getString('messages') + '。';
					})
				}
			)

		},
		create : function () {

			M.UI.hideCtrl(true);
			
			M.UI.pl = create('div',{
				'id' : 'monster_main',
				'class' : 'mst-main',
				'appendTo' : doc.body
			});
			
			M.UI.splash = create('div',{
				'id' : 'monster_splash',
				'class' : 'mst-splash',
				'innerHTML' : '<li class="mst-spl-err" title="' + M.getString('showerrlist') + '"><div class="mst-spl-txt"><span id="monster_err_num">0</span>ERRORS</div></li><li class="mst-spl-warn" title="' + M.getString('showwarnlist') + '"><div class="mst-spl-txt"><span id="monster_warn_num">0</span>WARNINGS</div></li><li class="mst-spl-info" title="' + M.getString('showsuglist') + '"><div class="mst-spl-txt"><span id="monster_info_num">0</span>INFOMATION</div></li><li class="mst-spl-score"><span title="' + M.getString('showalllist') + '" id="monster_score_num">100</span><span id="monster_score_effect">100</span></li>',
				'appendTo' : M.UI.pl
			});
			
			//绑定行为
			jQuery(M.UI.pl).draggable({
				'cancel': 'p, #monster_content',
				'cursor': 'move',
				'opacity': '.45'
			})
			
			M.UI.progressbar = create('div',{
				'id' : 'mst_processbar',
				'class' : 'mst-processbar',
				'appendTo' : M.UI.pl
			});
			jQuery(M.UI.progressbar).css({'display' : 'none'});
			
			M.UI.titlebar = create('div',{
				'id' : 'mst_title_bar',
				'class' : 'mst-title-bar',
				'appendTo' : M.UI.pl
			});
			jQuery(M.UI.titlebar).css({'display' : 'none'});

			M.UI.title = create('p',{
				'id' : 'mst_title',
				'class' : 'mst-title',
				'appendTo' : M.UI.titlebar
			});
			
			// 关闭按钮
			M.UI.closebtn = create('span',{
				'id' : 'monster_close',
				'class' : 'mst-close',
				'title' : M.getString('closelnk'),
				'appendTo' : M.UI.titlebar
			});
			
			//缩小和放大按钮
			M.UI.minMaxbtn = create('span',{
				'id' : 'monster_toggle',
				'class' : 'mst-min',
				'title' : M.getString('minmax'),
				'appendTo' : M.UI.titlebar
			});
			
			// for Chrome
			M.UI.optionbtn = create('span',{
				'id' : 'monster_option',
				'class' : 'mst-option',
				'title' : M.getString('optionlnk'),
				'innerHTML' : 'option',
				'appendTo' : M.UI.titlebar
			});
			
			M.UI.mstcnt = create('div',{
				'id' : 'monster_content',
				'class' : 'mst-content',
				'appendTo' : M.UI.pl
			});
			jQuery(M.UI.mstcnt).css({ 'height': '504px' });
			
			M.UI.viewpl = create('div',{
				'id' : 'monster_viewpl',
				'class' : 'mst-view-pl mst-hide',
				'appendTo' : doc.body
			}); 
			jQuery().css({'background':'#000'});
			
			M.UI.viewplback = create('div',{
				'id' : 'monster_viewplback',
				'class' : 'mst-spl-back',
				'title' : M.getString('backlnk'),
				'innerHTML' : 'RETURN',
				'appendTo' : M.UI.viewpl
			});  

			M.UI.viewfilepl = create('div',{
				'id' : 'monster_viewfilepl',
				'class' : 'mst-view-file-pl',
				'appendTo' : M.UI.viewpl
			});
			M.UI.viewcssbgpl = create('div',{
				'id' : 'monster_viewcssbgpl',
				'class' : 'mst-view-cssbg-pl',
				'appendTo' : M.UI.viewpl
			});
			
			M.UI.splashback = create('div',{
				'id' : 'mst_splash_back',
				'class' : 'mst-spl-back',
				'title' : M.getString('backlnk'),
				'innerHTML' : 'RETURN',
				'appendTo' : M.UI.mstcnt
			});
			
			M.UI.errcnt = create('div',{
				'id' : 'mst_err_ctr',
				'class' : 'mst-err-ctr',
				'appendTo' : M.UI.mstcnt
			});
			
			M.UI.warncnt = create('div',{
				'id' : 'mst_warn_ctr',
				'class' : 'mst-warn-ctr',
				'appendTo' : M.UI.mstcnt
			});
			
			M.UI.infocnt = create('div',{
				'id' : 'mst_info_ctr',
				'class' : 'mst-info-ctr',
				'appendTo' : M.UI.mstcnt
			});
			
			M.UI.score = create('div',{
				'id' : 'monster_score',
				'class' : 'mst-score',
				'appendTo' : M.UI.titlebar
			});
			
			//bind
			jQuery(M.UI.closebtn).hover(function () {
				jQuery(this).css({
					'opacity': '1'
				});
			}, function () {
				jQuery(this).css({
					'opacity': '.5'
				});
			}).bind('click', function (e) {
				M.UI.close();
			});
			//bind
			jQuery(M.UI.minMaxbtn).css({'background-position' : '0 0'}).hover(function () {
			
				jQuery(this).css({
					'opacity': (M.folded ? 1 : .5)
				});
				
			}, function () {
				jQuery(this).css({
					'opacity': (M.folded ? 1 : .5)
				});
			}).toggle(function (e) {
				M.folded = false;
				jQuery(M.UI.mstcnt).animate({ 'height': 'hide' }, 'fast');
				jQuery(M.UI.splash).animate({ 'height': 'hide' }, 'fast');

				jQuery(this).css({
					'background-position': '-50px 0'
				});
				jQuery('.mst-score').removeClass('mst-score-max');


			}, function (e) {//最小化
				M.folded = true;

				jQuery(M.UI.mstcnt).animate({ 'height': 'show' }, 'fast');

				jQuery(this).css({
					'background-position': '-50px 0'
				});
				jQuery('.mst-score').addClass('mst-score-max');

			});
			
			//M.shown = true;

		},
		bubble: function(obj){
			var options = {
				'id' : obj.id || 'monster_bubble_1',
				'type' : obj.type || 'cue',
				'text' : obj.text || 'DETAIL',
				'innerHTML' : obj.innerHTML || '',
				'pos' : obj.pos || [0,0]
			}
			var bubble = doc.getElementById(options.id);
			if(!bubble){
				bubble = create('div',{
					'id' : options.id,
					'class' : 'mst-body-mixed mst-body-mixed-' + options.type,
					'innerHTML' : '<span title="show">' + options.text + '</span><em class="mst-hide" title="close"></em><div class="mst-body-mixed-ctr mst-hide" contenteditable="true">' + options.innerHTML + '</div>',
					'appendTo' : doc.body
				})
				
				jQuery(bubble).animate({'top': options.pos[0],'left':options.pos[1]},'fast').draggable({ 'cursor': 'move' });
				jQuery('span', bubble).click(function(){
					jQuery('em,.mst-body-mixed-ctr', bubble).removeClass('mst-hide');
					jQuery(this).addClass('mst-hide');
				})
				jQuery('em', bubble).click(function(){
					jQuery('.mst-body-mixed-ctr', bubble).addClass('mst-hide');
					jQuery(this).addClass('mst-hide');
					jQuery('span',bubble).removeClass('mst-hide');
				})
			}
      	
		},
		close : function(){
			var pl = jQuery(M.UI.pl);
			pl.animate({ 'opacity': 'hide' }, 'fast', function () {
				var pl0 = pl[0];
					pl0 && pl0.parentNode.removeChild(pl0);
				
			});
			localStorage.removeItem("Monster");
			
			M.UI.hideCtrl(false);
			
			//for Chrome
			window.chrome && chrome.extension && chrome.extension.sendRequest && chrome.extension.sendRequest({name: 'MST_disableIcon'});
		},
		bind: function () {

			

			jQuery('.mst-spl-score span').click(function () {

				jQuery(M.UI.splash).animate({ 'height': 'hide' }, 'fast');
				jQuery(M.UI.mstcnt).animate({ 'height': 'show' }, 'fast');
				jQuery(M.UI.titlebar).css({ 'display': 'block' });

				jQuery(M.UI.errcnt).animate({ 'height': 'show' }, 'fast');
				jQuery(M.UI.warncnt).animate({ 'height': 'show' }, 'fast');
				jQuery(M.UI.infocnt).animate({ 'height': 'show' }, 'fast');
			});

			jQuery('li:not(.mst-spl-score)', M.UI.splash).click(function () {

				var attr = this.className.split('-')[2];
				jQuery(M.UI.splash).animate({ 'height': 'hide' }, 'fast');
				jQuery(M.UI.mstcnt).animate({ 'height': 'show' }, 'fast');
				jQuery(M.UI.errcnt).animate({ 'height': 'hide' }, 'fast');
				jQuery(M.UI.warncnt).animate({ 'height': 'hide' }, 'fast');
				jQuery(M.UI.infocnt).animate({ 'height': 'hide' }, 'fast');
				jQuery('#mst_' + attr + '_ctr').animate({ 'height': 'show' }, 'fast');
				jQuery(M.UI.titlebar).css({ 'display': 'block' });

			});

			jQuery(M.UI.splashback).click(function () {
				jQuery(M.UI.splash).animate({ 'height': 'show' }, 'fast');
				jQuery(M.UI.mstcnt).animate({ 'height': 'hide' }, 'fast');
				jQuery(M.UI.titlebar).css({ 'display': 'none' });
				jQuery('.mst-body-mixed').each(function (i, el) {
					jQuery(el).animate({ 'height': 'hide' }, 'fast');
				});
			});
			
			jQuery('.mst-spl-back').live('click',function () {
				var attr = jQuery(M.UI.pl).attr('data-mst-hide');
					if(attr && attr == '1'){
						jQuery(M.UI.pl).animate({ "left": "100" }, 'fast').removeAttr('data-mst-hide');
					}
				
				jQuery(M.UI.viewpl).animate({ 'height': 'hide' }, 'fast');
			});
			jQuery('.ViewCSSBgImg').live('click', function () {
				jQuery(M.UI.viewpl).animate({ 'height': 'show' }, 'fast');
				jQuery(M.UI.viewfilepl).addClass('mst-hide');
				jQuery(M.UI.viewcssbgpl).removeClass('mst-hide');

				jQuery(M.UI.pl).animate({ 'left': '-200em' }, 'slow',function(){
					jQuery(M.UI.pl).attr('data-mst-hide','1');
				});

				jQuery(M.UI.viewcssbgpl).html('<ul></ul><div id="ViewCSSBgImgPl" class="mst-cssbg-viewer"></div>');

				var imgs = this.rel.split('|');
				jQuery(imgs).each(function (i, el) {
					var bgi = el.substring(el.indexOf('(') + 1, el.indexOf(')'));
					jQuery('<li title="' + bgi + '" id="ViewCSSBgImg-' + i + '"><span class="img" style="background-image:' + el + '"></span></li>').appendTo('.mst-view-cssbg-pl ul');

					var img = jQuery('<img src="' + bgi + '" class="mst-hide" />').appendTo('body');
					img[0].onload = function () {
						var sz = M.getSize(this.fileSize);
						jQuery('#ViewCSSBgImg-' + i).attr('rel', this.src + '|' + i + '|' + sz + '|' + this.lastModified);
						jQuery('<em' + ((sz > 30) ? ' style="color:#f00"' : '') + '>' + (isNaN(sz)) ? '' : sz + 'KB</em>').appendTo('#ViewCSSBgImg-' + i);
					};
					img.onerror = function () {
						jQuery('#ViewCSSBgImg-' + i).attr('rel', null + '|' + i + '|' + null + '|' + null);
						jQuery('<em style="color:#f00"' + '>404</em>').appendTo('#ViewCSSBgImg-' + i);
					}

				});
				jQuery('.mst-view-cssbg-pl li').mouseover(function () {
					var info = this.getAttribute('rel').split('|');
					jQuery('.mst-cssbg-viewer').html('<h3>' + info[0] + ' <span>' + (new Date(info[3])).toLocaleDateString() + '</span></h3><img src="' + info[0] + '" />');
				});
				jQuery('.mst-view-cssbg-pl li').click(function () {
					window.open(this.title);
				});

				return false;

			});
			
			jQuery('.mst-option').click(function(){
				chrome.extension.sendRequest({action:'viewOption'}, function(response) {  
					
				});
			});
			
			//查看静态文件位置及大小
			jQuery('.mst-view-static').live('click', function () {
				var htm = [],
					arr = this.rel.split('^'),
					filetype = this.getAttribute('data-filetype'),
					filearr = filetype == 'js' ? M.all.js : M.all.css,
					nodes = filetype == 'js' ? M.all.jsnodes : M.all.cssnodes;

				//界面动画
				jQuery(M.UI.viewpl).animate({ 'height': 'show' }, 'fast');
				jQuery(M.UI.viewfilepl).removeClass('mst-hide');
				jQuery(M.UI.viewcssbgpl).addClass('mst-hide');
				jQuery(M.UI.pl).animate({'left' : '-200em'},'slow').attr('data-mst-hide','1');

				jQuery(arr).each(function (i, el) {
					var info = el.split('|'),
						tstamp = filearr[i].url.split('?'),
						hasTstamp = false;
						
					if (tstamp[1]) {
						hasTstamp = /2010[0-9]{4,}/.test(tstamp[1]);
					}
					
					htm.push('<div class="mst-file-item mst-' + filetype + '-url" id="monster_' + filetype + '_files_' + i + '" rel="' + i + '"><span class="mst-furl">' + filearr[i].url + '<span><span class="mst-mdtime" title="' + info[1] + '">' + ((hasTstamp) ? info[1] : '') + '</span><span class="mst-fsize">' + ((info[0] == '0.00') ? '' : info[0] + 'KB') + '</span></div>');
				});

				jQuery(M.UI.viewfilepl).html(htm.join(''));

				nodes.each(function (i, el) {
					
					var filebar = jQuery('#monster_' + filetype + '_files_' + i);
					if (jQuery(el).parent().get(0).nodeName.toLowerCase() == 'head') {
						filebar.animate({ 'top': i * 33 }, 'fast');
					} else {
						var ns = jQuery(el).nextAll('*:visible');
						if (ns.get(0)) {
							if (ns.get(0).id == 'monster_main') {
								filebar.animate({ 'top': window.innerHeight - (nodes.length - 1 - i) * 33 - jQuery(filebar).height() - 10 }, 'fast');
							} else {
								filebar.animate({ 'top': ns.get(0).offsetTop + (nodes.length - 1 - i) * 33 - jQuery(filebar).height() - 10 }, 'fast');
							}
						}
					}
				});

				return false;
			});
			
			jQuery('.mst-view-static-mix').live('click', function () {
				var rel = this.rel;
				check_body_mixed(rel == 'js' ? M.all.jsmix : M.all.cssmix);
				return false;
			});


			M.shown = true;

		},
		hideCtrl : function (bl) {
			var val, val2;
			if(bl === true){
				val = 'none';
				val2 = 'Opaque';
			}else{
				val = 'inline-block';
				val2 = '';
				jQuery('.mst-marker-tabindex').remove();
			}
			jQuery('object').each(function (i, el) {
				el.setAttribute('wmode', val2);
				jQuery(el).css('display' , val);
			})

		}

	}
	
	M.getHTML = function(){
		jQuery.ajax({
			url : M.pageUri.split('#')[0],
			success : function(msg){
				M.all.htm.push(msg);
				M.loaded.htm = true;
			}
		});
	}
	
    M.show = function () {
        
		if(!M.shown){
			checkRules();
		}
		
        M.timer = setInterval(function () {
		
			if (M.loaded.htm && M.allTrue(M.loaded.css) && M.allTrue(M.loaded.js)) {
				M.checkStatic();
				M.UI.bind();
            }
			if (M.shown) {
				clearInterval(M.timer);
				return;
			}
			
        }, 100);
    }

    M.init = function () {
		M.UI.create();
		M.initData();
		M.getHTML();	
		M.getCSS();
		M.getJS();
		M.show();
    }
	/**
	* for Chrome
	*/
	M.open = function(){
		localStorage.setItem("Monster", "1,1");
		M.init();
	}
	
	M.toggle = function(){
		if(M.shown){
			chrome.extension.sendRequest({name: "MST_disableIcon"});
			jQuery(M.UI.pl).css('display','none');
			//localStorage.setItem("Monster", "1,0");
			localStorage.removeItem("Monster");
			location.reload();
		}
	}
	
})();

// *************************************************************************************************

var isActive = false;
var isOpen = false;
var extensionURL = null;

// *************************************************************************************************

var loadStateData = function()
{
    var MonsterData = localStorage.getItem("Monster");
	isActive = false;
    isOpen = false;
    extensionURL = chrome.extension.getURL("");
    
    if (MonsterData)
    {
        MonsterData = MonsterData.split(",");
        isActive = MonsterData[0] == "1";
        isOpen = MonsterData[1] == "1";
    }
}

// *************************************************************************************************

var loadMonster = function(){
	Monster.init();
}

loadStateData();
if (isActive)
    loadMonster();

// *************************************************************************************************

var message = isActive ? "MST_enableIcon" : "MST_disableIcon";
chrome.extension.sendRequest({name: message});

// *************************************************************************************************

chrome.extension.onRequest.addListener
(
    function(request, sender, sendResponse)
    {
        if (request.name == "MST_isActive")
        {
            loadStateData();
            sendResponse({value: ""+isActive});
        }
        else if (request.name == "MST_loadMonster")
        {
            setTimeout(function(){
            
                loadStateData();
                
                loadMonster();
                
                isActive = true;
                var message = isActive ? "MST_enableIcon" : "MST_disableIcon";
                chrome.extension.sendRequest({name: message});
                
                
            },0);
            sendResponse({});
        }else if(request.name == "MST_toggleMonster"){
			Monster.toggle();
		}
        else
            sendResponse({}); // snub them.
    }
);

// *************************************************************************************************