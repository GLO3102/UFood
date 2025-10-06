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
import {
  createFavoriteList,
  createFavoriteListUnsecure,
  addRestaurantToFavoriteList,
  removeRestaurantFromFavoriteList,
  updateFavoriteList,
  removeFavoriteList,
  removeFavoriteListUnsecure,
  getFavoriteLists,
  findFavoriteListById,
  findFavoriteListsByUser
} from './services/favorites.js'
import {
  allUserVisits,
  findVisitByRestaurantId,
  findVisitById,
  createVisit
} from './services/visits.js'

import { initializePassport } from './middleware/passport.js'
import { specs, swaggerUi } from './swagger.js'

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

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs))

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

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get home page
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Home page response
 */
app.get('/', getHome)

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Get API status
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API status information
 */
app.get('/status', getStatus)

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/login', passport.authenticate('local-login'), getToken)

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
app.post('/logout', logout)

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/signup', passport.authenticate('local-signup'), welcome)

/**
 * @swagger
 * /welcome:
 *   get:
 *     summary: Get welcome message
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Welcome message
 */
app.get('/welcome', welcome)

/**
 * @swagger
 * /token:
 *   get:
 *     summary: Get current token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Current token information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 */
app.get('/token', getToken)

/**
 * @swagger
 * /tokenInfo:
 *   get:
 *     summary: Get authenticated token information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/tokenInfo', isAuthenticated, getToken)

// Secure API
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for user name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/users', isAuthenticated, allUsers)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/users/:id', isAuthenticated, findUserById)

/**
 * @swagger
 * /users/{id}/favorites:
 *   get:
 *     summary: Get user's favorite lists
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's favorite lists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FavoriteList'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/users/:id/favorites', isAuthenticated, findFavoriteListsByUser)

/**
 * @swagger
 * /users/{userId}/restaurants/visits:
 *   get:
 *     summary: Get all visits for a user
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user visits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visit'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/users/:userId/restaurants/visits', isAuthenticated, allUserVisits)

/**
 * @swagger
 * /users/{userId}/restaurants/{restaurantId}/visits:
 *   get:
 *     summary: Get user visits for a specific restaurant
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of visits for the restaurant by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visit'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/users/:userId/restaurants/:restaurantId/visits', isAuthenticated, findVisitByRestaurantId)

/**
 * @swagger
 * /users/{userId}/restaurants/visits/{id}:
 *   get:
 *     summary: Get a specific visit by ID
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Visit ID
 *     responses:
 *       200:
 *         description: Visit information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Visit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/users/:userId/restaurants/visits/:id', isAuthenticated, findVisitById)

/**
 * @swagger
 * /users/{userId}/restaurants/visits:
 *   post:
 *     summary: Create a new visit
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - rating
 *             properties:
 *               restaurant_id:
 *                 type: string
 *                 description: Restaurant ID
 *               comment:
 *                 type: string
 *                 description: Visit comment
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Visit rating (1-5)
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Visit date
 *     responses:
 *       201:
 *         description: Visit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/users/:userId/restaurants/visits', isAuthenticated, createVisit)

/**
 * @swagger
 * /follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: User ID to follow
 *     responses:
 *       200:
 *         description: Successfully followed user
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/follow', isAuthenticated, follow)

/**
 * @swagger
 * /follow/{id}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to unfollow
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/follow/:id', isAuthenticated, unfollow)

/**
 * @swagger
 * /follow/{id}:
 *   get:
 *     summary: Check if following a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to check
 *     responses:
 *       200:
 *         description: Following status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 following:
 *                   type: boolean
 *                   description: Whether currently following the user
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/follow/:id', isAuthenticated, findIfFollowed)

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for restaurant name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/restaurants', isAuthenticated, allRestaurants)

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/restaurants/:id', isAuthenticated, findRestaurantById)

/**
 * @swagger
 * /restaurants/{id}/visits:
 *   get:
 *     summary: Get all visits for a restaurant
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of visits for the restaurant
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/restaurants/:id/visits', isAuthenticated, allRestaurantVisits)

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Get all favorite lists
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite lists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FavoriteList'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/favorites', isAuthenticated, getFavoriteLists)

/**
 * @swagger
 * /favorites/{id}:
 *   get:
 *     summary: Get favorite list by ID
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Favorite list ID
 *     responses:
 *       200:
 *         description: Favorite list information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteList'
 *       404:
 *         description: Favorite list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/favorites/:id', isAuthenticated, findFavoriteListById)

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Create a new favorite list
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the favorite list
 *               restaurants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of restaurant IDs
 *     responses:
 *       201:
 *         description: Favorite list created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteList'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/favorites', isAuthenticated, createFavoriteList)

/**
 * @swagger
 * /favorites/{id}:
 *   put:
 *     summary: Update a favorite list
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Favorite list ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the favorite list
 *               restaurants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of restaurant IDs
 *     responses:
 *       200:
 *         description: Favorite list updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteList'
 *       404:
 *         description: Favorite list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put('/favorites/:id', isAuthenticated, updateFavoriteList)

/**
 * @swagger
 * /favorites/{id}:
 *   delete:
 *     summary: Delete a favorite list
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Favorite list ID
 *     responses:
 *       200:
 *         description: Favorite list deleted successfully
 *       404:
 *         description: Favorite list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/favorites/:id', isAuthenticated, removeFavoriteList)

/**
 * @swagger
 * /favorites/{id}/restaurants:
 *   post:
 *     summary: Add restaurant to favorite list
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Favorite list ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Restaurant ID to add
 *     responses:
 *       200:
 *         description: Restaurant added to favorite list successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteList'
 *       404:
 *         description: Favorite list or restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/favorites/:id/restaurants', isAuthenticated, addRestaurantToFavoriteList)

/**
 * @swagger
 * /favorites/{id}/restaurants/{restaurantId}:
 *   delete:
 *     summary: Remove restaurant from favorite list
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Favorite list ID
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID to remove
 *     responses:
 *       200:
 *         description: Restaurant removed from favorite list successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteList'
 *       404:
 *         description: Favorite list or restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete(
  '/favorites/:id/restaurants/:restaurantId',
  isAuthenticated,
  removeRestaurantFromFavoriteList
)

// Unsecure API (Livrable 2)
/**
 * @swagger
 * /unsecure/users:
 *   get:
 *     summary: Get all users (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for user name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get('/unsecure/users', allUsers)

/**
 * @swagger
 * /unsecure/users/{id}:
 *   get:
 *     summary: Get user by ID (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/unsecure/users/:id', findUserById)

/**
 * @swagger
 * /unsecure/users/{id}/favorites:
 *   get:
 *     summary: Get user's favorite lists (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's favorite lists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FavoriteList'
 */
