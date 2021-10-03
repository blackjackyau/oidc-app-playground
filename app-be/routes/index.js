const passport = require('passport');

const router = require('express').Router();

router.use('/auth', require('./auth'));

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  res.status(200).json({ success: true, msg: "You are successfully authenticated to this route!" });
});

router.get('/hello', (req, res, next) => {
  res.status(200).json({ success: true, msg: "hElLo woRlD" });
});

module.exports = router;