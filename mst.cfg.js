/** 配置对象，用来配置检测的情况 */
var CONFIG = {
	/** 最大允许页面的外部script元素个数 */
	MAX_SCRIPT_NUM : 5, 
	/** 
	 * 是否检查https的链接
	 * 检查的元素有iframe img embed
	 */
	CHECK_HTTP_HTTPS : true, 
	/** 是否检查style元素的位置 */
	CHECK_STYLE_POS : true, 
	/** 是否检查script元素的位置 */
	CHECK_SCRIPT_POS : true, 
	/** 检查文件的encoding */
	CHECK_ENCODING : true, 
	/** 最大允许外部style文件的个数 */
	MAX_LINKSTYLE_NUM : 4, 
	/** 最大允许CSS背景图片文件个数 */
	MAX_CSSIMG_NUM : 15, 
	/** 元素和属性名小写检查 */
	CHECK_LOWER_CASE : true, 
	/** 禁止使用的包含样式特征的表现型元素 */
	BANNED_ELEMENT_TYPE :'acronym,applet,basefont,big,center,dir,font,frame,frameset,noframes,s,strike,tt,u,xmp'.split(','), //['basefont', 'font', 'center', 'hr', 'tt', 'i', 'b', 'u', 's', 'strike', 'big', 'small'],        /** head中是否包含title元素的检查 */
	CHECK_TITLE_INHEAD : true, 
	/** 检查head元素中第一个元素是否是指定http-equiv的元素，且必须使用utf-8 */
	CHECK_FIRST_INHEAD : true, 
	/** 查看是否有inline javascript*/
	CHECK_INLINE_JS : true, 
	/** 查看每一个link引用的style是否添加media属性 */
	CHECK_STYLE_MEDIA : true, 
	/** 查看img是否提供了alt属性 */
	CHECK_IMG_ALT : true, 
	/** 严禁form中再嵌套form */
	CHECK_FORM_INFORM : true, 
	/** 一个form中有且仅有一个type submit元素*/
	CHECK_SUBMIT_INFORM : true, 
	/** 查看form下控件是否有对应的label元素 */
	CHECK_LABEL : true, 
	/** 最大元素个数限制 */
	MAX_ELEMENT_NUM: 1000,
	/** 检测未关闭标记 */
	CHECK_TAG_CLOSED: true, 
	/** 查看HTML文件是否压缩 */
	CHECK_HTML_MINIFY : true, 
	/** 查看HTML文件的大小 */
	CHECK_HTML_SIZE: true, 
	/** 查看CSS文件大小 */
	CHECK_CSS_SIZE: true, 
	/** 查看js文件的大小 */
	CHECK_JS_SIZE: true, 
	/** 禁止使用import规则引入CSS文件 */
	BAN_CSS_IMPORT: true, 
    /** 禁止a元素中添加block element */
	BAN_BLOCKIN_INLINE : true, 
	/** 查看没有使用 submit 作为id的元素 */
	NO_ID_SUBMIT: true, 
	/** 没有重复的 ID */
	NO_DUP_ID : true, 
	/** CSS文件内容是否压缩 */
	CHECK_CSS_MINIFY : true, 
	/** js文件内容是否压缩 */
	CHECK_JS_MINIFY: true,
	/** 检测< >是否出现在内容中 */
	CHECK_LTGT_STRING: true,
	/** 检测compatMode是否为CSS1Compat */
	CHECK_COMPAT_MODE: true,
	/** 禁止使用CSS Expression */
	CHECK_CSS_EXPRESSION: true,
	/** 检测Cookie大小 */
	CHECK_COOKIE_SIZE: true,
	/** 检测hasLayout */
	CHECK_HASLAYOUT: true,
	CHECK_TEXT_CONTENT:true,
	CUSTOM_ERR_TEXT_CONTENT:['帐户','帐单','登陆'],
	CUSTOM_RGT_TEXT_CONTENT:['账户','账单','登录'],
	SHOW_TABINDEX: true,
	CHECK_EMPTY_LINK:true,
	CHECK_FOR_IE6:true,
	CHECK_CUSTOM_PROPERTY: false,
	CUSTOM_PROPERTY_EXCEPTION:['storetargetid','seed'],
    eBdWidth : 2,
    eBdStyle: 'dotted',
    eBdColor : 'red'
};

/* end of config */