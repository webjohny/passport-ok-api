# Passport-Odnoklassniki

[Passport](http://passportjs.org/) strategy for authenticating with [Odnoklassniki.ru](http://odnoklassniki.ru/)
using the OAuth 2.0 API.

This module lets you authenticate using Odnoklassniki in your Node.js applications.
By plugging into Passport, Odnoklassniki authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Installation

    $ npm install passport-ok-api

## Usage

#### Configure Strategy

The Odnoklassniki authentication strategy authenticates users using a Odnoklassniki
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a app ID, app secret, and callback URL.

    passport.use(new OdnoklassnikiStrategy({
        clientID: ODNOKLASSNIKI_APP_ID,
        clientPublic: ODNOKLASSNIKI_APP_PUBLIC_KEY,
        clientSecret: ODNOKLASSNIKI_APP_SECRET_KEY,
        callbackURL: "http://localhost:3000/auth/odnoklassniki/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ odnoklassnikiId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'odnoklassniki'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/odnoklassniki',
      passport.authenticate('odnoklassniki'),
      function(req, res){
        // The request will be redirected to Odnoklassniki for authentication, so
        // this function will not be called.
      });

    app.get('/auth/odnoklassniki/callback',
      passport.authenticate('odnoklassniki', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

#### Extended Permissions

If you need extended permissions from the user, the permissions can be requested
via the `scope` option to `passport.authenticate()`.

For example, this authorization requests permission to the user's statuses and
checkins:

    app.get('/auth/odnoklassniki',
      passport.authenticate('odnoklassniki', { scope: ['user_status', 'user_checkins'] }),
      function(req, res){
        // The request will be redirected to Odnoklassniki for authentication, with
        // extended permissions.
      });

#### Display Mode

The display mode with which to render the authorization dialog can be set by
specifying the `layout` option. Available values are 'w' (default), 'm', 'a'. Refer to Odnoklassniki's [OAuth Dialog](https://developers.odnoklassniki.com/docs/reference/dialogs/oauth/)
documentation for more information.

    app.get('/auth/odnoklassniki',
      passport.authenticate('odnoklassniki', { layout: 'm' }),
      function(req, res){
        // ...
      });

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)
  - [Alexey Kozlov](http://github.com/ozon1234)

## License

(The MIT License)

Copyright (c) 2011 Jared Hanson

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
