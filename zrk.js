/**
 *	自动签到宅人库
 *	
 *	@module autoSignZrk
 */

	/**
	 *	签到成功后调用, 这用事件来搞其实比较合适
	 *
	 *	@attribute signSuccessHandler
	 */
var signSuccessHandler = null, 
	/**
	 *	签到失败后调用
	 *
	 *	@attribute signSuccessHandler
	 */
	signFailedHandler = null,
	/**
	 *	账号信息
	 *	
	 *	@attribute config
	 */
	 config = require('./config'),
	 logger = require('./logger');

 /**
  *	login to http://bbs.zairenku.com/
  *
  *	@method login
  */
function login(){
	logger.log('start login bbs.zairenku.com .........');
	//
	var http = require('http');
	var querystring = require('querystring');
	var postData = querystring.stringify({
		forward:'',
		jumpurl:'http://bbs.zairenku.com/index.php',
		step: 2,
		lgt: 0,
		pwuser: config.zrkInfo.username,
		pwpwd: config.zrkInfo.password,
		hideid: 0,
		submit:''
	});
	var options = {
		hostname: 'bbs.zairenku.com',
		path: '/login.php?',
		port: 80,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Host': 'bbs.zairenku.com',
			'Connection': 'keep-alive',
			'Content-Length': Buffer.byteLength(postData),
			'Cookie': '',
			'Referer': 'http://bbs.zairenku.com/',
			'Origin':'http://bbs.zairenku.com',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36'
		}
	};
	var request = http.request(options, function(res){
		var cookie = getCookie(res.headers['set-cookie']);
		if (cookie.indexOf('bd823_winduser') > 0) {	
			logger.log('bd823_winduser login successed......');
			getSignCookie(cookie);
			return;
		}
		logger.log('login zrk failed......');
		signFailedHandler('login zrk failed ......');
	});
	request.write(postData);
	request.end();
}
/**
 *	因为这货是单独又开了一个页面去签到, 于是我们再去获得一次cookie, 并且和登录的cookie拼接起来
 *
 *	@method getSignCookie
 *	@param	String loginCookie is 登录时获得的cookie
 */
function getSignCookie(loginCookie){
	logger.log('start get sign cookie .....');
	//
	var http = require('http');
	var options = {
		hostname: 'bbs.zairenku.com',
		path: '/xqqiandao',
		port: 80,
		method: 'POST',
		headers:{
			'Host':'bbs.zairenku.com',
			'Referer':'http://bbs.zairenku.com/',
			'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
			'Cookie':loginCookie
		}
	};
	var request = http.request(options, function(res){
		var cookie = getCookie(res.headers['set-cookie']);
		loginCookie += cookie;
		sign(loginCookie);
	});
	request.end();
}

/**
 *	喜闻乐见的签到方法
 *
 *	@method sign
 *	@param	String cookie 上面操作获取cookie的集合
 */
function sign(cookie){
	logger.log('start sign ........');
	var http = require('http');
	var querystring = require('querystring');
	var postData = querystring.stringify({
		action:'qiandao',
		qdxq:1,
		qdmessage:'good lucky'
	});
	
	var options = {
		hostname: 'bbs.zairenku.com',
		path:'/hack.php?H_name=xqqiandao',
		port: 80,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Host': 'bbs.zairenku.com',
			'Content-Length': Buffer.byteLength(postData),
			'Cookie': cookie,
			'Referer': 'http://bbs.zairenku.com/xqqiandao',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36'
		}
	};
	var request = http.request(options, function(res){
		var cookie = getCookie(res.headers['set-cookie']);
		if(cookie.indexOf('_ac_40cdb461') > 1) {
			logger.log('sign zrk successed');
			signSuccessHandler();
			return;
		}
		logger.log('sign zrk failed');
		signFailedHandler('sign zrk failed');
	}).on('error', function(e){
		logger.log('sign zrk failed catch error');
		signFailedHandler('sign zrk failed catch error');
	});
	request.write(postData);
	request.end();
}

exports.initialize = function(signSuccessCallback, signFailedCallback){
	signSuccessHandler = signSuccessCallback;
	signFailedHandler = signFailedCallback;
};

exports.doSign = function(){
	login();
};

/**
  * @param Array source is http header set-cookie 
  */
function getCookie(source){	
	if (typeof source == 'undefined') return '';
    	var length = source.length;
    	var cookie = '';
    	var src = '';
    	for (var i = 0; i < length; i++){
			src = source[i].split(';')[0];
			cookie += src + ';';
		}
	return cookie;
}
