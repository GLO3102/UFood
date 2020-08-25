const Restaurant = require('../repositories/restaurant.js').model

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
    const { q, page, price_range, genres, lon, lat } = req.query
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

    if (q != null) {
      query.name = {
        $regex: q,
        $options: 'i'
      }
    }

    if (lon && lat) {
      const bbox = {
        type: 'Polygon',
        coordinates: [[
          [lon - 1, lat + 1],
          [lon + 1, lat + 1],
          [lon + 1, lat - 1],
          [lon - 1, lat - 1],
          [lon - 1, lat + 1]
        ]]
      };

      query.location = {
        $geoWithin: {
          $geometry: bbox
        }
      }
    }

    const docs = await Restaurant.find(query).limit(limit).skip(limit * page)
    const count = await Restaurant.count(query)

    res.status(200).send({
      items: docs.map(r => r.toDTO()),
      total: count,
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
