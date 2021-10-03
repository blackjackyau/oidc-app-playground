const router = require('express').Router();
const passport = require('passport');
const utils = require('../lib/utils');

router.get('/oidc', passport.authenticate('oidc'));

router.get('/oidc-be/callback', 
  passport.authenticate('oidc', { failureRedirect: '/login' }),
  function(req, res) {
    const tokenObject = utils.issueJWT(req.user);
    res.cookie('app.access-token', tokenObject.token);
    res.cookie('app.expires-in', tokenObject.expires);
    res.redirect('/home');
});

module.exports = router;
