const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user').model
const moment = require('moment')
const jwt = require('jwt-simple')

module.exports = function(passport, app) {
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user)
    })
  })

  passport.use(
    'local-login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      function(req, email, password, done) {
        if (email) {
          email = email.toLowerCase()
        }

        process.nextTick(async function() {
          try {
            const user = await User.findOne({ email: email })
            if (!user || !user.validPassword(password)) {
              return done(null, false)
            } else {
              const expires = moment()
                .add(1, 'days')
                .valueOf()
              user.token = jwt.encode(
                {
                  iss: user.id,
                  exp: expires
                },
                app.get('jwtTokenSecret')
              )

              user.save(function(err) {
                if (err) {
                  return done(err)
                }
                return done(null, user)
              })
            }
          } catch (err) {
            return done(err)
          }
        })
      }
    )
  )

  passport.use(
    'local-signup',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      function(req, email, password, done) {
        if (email) {
          email = email.toLowerCase()
        }

        process.nextTick(async function() {
          if (!req.user) {
            try {
              const user = await User.findOne({ email: email })
              if (user) {
                return done(null, false)
              } else {
                const newUser = new User()

                newUser.name = req.body.name
                newUser.email = email
                newUser.password = newUser.generateHash(password)

                newUser.save(function(err) {
                  if (err) {
                    return done(err)
                  }

                  return done(null, newUser)
                })
              }
            } catch (err) {
              return done(err)
            }
          } else if (!req.user.email) {
            const user = req.user
            user.email = email
            user.password = user.generateHash(password)
            try {
              await user.save()
              return done(null, user)
            } catch (err) {
              return done(err)
            }
          } else {
            return done(null, req.user)
          }
        })
      }
    )
  )
}
