var vows = require('vows'),
	assert = require('assert'),
	util = require('util'),
	facebook = require('passport-odnoklassniki');


vows.describe('passport-odnoklassniki').addBatch({
	module: {
		'should report a version': function (x) {
			'use strict';
			assert.isString(odnoklassniki.version);
		}
	}
}).export(module);
