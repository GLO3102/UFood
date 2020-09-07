const moment = require('moment')
const request = require('supertest')
const jwt = require('jwt-simple')

const { setup, teardown } = require('./helpers')
const app = require('../app')
const User = require('../repositories/user').model
const Visit = require('../repositories/visit').model
const Restaurant = require('../repositories/restaurant').model

const testClient = request(app)

const WRONG_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa'

let user
let accessToken
let visit

describe('visits', () => {
  beforeAll(async () => {
    setup()

    user = await User.findOne({})
    accessToken = jwt.encode(
      { iss: user.id, exp: moment().add(1, 'days').valueOf() },
      app.get('jwtTokenSecret')
    )

    visit = await Visit.create({
      restaurant_id: '5f31fc6155d7790550c08afe',
      user_id: user.id,
      comment: 'This is a good restaurant.',
      rating: 4
    })
  })

  afterAll(async () => {
    await Visit.deleteMany({})
    teardown()
  })

  describe('GET /users/:userId/restaurants/visits', () => {
    it('returns the list of all restaurants', async () => {
      const res = await testClient.get(
        `/users/${user.id}/restaurants/visits?access_token=${accessToken}`
      )
      const { items, total } = res.body

      // Validate general response infos
      expect(res.status).toEqual(200)
      expect(total).toEqual(expect.any(Number))
      expect(items).toEqual(expect.any(Array))

      const item = items.find(i => i.id === visit.id)
      expect(item).toBeDefined()
      expect(item.comment).toEqual(visit.comment)
      expect(item.rating).toEqual(visit.rating)
      expect(item.restaurant_id).toEqual(visit.restaurant_id)
      expect(item.user_id).toEqual(visit.user_id)
    })
  })

  describe('GET /users/:userId/restaurants/visits/:id', () => {
    it('returns a 404 if user does not exist', async () => {
      const res = await testClient.get(
        `/users/${WRONG_ID}/restaurants/visits/${visit.id}?access_token=${accessToken}`
      )
      // Validate general response infos
      expect(res.status).toEqual(404)
    })

    it('returns a 404 if visit does not exist', async () => {
      const res = await testClient.get(
        `/users/${user.id}/restaurants/visits/${WRONG_ID}?access_token=${accessToken}`
      )
      // Validate general response infos
      expect(res.status).toEqual(404)
    })

    it('returns the details of the requested visit', async () => {
      const res = await testClient.get(
        `/users/${user.id}/restaurants/visits/${visit.id}?access_token=${accessToken}`
      )
      // Validate general response infos
      expect(res.status).toEqual(200)

      const item = res.body
      expect(item.comment).toEqual(visit.comment)
      expect(item.rating).toEqual(visit.rating)
      expect(item.restaurant_id).toEqual(visit.restaurant_id)
      expect(item.user_id).toEqual(visit.user_id)
    })
  })

  describe('POST /users/:userId/restaurants/visits', () => {
    it('creates a new visit based on the informations given', async () => {
      const res = await testClient
        .post(`/users/${user.id}/restaurants/visits?access_token=${accessToken}`)
        .send({
          restaurantId: '5f31fc6155d7790550c08afe',
          comment: 'This is a very good restaurant.',
          rating: 5
        })

      // Validate general response infos
      expect(res.status).toEqual(201)

      const item = res.body
      expect(moment(item.date).isValid()).toBeTruthy()
      expect(item.comment).toEqual('This is a very good restaurant.')
      expect(item.rating).toEqual(5)
      expect(item.restaurant_id).toEqual('5f31fc6155d7790550c08afe')
    })

    it("increments the user's rating", async () => {
      const { rating: oldRating } = await User.findById(user._id)

      const res = await testClient
        .post(`/users/${user.id}/restaurants/visits?access_token=${accessToken}`)
        .send({
          restaurantId: '5f31fc6155d7790550c08afe',
          comment: 'This is a very good restaurant.',
          rating: 5
        })

      // Validate general response infos
      expect(res.status).toEqual(201)

      const { rating } = await User.findById(user._id)
      expect(rating).toEqual(oldRating + 10)
    })

    it("increments the user's rating", async () => {
      const restaurantId = '5f31fc6155d7790550c08afe'
      const { rating: oldRating } = await Restaurant.findById(restaurantId)

      const res = await testClient
        .post(`/users/${user.id}/restaurants/visits?access_token=${accessToken}`)
        .send({
          restaurantId,
          comment: 'This is a very good restaurant.',
          rating: 5
        })

      // Validate general response infos
      expect(res.status).toEqual(201)

      const visitCount = await Visit.count({ restaurant_id: restaurantId })
      const { rating: newRating } = await Restaurant.findById(restaurantId)

      expect(newRating).toEqual((oldRating + 5) / (visitCount + 1))
    })
  })
})
