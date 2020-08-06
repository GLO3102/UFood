const passport = require('passport')

const authentication = require('../middleware/authentication')

exports.showLoginPage = function(req, res) {
  res.render('login.ejs', { message: req.flash('loginMessage') })
  req.session.destroy()
}

exports.passportLogin = passport.authenticate('local-login', {
  successRedirect: '/token',
  failureRedirect: '/login',
  failureFlash: true
})

exports.getToken = function(req, res) {
  if (req.user) {
    res.send(req.user)
  } else {
    const token = authentication.retrieveToken(req)
    if (token) {
      res.status(401).send({
        errorCode: 'ACCESS_DENIED',
        message: 'User associated with token was not found'
      })
    } else {
      res.status(401).send({
        errorCode: 'ACCESS_DENIED',
        message: 'Access token is missing'
      })
    }
  }
  req.session.destroy()
}

exports.logout = function(req, res) {
  req.session.destroy()
  req.logout()
  res.status(200).send()
}
