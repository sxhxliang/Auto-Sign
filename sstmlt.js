/**
 *	自动签到SS同盟
 *	
 *	@module sstmltAutoSign
 */

	/**
	 *	签到成功后调用
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
 *	login sstmlt.net and catch server cookie
 *	
 *	@method login
 */
function login(){
	logger.log('start login sstmlt........');
	var https = require('https');
	var querystring = require('querystring');
	var postData = querystring.stringify({
		fastloginfield: 'username',
		username: config.sstmltInfo.username,
		password: config.sstmltInfo.password,
		quickforward: 'yes',
		handlekey: 'ls'
	});
	var options = {
		hostname: 'sstmlt.net',
		path: '/member.php?mod=logging&action=login&loginsubmit=yes&infloat=yes&lssubmit=yes&inajax=1',
		port: 443,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Host': 'sstmlt.net',
			'Connection': 'keep-alive',
			'Content-Length': Buffer.byteLength(postData),
			'Cookie': '',
			'Referer': 'https://sstmlt.net/',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36'
		}
	};
	var request = https.request(options, function(res){
		var cookie = getCookie(res.headers['set-cookie']);
		if (cookie.indexOf('WNBe_2132_auth') > 0) {	
			logger.log('login sstmlt successed ........');
			getSignFormhash(cookie);
		}else{
			signFailedHandler('login sstmlt failed...');
		}
	});
	request.write(postData);
	request.end();
}

/**
 *	beacause sstmlt sign action need formhash param
 *
 *	@method	getSignFormhash
 *	@param	String loginCookie is user infomation by server write to cookie
 */
function getSignFormhash(loginCookie) {
	logger.log('start getLoginCookie ........');
	var https = require('https');
	var options = {
		hostname:'sstmlt.net',
		path:'/plugin.php?id=dsu_paulsign:sign&07b68911&infloat=yes&handlekey=dsu_paulsign&inajax=1&ajaxtarget=fwin_content_dsu_paulsign',
		port: 443,
		method: 'GET',
		headers:{
			'Cookie': loginCookie,
			'Host':'sstmlt.net',
			'Referer':'https://sstmlt.net/',
			'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
			'X-Requested-With':'XMLHttpRequest'
		}
	};
	var request = https.request(options, function(res){
		var cookie = getCookie(res.headers['set-cookie']);
		loginCookie += cookie;

		var chunks = [];
		var size = 0;
		res.on('data', function(chunk){
			chunks.push(chunk);
			size += chunk.length;
		});
		res.on('end', function(){
			var buf = Buffer.concat(chunks, size);
			var result = buf.toString('utf-8');
			try{
				var formhash = result.match(/<input type=\"hidden\" name=\"formhash\" value=\"(.*)\">/)[1];
			}catch(err){
				logger.log('get formhash failed');
				signFailedHandler('get formhash failed');
				return;
			}
			logger.log('get formhash successed value is %s', formhash);
			sign(loginCookie, formhash);
		});
	});
	request.end();
}

/**
 *	auto sign
 *
 *	@method sign
 *	@param	String cookie is before all cookie
 *	@param	String fhash is form hash
 */
function sign(cookie, fhash){
	logger.log('start sign...........');
	var http = require('https');
	var querystring = require('querystring');
	var postData = querystring.stringify({
		formhash:fhash,	
		qdxq:'kx'
	});
	var options = {
		hostname: 'www.sstmlt.net',
		path:'/plugin.php?id=dsu_paulsign:sign&operation=qiandao&infloat=1&sign_as=1&inajax=1',
		port: 443,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Host': 'sstmlt.net',
			//'Connection': 'keep-alive',
			'Content-Length': Buffer.byteLength(postData),
			'Cookie': cookie,
			'Origin':'https://sstmlt.net',
			'Referer': 'https://sstmlt.net/',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36'
		}
	};
	var request = http.request(options, function(res){
		var cookie = getCookie(res.headers['set-cookie']);
		if(cookie.indexOf('WNBe_2132_creditnotice') > 1 && cookie.indexOf('WNBe_2132_creditbase') > 1) {
			logger.log('sign sstmlt successed');
			signSuccessHandler();
			return;
		}
		logger.log('sign sstmlt failed');
		signFailedHandler('sign sstmlt failed');
	});
	request.write(postData);
	request.end();
}

exports.initialize = function(signSuccessedCallback, signFailedCallback){
	signSuccessHandler = signSuccessedCallback;
	signFailedHandler = signFailedCallback;
};

// ========== do it ==========
exports.doSign = function(){
	login();
};
// ========== do it ==========

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
