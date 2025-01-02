import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import cors from 'cors'
import passport from 'passport'

import mongoose from 'mongoose'
console.log(process.env.DATABASE_URL)
const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/ufood'
mongoose.connect(mongoUri)

import { getTokenSecret, isAuthenticated } from './middleware/authentication.js'
import { getToken, logout } from './services/login.js'
import { welcome } from './services/signup.js'
import { allUsers, findUserById, follow, unfollow, findIfFollowed } from './services/users.js'
import { getHome, getStatus } from './services/status.js'
import { allRestaurants, findRestaurantById, allRestaurantVisits } from './services/restaurants.js'
import { createFavoriteList, createFavoriteListUnsecure, addRestaurantToFavoriteList, removeRestaurantFromFavoriteList, updateFavoriteList, removeFavoriteList, removeFavoriteListUnsecure, getFavoriteLists, findFavoriteListById, findFavoriteListsByUser  } from './services/favorites.js'
import { allUserVisits, findVisitByRestaurantId, findVisitById, createVisit } from './services/visits.js'

import { initializePassport } from './middleware/passport.js'

const app = express()
const corsOptions = {
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'UPDATE'],
  credentials: true
}

const tokenSecret = getTokenSecret()
app.set('jwtTokenSecret', tokenSecret)

initializePassport(passport, app)

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
app.use(cors(corsOptions))

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

app.get('/', getHome)
app.get('/status', getStatus)
app.post('/login', passport.authenticate('local-login'), getToken)
app.post('/logout', logout)

app.post('/signup', passport.authenticate('local-signup'), getToken)
app.get('/welcome', welcome)

app.get('/token', getToken)
app.get('/tokenInfo', isAuthenticated, getToken)

// Secure API
app.get('/users', isAuthenticated, allUsers)
app.get('/users/:id', isAuthenticated, findUserById)
app.get('/users/:id/favorites', isAuthenticated, findFavoriteListsByUser)

app.get('/users/:userId/restaurants/visits', isAuthenticated, allUserVisits)
app.get(
  '/users/:userId/restaurants/:restaurantId/visits',
  isAuthenticated,
  findVisitByRestaurantId
)
app.get('/users/:userId/restaurants/visits/:id', isAuthenticated, findVisitById)
app.post('/users/:userId/restaurants/visits', isAuthenticated, createVisit)

app.post('/follow', isAuthenticated, follow)
app.delete('/follow/:id', isAuthenticated, unfollow)
app.get('/follow/:id', isAuthenticated, findIfFollowed)

app.get('/restaurants', isAuthenticated, allRestaurants)
app.get('/restaurants/:id', isAuthenticated, findRestaurantById)
app.get('/restaurants/:id/visits', isAuthenticated, allRestaurantVisits)

app.get('/favorites', isAuthenticated, getFavoriteLists)
app.get('/favorites/:id', isAuthenticated, findFavoriteListById)
app.post('/favorites', isAuthenticated, createFavoriteList)
app.put('/favorites/:id', isAuthenticated, updateFavoriteList)
app.delete('/favorites/:id', isAuthenticated, removeFavoriteList)
app.post(
  '/favorites/:id/restaurants',
  isAuthenticated,
  addRestaurantToFavoriteList
)
app.delete(
  '/favorites/:id/restaurants/:restaurantId',
  isAuthenticated,
  removeRestaurantFromFavoriteList
)

// Unsecure API
app.get('/unsecure/users', allUsers)
app.get('/unsecure/users/:id', findUserById)
app.get('/unsecure/users/:id/favorites', findFavoriteListsByUser)

app.get('/unsecure/users/:userId/restaurants/visits', allUserVisits)
app.get('/unsecure/users/:userId/restaurants/:restaurantId/visits', findVisitByRestaurantId)
app.get('/unsecure/users/:userId/restaurants/visits/:id', findVisitById)
app.post('/unsecure/users/:userId/restaurants/visits', createVisit)

app.get('/unsecure/restaurants', allRestaurants)
app.get('/unsecure/restaurants/:id', findRestaurantById)
app.get('/unsecure/restaurants/:id/visits', allRestaurantVisits)

app.get('/unsecure/favorites', getFavoriteLists)
app.get('/unsecure/favorites/:id', findFavoriteListById)
app.post('/unsecure/favorites', createFavoriteListUnsecure)
app.put('/unsecure/favorites/:id', updateFavoriteList)
app.delete('/unsecure/favorites/:id', removeFavoriteListUnsecure)
app.post('/unsecure/favorites/:id/restaurants', addRestaurantToFavoriteList)
app.delete(
  '/unsecure/favorites/:id/restaurants/:restaurantId',
  removeRestaurantFromFavoriteList
)

const port = process.env.PORT || 3000
app.listen(port)

console.log(`Listening on port ${port}`)