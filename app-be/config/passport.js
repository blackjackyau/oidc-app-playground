const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { Issuer, Strategy: OidcStrategy } = require('openid-client');
const utils = require('../lib/utils');


require('dotenv').config();

const fs = require('fs');
const path = require('path');
const User = require('mongoose').model('User');

const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

// At a minimum, you must pass the `jwtFromRequest` and `secretOrKey` properties
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256']
};

module.exports = (passport, app) => {

  passport.use(new JwtStrategy(options, function (jwt_payload, done) {

    console.log(jwt_payload);

    return done(null, jwt_payload);
    // We will assign the `sub` property on the JWT to the database ID of user
    // User.findOne({ _id: jwt_payload.sub }, function (err, user) {

    //   // This flow look familiar?  It is the same as when we implemented
    //   // the `passport-local` strategy
    //   if (err) {
    //     return done(err, false);
    //   }
    //   if (user) {
    //     return done(null, jwt_payload);
    //   } else {
    //     return done(null, jwt_payload);
    //   }

    // });

  }));

  // https://codeburst.io/how-to-implement-openid-authentication-with-openid-client-and-passport-in-node-js-43d020121e87
  Issuer.discover('https://dev-875318.okta.com/oauth2/default/.well-known/oauth-authorization-server')
    .then(criiptoIssuer => {
      var client = new criiptoIssuer.Client({
        client_id: process.env.OIDC_CLIENT_ID,
        client_secret: process.env.OIDC_CLIENT_SECRET,
        redirect_uris: ['http://localhost:3000/api/auth/oidc-be/callback'],
        post_logout_redirect_uris: 'http://localhost:3000/',
        token_endpoint_auth_method: 'client_secret_post',
        response_types: ['code'],
      });
      client.issuer.userinfo_endpoint = 'https://dev-875318.okta.com/oauth2/default/v1/userinfo';

      passport.use(
        'oidc',
        new OidcStrategy({ client, params: { scope: 'openid profile offline_access' } }, (tokenSet, userinfo, done) => {
          registerUserIfNotFound(userinfo, 'oidc', done);
        })
      );

      app.post('/api/auth/oidc-fe/callback', (req, res) => {

        client.grant({grant_type: 'authorization_code', ...req["body"] }).then(tokenSet => {
          client.userinfo(tokenSet, { method: "GET", via: "header"} ).then(userinfo => {
            console.log("userinfo", userinfo);
            registerUserIfNotFound(userinfo, 'oidc', (err, user) => {
              if (!err) {
                const tokenObject = utils.issueJWT(user);
                res.cookie('access-token', tokenObject.token);
                res.cookie('expires-in', tokenObject.expires);
                res.status(200).send(tokenObject);
              } else {
                res.status(500).send({err: "error creating user"});
              }
            });
          });

        });
      });

    });

  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
  });

  registerUserIfNotFound = (userinfo, provider, done) => {
    User.findOne({ username: userinfo.preferred_username, provider }, function (err, user) {
      if (err) {
        done(err);
      }

      if (user) {
        done(null, user);
      } else {
        user = new User({
          provider,
          username: userinfo.preferred_username,
          external_id: userinfo.sub,
          display_name: userinfo.name,
        });
        user.save(function (err) {
          if (err) {
            done(err);
          } else {
            console.log("saving user ...");
            done(null, user);
          }
        });
      }
    });
  }
}
