const Restaurant = require('../repositories/restaurant.js').model
const Visit = require('../repositories/visit.js').model

const returnNotFound = (req, res) => {
  if (!res.headerSent) {
    res.status(404).send({
      errorCode: 'RESTAURANT_NOT_FOUND',
      message: 'Restaurant ' + req.params.id + ' was not found'
    })
  }
}

exports.allRestaurants = async (req, res) => {
  try {
    const { q, price_range, genres, page } = req.query
    const lon = req.query.lon ? Number(req.query.lon) : null
    const lat = req.query.lat ? Number(req.query.lat) : null
    const limit = req.query.limit ? Number(req.query.limit) : 10

    const query = {}

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

    if (q != null) {
      query.name = {
        $regex: q,
        $options: 'i'
      }
    }

    if (lon && lat) {
      const bbox = {
        type: 'Polygon',
        coordinates: [
          [
            [lon - 1, lat + 1],
            [lon + 1, lat + 1],
            [lon + 1, lat - 1],
            [lon - 1, lat - 1],
            [lon - 1, lat + 1]
          ]
        ]
      }

      query.location = {
        $geoWithin: {
          $geometry: bbox
        }
      }
    }

    const docs = await Restaurant.find(query)
      .limit(limit)
      .skip(limit * page)
    const count = await Restaurant.count(query)

    res.status(200).send({
      items: docs.map(r => r.toDTO()),
      total: count
    })
  } catch (e) {
    console.error(e)
    res.status(500).send(e)
  }
}

exports.findById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
      return returnNotFound(req, res)
    }

    res.status(200).send(restaurant.toDTO())
  } catch (err) {
    if (err.name === 'CastError') {
      returnNotFound(req, res)
    } else {
      console.error(err)
      if (!res.headerSent) {
        res.status(500).send(err)
      }
    }
  }
}

exports.allRestaurantVisits = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
      return returnNotFound(req, res)
    }

    const { page } = req.query
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const query = { restaurant_id: req.params.id }

    const docs = await Visit.find(query)
      .limit(limit)
      .skip(limit * page)
    const count = await Visit.count(query)

    res.status(200).send({
      items: docs.map(r => r.toJSON()),
      total: count
    })
  } catch (err) {
    console.error(err)
    if (err.name === 'CastError') {
      returnNotFound(req, res)
    } else {
      res.status(500).send(err)
    }
  }
}
