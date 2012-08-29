/**
 * Module dependencies.
 */
var util = require('util'),
	OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
	InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Odnoklassniki authentication strategy authenticates requests by delegating to
 * Odnoklassniki using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.	If an exception occured, `err` should be set.
 *
 * Options:
 * - `clientID` your Odnoklassniki application's App ID
 * - `clientSecret` your Odnoklassniki application's App Secret
 * - `callbackURL` URL to which Odnoklassniki will redirect the user after granting authorization
 *
 * Examples:
 *
 *	passport.use(new OdnoklassnikiStrategy({
 *			clientID: '123-456-789',
 *			clientSecret: 'shhh-its-a-secret'
 *			callbackURL: 'https://www.example.net/auth/odnoklassniki/callback'
 *		},
 *		function(accessToken, refreshToken, profile, done) {
 *			User.findOrCreate(..., function (err, user) {
 *				done(err, user);
 *			});
 *		}
 *	));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
	'use strict';
	options = options || {};
	options.authorizationURL = options.authorizationURL || 'http://www.odnoklassniki.ru/oauth/authorize';
	options.tokenURL = options.tokenURL || 'http://api.odnoklassniki.ru/oauth/token.do';
	options.scopeSeparator = options.scopeSeparator || ',';

	OAuth2Strategy.call(this, options, verify);
	this.name = 'odnoklassniki';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Return extra Odnoklassniki-specific parameters to be included in the authorization
 * request.
 *
 * Options:
 *	- `display`	Display mode to render dialog, { `page`, `popup`, `touch` }.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function (options) {
	'use strict';
	var params = {},
		display = options.display;

	if (display) {
		params.display = display;
	}

	return params;
};

/**
 * Retrieve user profile from Odnoklassniki.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 * - `provider` always set to `odnoklassniki`
 * - `id` the user's Odnoklassniki ID
 * - `username` the user's Odnoklassniki username
 * - `displayName` the user's full name
 * - `name.familyName` the user's last name
 * - `name.givenName` the user's first name
 * - `name.middleName` the user's middle name
 * - `gender` the user's gender: `male` or `female`
 * - `profileUrl` the URL of the profile for the user on Odnoklassniki
 * - `emails` the proxied or contact email address granted by the user
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
	'use strict';
	console.log(this.oauth2._clientId);
	this._oauth2.getProtectedResource('http://api.odnoklassniki.ru/fb.do?method=users.getCurrentUser&application_key=' + '1' + '&sig=' + '1', accessToken, function (err, body, res) {
		if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

		try {
			var json = JSON.parse(body),
				profile = { provider: 'odnoklassniki' };

			profile.id = json.id;
			profile.username = json.username;
			profile.displayName = json.name;
			profile.name = {
				familyName: json.last_name,
				givenName: json.first_name,
				middleName: json.middle_name
			};
			profile.gender = json.gender;
			profile.profileUrl = json.link;
			profile.emails = [{ value: json.email }];
			
			profile._raw = body;
			profile._json = json;
			
			done(null, profile);
		} catch(e) {
			done(e);
		}
	});
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
