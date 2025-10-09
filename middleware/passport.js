import { Strategy as LocalStrategy } from 'passport-local'
import { User } from '../repositories/user.js'
import moment from 'moment'
import jwt from 'jwt-simple'

export const initializePassport = (passport, app) => {
  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id).exec()
      .then(user => done(null, user))
      .catch(err => done(err));
  });


  passport.use(
    'local-login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      function (req, email, password, done) {
        if (email) {
          email = email.toLowerCase()
        }

        process.nextTick(async function () {
          try {
            const user = await User.findOne({ email: email })
            if (!user || !user.validPassword(password)) {
              return done(null, false)
            } else {
              const expires = moment().add(1, 'days').unix()
              user.token = jwt.encode(
                {
                  iss: user.id,
                  exp: expires
                },
                app.get('jwtTokenSecret')
              )

              try {
                await user.save()
                return done(null, user)
              } catch (err) {
                return done(err)
              }
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
      function (req, email, password, done) {
        if (email) {
          email = email.toLowerCase()
        }

        process.nextTick(async function () {
          if (!req.user) {
            try {
              const user = await User.findOne({ email: email })
              if (user) {
                return done(null, false)
              } else {
                if (!req.body.name) {
                  return done('Name is required')
                }

                const newUser = new User()

                newUser.name = req.body.name
                newUser.email = email
                newUser.password = newUser.generateHash(password)

                try {
                  await newUser.save()
                  return done(null, newUser)
                } catch (err) {
                  return done(err)
                }
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
