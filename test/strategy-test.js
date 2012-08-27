var vows = require('vows'),
	assert = require('assert'),
	util = require('util'),
	url = require('url'),
	OdnoklassnikiStrategy = require('passport-odnoklassniki/strategy');


vows.describe('OdnoklassnikiStrategy').addBatch({
	strategy: {
		topic: function() {
			'use strict';
			return new OdnoklassnikiStrategy({
				clientID: 'ABC123',
				clientSecret: 'secret'
			},
			function() {});
		},
		'should be named odnoklassniki': function (strategy) {
			'use strict';
			assert.equal(strategy.name, 'odnoklassniki');
		}
	},
	'strategy when redirecting for authorization': {
		topic: function () {
			'use strict';
			var strategy = new OdnoklassnikiStrategy({
				clientID: 'ABC123',
				clientSecret: 'secret'
			});
			return strategy;
		},

		'and display not set': {
			topic: function (strategy) {
				'use strict';
				var mockRequest = {}, url, self = this;

				// Stub strategy.redirect()
				strategy.redirect = function (location) {
					self.callback(null, location);
				};
				strategy.authenticate(mockRequest);
			},

			'does not set authorization param': function(err, location) {
				'use strict';
				var params = url.parse(location, true).query;
				assert.isUndefined(params.display);
			}
		},

		'and display set to mobile': {
			topic: function (strategy) {
				'use strict';
				var mockRequest = {}, url, self = this;

				// Stub strategy.redirect()
				strategy.redirect = function (location) {
					self.callback(null, location);
				};
				strategy.authenticate(mockRequest, { display: 'mobile' });
			},

			'sets authorization param to mobile': function(err, location) {
				'use strict';
				var params = url.parse(location, true).query;
				assert.equal(params.display, 'mobile');
			}
		}
	},

	'strategy when loading user profile': {
		topic: function() {
			'use strict';
			var strategy = new OdnoklassnikiStrategy({
				clientID: 'ABC123',
				clientSecret: 'secret'
			},
			function() {});

			// mock
			strategy._oauth2.getProtectedResource = function(url, accessToken, callback) {
				var body = '{"id":"500308595","name":"Jared Hanson","first_name":"Jared","last_name":"Hanson","link":"http:\\/\\/www.facebook.com\\/jaredhanson","username":"jaredhanson","gender":"male","email":"jaredhanson\\u0040example.com"}';

				callback(null, body, undefined);
			};

			return strategy;
		},

		'when told to load user profile': {
			topic: function(strategy) {
				'use strict';
				var self = this;

				process.nextTick(function () {
					strategy.userProfile('access-token', function (err, profile) { self.callback(err, profile); });
				});
			},

			'should not error' : function(err, req) {
				'use strict';
				assert.isNull(err);
			},
			'should load profile' : function(err, profile) {
				'use strict';
				assert.equal(profile.provider, 'facebook');
				assert.equal(profile.id, '500308595');
				assert.equal(profile.username, 'jaredhanson');
				assert.equal(profile.displayName, 'Jared Hanson');
				assert.equal(profile.name.familyName, 'Hanson');
				assert.equal(profile.name.givenName, 'Jared');
				assert.equal(profile.gender, 'male');
				assert.equal(profile.profileUrl, 'http://www.facebook.com/jaredhanson');
				assert.lengthOf(profile.emails, 1);
				assert.equal(profile.emails[0].value, 'jaredhanson@example.com');
			},
			'should set raw property' : function(err, profile) {
				'use strict';
				assert.isString(profile._raw);
			},
			'should set json property' : function(err, profile) {
				'use strict';
				assert.isObject(profile._json);
			}
		}
	},

	'strategy when loading user profile and encountering an error': {
		topic: function() {
			'use strict';
			var strategy = new OdnoklassnikiStrategy({
				clientID: 'ABC123',
				clientSecret: 'secret'
			},
			function() {});

			// mock
			strategy._oauth2.getProtectedResource = function(url, accessToken, callback) {
				callback(new Error('something-went-wrong'));
			};

			return strategy;
		},

		'when told to load user profile': {
			topic: function(strategy) {
				'use strict';
				var self = this;
				process.nextTick(function () {
					strategy.userProfile('access-token', function (err, profile) { self.callback(err, profile); });
				});
			},

			'should error' : function(err, req) {
				'use strict';
				assert.isNotNull(err);
			},
			'should wrap error in InternalOAuthError' : function(err, req) {
				'use strict';
				assert.equal(err.constructor.name, 'InternalOAuthError');
			},
			'should not load profile' : function(err, profile) {
				'use strict';
				assert.isUndefined(profile);
			}
		}
	}
}).export(module);
