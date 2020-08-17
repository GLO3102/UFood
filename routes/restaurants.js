const Restaurant = require('../models/restaurant.js').model

exports.allRestaurants = async (req, res, next) => {
  try {
    const { price_range, genres } = req.query
    const query = {}
    const limit = req.query.limit ? Number(req.query.limit) : 10

    if (price_range != null) {
      query.price_range = {
        $in: price_range.split(',')
      }
    }

    if (genres != null) {
      query.genres = {
        $in: genres.split(',')
      }
    }

    const docs = await Restaurant.find(query).limit(limit)
    res.status(200).send(docs.map(r => r.toJSON()))
  } catch (e) {
    console.error(e)
    res.status(500).send(e)
  }
}

const returnNotFound = (res, req) => {
  if (!res.headerSent) {
    res.status(404).send({
      errorCode: 'RESTAURANT_NOT_FOUND',
      message: 'Restaurant ' + req.params.id + ' was not found'
    })
  }
}

exports.findById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
    if (restaurant) {
      if (!res.headerSent) {
        res.status(200).send(restaurant.toJSON())
      }
    } else {
      returnNotFound(res, req)
    }
  } catch (err) {
    if (err.name === 'CastError') {
      returnNotFound(res, req)
    } else {
      console.error(err)
      if (!res.headerSent) {
        res.status(500).send(err)
      }
    }
  }
}
