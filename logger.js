var fs = require('fs');
var logger = require('tracer').console({
	transport: function(data){
		console.log(data.output);
		fs.open('./sign.log', 'a', 0666, function(err,id){
			if (!err){
				fs.write(id, data.output + '\n', null, 'utf8', function(){
					fs.close(id, function(){});
				});
			}
		});
	}
});

//exports.logger = logger;
module.exports = logger;