app.get('/unsecure/users/:id/favorites', findFavoriteListsByUser)

/**
 * @swagger
 * /unsecure/users/{userId}/restaurants/visits:
 *   get:
 *     summary: Get all visits for a user (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user visits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visit'
 */
app.get('/unsecure/users/:userId/restaurants/visits', allUserVisits)

/**
 * @swagger
 * /unsecure/users/{userId}/restaurants/{restaurantId}/visits:
 *   get:
 *     summary: Get user visits for a specific restaurant (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of visits for the restaurant by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visit'
 */
app.get('/unsecure/users/:userId/restaurants/:restaurantId/visits', findVisitByRestaurantId)

/**
 * @swagger
 * /unsecure/users/{userId}/restaurants/visits/{id}:
 *   get:
 *     summary: Get a specific visit by ID (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Visit ID
 *     responses:
 *       200:
 *         description: Visit information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Visit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/unsecure/users/:userId/restaurants/visits/:id', findVisitById)

/**
 * @swagger
 * /unsecure/users/{userId}/restaurants/visits:
 *   post:
 *     summary: Create a new visit (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - rating
 *             properties:
 *               restaurant_id:
 *                 type: string
 *                 description: Restaurant ID
 *               comment:
 *                 type: string
 *                 description: Visit comment
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Visit rating (1-5)
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Visit date
 *     responses:
 *       201:
 *         description: Visit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/unsecure/users/:userId/restaurants/visits', createVisit)

/**
 * @swagger
 * /unsecure/restaurants:
 *   get:
 *     summary: Get all restaurants (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for restaurant name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 */
app.get('/unsecure/restaurants', allRestaurants)

/**
 * @swagger
 * /unsecure/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/unsecure/restaurants/:id', findRestaurantById)

/**
 * @swagger
 * /unsecure/restaurants/{id}/visits:
 *   get:
 *     summary: Get all visits for a restaurant (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of visits for the restaurant
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/unsecure/restaurants/:id/visits', allRestaurantVisits)

/**
 * @swagger
 * /unsecure/favorites:
 *   get:
 *     summary: Get all favorite lists (unsecured)
 *     tags: [Unsecure API]
 *     responses:
 *       200:
 *         description: List of favorite lists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FavoriteList'
 */
app.get('/unsecure/favorites', getFavoriteLists)

/**
 * @swagger
 * /unsecure/favorites/{id}:
 *   get:
 *     summary: Get favorite list by ID (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Favorite list ID
 *     responses:
 *       200:
 *         description: Favorite list information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteList'
 *       404:
 *         description: Favorite list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/unsecure/favorites/:id', findFavoriteListById)

/**
 * @swagger
 * /unsecure/favorites:
 *   post:
 *     summary: Create a new favorite list (unsecured)
 *     tags: [Unsecure API]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the favorite list
 *               owner:
 *                 type: string
 *                 description: Email of the owner of the favorite list
 *               restaurants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of restaurant IDs
 *     responses:
 *       201:
 *         description: Favorite list created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteList'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/unsecure/favorites', createFavoriteListUnsecure)

/**
 * @swagger
 * /unsecure/favorites/{id}:
 *   put:
 *     summary: Update a favorite list (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Favorite list ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the favorite list
 *               restaurants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of restaurant IDs
 *     responses:
 *       200:
 *         description: Favorite list updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteList'
 *       404:
 *         description: Favorite list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put('/unsecure/favorites/:id', updateFavoriteList)

/**
 * @swagger
 * /unsecure/favorites/{id}:
 *   delete:
 *     summary: Delete a favorite list (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Favorite list ID
 *     responses:
 *       200:
 *         description: Favorite list deleted successfully
 *       404:
 *         description: Favorite list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/unsecure/favorites/:id', removeFavoriteListUnsecure)

/**
 * @swagger
 * /unsecure/favorites/{id}/restaurants:
 *   post:
 *     summary: Add restaurant to favorite list (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Favorite list ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Restaurant ID to add
 *     responses:
 *       200:
 *         description: Restaurant added to favorite list successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteList'
 *       404:
 *         description: Favorite list or restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/unsecure/favorites/:id/restaurants', addRestaurantToFavoriteList)

/**
 * @swagger
 * /unsecure/favorites/{id}/restaurants/{restaurantId}:
 *   delete:
 *     summary: Remove restaurant from favorite list (unsecured)
 *     tags: [Unsecure API]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Favorite list ID
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID to remove
 *     responses:
 *       200:
 *         description: Restaurant removed from favorite list successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteList'
 *       404:
 *         description: Favorite list or restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/unsecure/favorites/:id/restaurants/:restaurantId', removeRestaurantFromFavoriteList)

const port = process.env.PORT || 3000
app.listen(port)

console.log(`Listening on port ${port}`)
