const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')

const cors = require('cors')
const passport = require('passport')

const mongoose = require('mongoose')
const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/ufood'
mongoose.connect(mongoUri, {
  useNewUrlParser: true
})

const authentication = require('./middleware/authentication')
const login = require('./services/login')
const signup = require('./services/signup')
const user = require('./services/users')
const status = require('./services/status')
const restaurants = require('./services/restaurants')
const favorites = require('./services/favorites')
const visits = require('./services/visits')

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

app.use(function (error, req, res, next) {
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
app.get('/users/:id/favorites', authentication.isAuthenticated, favorites.findFavoriteListsByUser)

app.get('/users/:userId/restaurants/visits', authentication.isAuthenticated, visits.allUserVisits)
app.get(
  '/users/:userId/restaurants/:restaurantId/visits',
  authentication.isAuthenticated,
  visits.findByRestaurantId
)
app.get('/users/:userId/restaurants/visits/:id', authentication.isAuthenticated, visits.findById)
app.post('/users/:userId/restaurants/visits', authentication.isAuthenticated, visits.createVisit)

app.post('/follow', authentication.isAuthenticated, user.follow)
app.delete('/follow/:id', authentication.isAuthenticated, user.unfollow)
app.get('/follow/:id', authentication.isAuthenticated, user.findIfFollowed)

app.get('/restaurants', authentication.isAuthenticated, restaurants.allRestaurants)
app.get('/restaurants/:id', authentication.isAuthenticated, restaurants.findById)
app.get('/restaurants/:id/visits', authentication.isAuthenticated, restaurants.allRestaurantVisits)

app.get('/favorites', authentication.isAuthenticated, favorites.getFavoriteLists)
app.get('/favorites/:id', authentication.isAuthenticated, favorites.findFavoriteListById)
app.post('/favorites', authentication.isAuthenticated, favorites.createFavoriteList)
app.put('/favorites/:id', authentication.isAuthenticated, favorites.updateFavoriteList)
app.delete('/favorites/:id', authentication.isAuthenticated, favorites.removeFavoriteList)
app.post(
  '/favorites/:id/restaurants',
  authentication.isAuthenticated,
  favorites.addRestaurantToFavoriteList
)
app.delete(
  '/favorites/:id/restaurants/:restaurantId',
  authentication.isAuthenticated,
  favorites.removeRestaurantFromFavoriteList
)

// Unsecure API
app.get('/unsecure/users', user.allUsers)
app.get('/unsecure/users/:id', user.findById)
app.get('/unsecure/users/:id/favorites', favorites.findFavoriteListsByUser)

app.get('/unsecure/users/:userId/restaurants/visits', visits.allUserVisits)
app.get('/unsecure/users/:userId/restaurants/:restaurantId/visits', visits.findByRestaurantId)
app.get('/unsecure/users/:userId/restaurants/visits/:id', visits.findById)
app.post('/unsecure/users/:userId/restaurants/visits', visits.createVisit)

app.get('/unsecure/restaurants', restaurants.allRestaurants)
app.get('/unsecure/restaurants/:id', restaurants.findById)
app.get('/unsecure/restaurants/:id/visits', restaurants.allRestaurantVisits)

app.get('/unsecure/favorites', favorites.getFavoriteLists)
app.get('/unsecure/favorites/:id', favorites.findFavoriteListById)
app.post('/unsecure/favorites', favorites.createFavoriteListUnsecure)
app.put('/unsecure/favorites/:id', favorites.updateFavoriteList)
app.delete('/unsecure/favorites/:id', favorites.removeFavoriteListUnsecure)
app.post('/unsecure/favorites/:id/restaurants', favorites.addRestaurantToFavoriteList)
app.delete(
  '/unsecure/favorites/:id/restaurants/:restaurantId',
  favorites.removeRestaurantFromFavoriteList
)

const port = process.env.PORT || 3000
app.listen(port)
