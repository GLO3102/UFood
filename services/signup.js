const passport = require('passport')

exports.passportSignup = passport.authenticate('local-signup', {
  successRedirect: '/token',
  failureRedirect: '/login',
  failureFlash: true
})

exports.welcome = (req, res) => {
  if (req.user) {
    res.status(200).send({
      message: 'USER_SIGNED_UP_SUCCESSFULLY',
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        friends: req.user.friends
      }
    })
  }
}
