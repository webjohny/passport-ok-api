/**
 * Module dependencies.
 */
var util = require('util'),
	OAuth2Strategy = require('passport-oauth2'),
	InternalOAuthError = require('passport-oauth2').InternalOAuthError;


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
	if (!options.clientPublic) {
		throw new Error('Odnoklassniki\'s implementation of OAuth2.0 requires a clientPublic option');
	}

	options = options || {};
	options.authorizationURL = options.authorizationURL || 'https://www.odnoklassniki.ru/oauth/authorize';
	options.tokenURL = options.tokenURL || 'https://api.odnoklassniki.ru/oauth/token.do';
	options.scopeSeparator = options.scopeSeparator || ';';

	OAuth2Strategy.call(this, options, verify);
	this.name = 'odnoklassniki';
	this._clientPublic = options.clientPublic;
	this._profileURL = options.profileURL || 'https://api.odnoklassniki.ru/fb.do';
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
 *	- `layout`	Display mode to render dialog, { `w`, `m`, `a` }.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function (options) {
	'use strict';
	var params = {};

	if (options.layout) {
		params.layout = options.layout;
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
	var crypto = require('crypto'),
		sig = crypto.createHash('md5').update([
			'application_key=' + this._clientPublic,
			'method=users.getCurrentUser',
			crypto.createHash('md5').update(accessToken + this._oauth2._clientSecret, 'utf8').digest('hex')
		].join(''), 'utf8').digest('hex');

	this._oauth2.getProtectedResource(this._profileURL + '?method=users.getCurrentUser&application_key=' + this._clientPublic + '&sig=' + sig, accessToken, function (err, body, res) {
		if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

		try {
			var json = JSON.parse(body),
				profile = { provider: 'odnoklassniki' };

			profile.id = json.uid;
			profile.username = undefined;
			profile.displayName = json.name;
			profile.name = {
				familyName: json.last_name,
				givenName: json.first_name,
				middleName: undefined
			};
			profile.gender = json.gender;
			profile.profileUrl = 'https://ok.ru/profile/' + json.uid;
			profile.emails = [];

			profile.photos = [{
				value: json.pic_1,
				type: 'thumbnail'
			}, {
				value: json.pic_2
			}];
			
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
