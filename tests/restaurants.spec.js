const moment = require('moment')
const request = require('supertest')
const jwt = require('jwt-simple')

const { setup, teardown } = require('./helpers')
const app = require('../app')
const Restaurant = require('../repositories/restaurant').model
const User = require('../repositories/user').model

const WRONG_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa'

const testClient = request(app)

let user
let accessToken

describe('restaurants', () => {
  beforeAll(async () => {
    setup()

    user = await User.findOne({})
    accessToken = jwt.encode(
      { iss: user.id, exp: moment().add(1, 'days').valueOf() },
      app.get('jwtTokenSecret')
    )
  })

  afterAll(async () => {
    teardown()
  })

  describe('GET /unsecure/restaurants', () => {
    it('returns the list of all restaurants', async () => {
      const res = await testClient.get('/unsecure/restaurants')

      const { items, total } = res.body

      // Validate general response infos
      expect(res.status).toEqual(200)
      expect(total).toEqual(expect.any(Number))
      expect(items).toEqual(expect.any(Array))

      const restaurant = items[0]

      // Find equivalent restaurant in DB
      const dbRestaurant = (await Restaurant.findOne({ place_id: restaurant.place_id })).toDTO()

      // Validate against the DB object
      expect(restaurant.id).toEqual(dbRestaurant.id)
      expect(restaurant.opening_hours).toEqual(dbRestaurant.opening_hours)
      expect(restaurant.pictures).toEqual(dbRestaurant.pictures)
      expect(restaurant.genres).toEqual(dbRestaurant.genres)
      expect(restaurant.name).toEqual(dbRestaurant.name)
      expect(restaurant.place_id).toEqual(dbRestaurant.place_id)
      expect(restaurant.tel).toEqual(dbRestaurant.tel)
      expect(restaurant.address).toEqual(dbRestaurant.address)
      expect(restaurant.price_range).toEqual(dbRestaurant.price_range)
      expect(restaurant.rating).toEqual(dbRestaurant.rating)
      expect(restaurant.location).toEqual(dbRestaurant.location)
    })
  })

  describe('GET /unsecure/restaurants/:id', () => {
    it('returns a 404 if restaurant does not exist', async () => {
      const res = await testClient.get(
        `/unsecure/restaurants/${WRONG_ID}?access_token=${accessToken}`
      )
      expect(res.status).toEqual(404)
    })

    it('returns the details of the requested restaurant', async () => {
      const dbRestaurant = (await Restaurant.findOne({})).toDTO()
      const { status, body: restaurant } = await testClient.get(
        `/unsecure/restaurants/${dbRestaurant.id}`
      )

      expect(status).toEqual(200)

      // Validate against the DB object
      expect(restaurant.id).toEqual(dbRestaurant.id)
      expect(restaurant.opening_hours).toEqual(dbRestaurant.opening_hours)
      expect(restaurant.pictures).toEqual(dbRestaurant.pictures)
      expect(restaurant.genres).toEqual(dbRestaurant.genres)
      expect(restaurant.name).toEqual(dbRestaurant.name)
      expect(restaurant.place_id).toEqual(dbRestaurant.place_id)
      expect(restaurant.tel).toEqual(dbRestaurant.tel)
      expect(restaurant.address).toEqual(dbRestaurant.address)
      expect(restaurant.price_range).toEqual(dbRestaurant.price_range)
      expect(restaurant.rating).toEqual(dbRestaurant.rating)
      expect(restaurant.location).toEqual(dbRestaurant.location)
    })
  })

  describe('when user is not logged in', () => {
    describe('GET /restaurants', () => {
      it('should return a 401', async () => {
        const res = await testClient.get('/restaurants')

        expect(res.status).toEqual(401)
      })
    })

    describe('GET /restaurants/:id', () => {
      it('should return a 401', async () => {
        const dbRestaurant = (await Restaurant.findOne({})).toDTO()
        const res = await testClient.get(`/restaurants/${dbRestaurant.id}`)

        expect(res.status).toEqual(401)
      })
    })
  })

  describe('when user is logged in', () => {
    describe('GET /restaurants', () => {
      it('returns the list of all restaurants', async () => {
        const res = await testClient.get(`/restaurants?access_token=${accessToken}`)

        const { items, total } = res.body

        // Validate general response
        expect(res.status).toEqual(200)
        expect(total).toEqual(expect.any(Number))
        expect(items).toEqual(expect.any(Array))

        const restaurant = items[0]
        const dbRestaurant = (await Restaurant.findOne({ place_id: restaurant.place_id })).toDTO()

        // Validate against one of the DB restaurants
        expect(restaurant.id).toEqual(dbRestaurant.id)
        expect(restaurant.opening_hours).toEqual(dbRestaurant.opening_hours)
        expect(restaurant.pictures).toEqual(dbRestaurant.pictures)
        expect(restaurant.genres).toEqual(dbRestaurant.genres)
        expect(restaurant.name).toEqual(dbRestaurant.name)
        expect(restaurant.place_id).toEqual(dbRestaurant.place_id)
        expect(restaurant.tel).toEqual(dbRestaurant.tel)
        expect(restaurant.address).toEqual(dbRestaurant.address)
        expect(restaurant.price_range).toEqual(dbRestaurant.price_range)
        expect(restaurant.rating).toEqual(dbRestaurant.rating)
        expect(restaurant.location).toEqual(dbRestaurant.location)
      })

      it('supports filtering with query string', async () => {
        const q = 'castor'
        const res = await testClient.get(`/restaurants?access_token=${accessToken}&q=${q}`)

        const { items } = res.body

        for (const item of items) {
          expect(item.name.match(new RegExp(q, 'i'))).toBeTruthy()
        }
      })

      it('supports filtering by price range', async () => {
        const price_range = [2, 3]
        const res = await testClient.get(
          `/restaurants?access_token=${accessToken}&price_range=${price_range.join(',')}`
        )

        const { items } = res.body

        for (const item of items) {
          expect(price_range).toContain(item.price_range)
        }
      })

      it('supports filtering by genres', async () => {
        const genres = ['spicy']
        const res = await testClient.get(
          `/restaurants?access_token=${accessToken}&genre=${genres.join(',')}`
        )

        const { items } = res.body

        for (const item of items) {
          const matchingGenre = genres.find(g => item.genres.includes(g))
          expect(matchingGenre).not.toBe(null)
        }
      })

      it('supports limiting the number of results', async () => {
        const res = await testClient.get(`/restaurants?access_token=${accessToken}&limit=2`)

        const { items } = res.body
        expect(items.length).toBe(2)
      })

      it('supports searching within a region bbox', async () => {
        const lon = -71
        const lat = 45

        const res = await testClient.get(
          `/restaurants?access_token=${accessToken}&lon=${lon}&lat=${lat}`
        )
        const { items } = res.body

        for (const item of items) {
          expect(item.location.lon >= lon - 1).toBeTruthy()
          expect(item.location.lon <= lon + 1).toBeTruthy()
          expect(item.location.lat >= lat - 1).toBeTruthy()
          expect(item.location.lat <= lat + 1).toBeTruthy()
        }
      })
    })

    describe('GET /restaurants/:id', () => {
      it('returns a 404 if restaurant does not exist', async () => {
        const res = await testClient.get(`/restaurants/${WRONG_ID}?access_token=${accessToken}`)
        expect(res.status).toEqual(404)
      })

      it('returns the details of the requested restaurant', async () => {
        const dbRestaurant = (await Restaurant.findOne({})).toDTO()
        const { status, body: restaurant } = await testClient.get(
          '/restaurants/' + dbRestaurant.id + '?access_token=' + accessToken
        )

        expect(status).toEqual(200)

        // Validate against the DB object
        expect(restaurant.id).toEqual(dbRestaurant.id)
        expect(restaurant.opening_hours).toEqual(dbRestaurant.opening_hours)
        expect(restaurant.pictures).toEqual(dbRestaurant.pictures)
        expect(restaurant.genres).toEqual(dbRestaurant.genres)
        expect(restaurant.name).toEqual(dbRestaurant.name)
        expect(restaurant.place_id).toEqual(dbRestaurant.place_id)
        expect(restaurant.tel).toEqual(dbRestaurant.tel)
        expect(restaurant.address).toEqual(dbRestaurant.address)
        expect(restaurant.price_range).toEqual(dbRestaurant.price_range)
        expect(restaurant.rating).toEqual(dbRestaurant.rating)
        expect(restaurant.location).toEqual(dbRestaurant.location)
      })
    })
  })
})
