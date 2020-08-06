const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')

const cors = require('cors')
const passport = require('passport')

const mongoose = require('mongoose')
const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost/ufood'
mongoose.connect(
  mongoUri,
  {
    autoReconnect: true,
    useNewUrlParser: true
  }
)

const authentication = require('./middleware/authentication')
const login = require('./routes/login')
const signup = require('./routes/signup')
const user = require('./routes/user')
const status = require('./routes/status')

const app = express()
const corsOptions = {
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'UPDATE'],
  credentials: true
}

const tokenSecret = 'UFOOD_TOKEN_SECRET' || process.env.TOKEN_SECRET

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.set('jwtTokenSecret', tokenSecret)

require('./middleware/passport')(passport, app)

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  session({
    secret: 'ufood_session_secret',
    resave: true,
    saveUninitialized: true
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(cors(corsOptions))
app.use(express.static(__dirname + '/public'))

app.use(function(error, req, res, next) {
  if (error instanceof SyntaxError) {
    res.status(412).send({
      errorCode: 'PARSE_ERROR',
      message:
        'Arguments could not be parsed, make sure request is valid. Refer to the documentation : https://github.com/GLO3102/UFood/wiki/2-API'
    })
  } else {
    res.status(500).send('Something broke!', error)
  }
})

app.get('/', status.getHome)
app.get('/status', status.getStatus)
app.get('/login', login.showLoginPage)
app.post('/login', passport.authenticate('local-login'), login.getToken)
app.post('/logout', login.logout)

app.get('/signup', signup.showSignupPage)
app.post('/signup', passport.authenticate('local-signup'), login.getToken)
app.get('/welcome', signup.welcome)

app.get('/token', login.getToken)
app.get('/tokenInfo', authentication.isAuthenticated, login.getToken)

// Secure API
app.get('/users', authentication.isAuthenticated, user.allUsers)
app.get('/users/:id', authentication.isAuthenticated, user.findById)

app.post('/follow', authentication.isAuthenticated, user.follow)
app.delete('/follow/:id', authentication.isAuthenticated, user.unfollow)

// Unsecure API
app.get('/unsecure/users', user.allUsers)
app.get('/unsecure/users/:id', user.findById)

app.post('/unsecure/follow', user.follow)
app.delete('/unsecure/follow/:id', user.unfollow)

const port = process.env.PORT || 3000
app.listen(port)
