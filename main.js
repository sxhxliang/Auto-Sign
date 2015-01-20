var autoSignZrk = require('./zrk'),
	autoSignSstmlt = require('./sstmlt');

var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
rule.hour = [15, 16, 17];
rule.minute = [10, 20, 30];

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var config = require('./config');
var logger = require('./logger');

function sendMail(subject, content){
	transporter.sendMail({
		from: config.mail.from,
		to: config.mail.to,
		subject: subject,
		text: content
	});
}

autoSignZrk.initialize(
	function(){
		sendMail('Sign ZRK Successed', 'OK');
	}, 
	function(content){
		sendMail(content, 'False');
	}
);
autoSignSstmlt.initialize(
	function(){
		sendMail('Sign SSTM Successed', 'OK');
	},
	function(content){
		sendMail(content, 'False');
	}
);

var job = schedule.scheduleJob(rule, function(){
	logger.log('schedule.scheduleJob');
	//
	//startSignZrk();
	autoSignZrk.doSign();
	//
	//autoSignSstmlt.doSign();
	startSignSstmlt();
});

var retry = 0;
var RETRY_MAX = 3;

function startSignZrk(){
	try{
		autoSignZrk.doSign();
	}catch(err){
		if (retry++ <= RETRY_MAX){
			logger.log('retry sign zrk %d', retry);
			startSignZrk();		
		}
	}	
}

function startSignSstmlt(){
	try{
		autoSignSstmlt.doSign();
	}catch(err){
	}
}
//startSignSstmlt();
//startSignZrk();
