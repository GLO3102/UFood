const Restaurant = require('../repositories/restaurant.js').model
const User = require('../repositories/user.js').model
const Visit = require('../repositories/visit.js').model

const restaurantNotFound = (req, res) => {
  res.status(404).send({
    errorCode: 'RESTAURANT_NOT_FOUND',
    message: 'Restaurant ' + req.body.restaurant_id + ' was not found'
  })
}

const userNotFound = (req, res) => {
  res.status(404).send({
    errorCode: 'USER_NOT_FOUND',
    message: 'User ' + req.params.userId + ' was not found'
  })
}

const visitNotFound = (req, res) => {
  res.status(404).send({
    errorCode: 'VISIT_NOT_FOUND',
    message: 'Visit ' + req.params.id + ' was not found'
  })
}

const ensureUser = async (req, res) => {
  const userExists = await User.exists({ _id: req.params.userId })

  return userExists
}

exports.allUserVisits = async (req, res) => {
  try {
    const isUserValid = await ensureUser(req, res)

    if (!isUserValid) {
      return userNotFound(req, res)
    }

    const { page } = req.query
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const query = { user_id: req.params.userId }

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
      userNotFound(req, res)
    } else {
      res.status(500).send(err)
    }
  }
}

exports.findByRestaurantId = async (req, res) => {
  try {
    const isUserValid = await ensureUser(req, res)

    if (!isUserValid) {
      return userNotFound(req, res)
    }

    const { page } = req.query
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const query = { user_id: req.params.userId, restaurant_id: req.params.restaurantId }

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
      visitNotFound(req, res)
    } else {
      res.status(500).send(err)
    }
  }
}

exports.findById = async (req, res) => {
  try {
    const isUserValid = await ensureUser(req, res)

    if (!isUserValid) {
      return userNotFound(req, res)
    }

    const visit = await Visit.findById(req.params.id)

    if (!visit) {
      return visitNotFound(req, res)
    }

    res.status(200).send(visit.toJSON())
  } catch (err) {
    console.error(err)
    if (err.name === 'CastError') {
      visitNotFound(req, res)
    } else {
      res.status(500).send(err)
    }
  }
}

exports.createVisit = async (req, res) => {
  let restaurant, user
  try {
    user = await User.findById(req.params.userId)

    if (!user) {
      return userNotFound(req, res)
    }
  } catch (err) {
    console.error(err)
    if (err.name === 'CastError') {
      return userNotFound(req, res)
    } else {
      return res.status(500).send(err)
    }
  }

  if (!req.body.restaurant_id || !req.body.rating) {
    return res.status(400).send({
      errorCode: 'BAD_REQUEST',
      message: 'Missing parameters. A restaurant ID and a rating must be specified.'
    })
  }

  try {
    restaurant = await Restaurant.findById(req.body.restaurant_id)

    if (!restaurant) {
      return restaurantNotFound(req, res)
    }
  } catch (err) {
    console.error(err)
    if (err.name === 'CastError') {
      return restaurantNotFound(req, res)
    } else {
      return res.status(500).send(err)
    }
  }

  try {
    const visit = new Visit({
      restaurant_id: req.body.restaurant_id,
      user_id: req.params.userId,
      comment: req.body.comment,
      rating: req.body.rating,
      date: req.body.date || new Date()
    })

    await visit.save()

    // Give user 10 points when visiting a restaurant
    user.rating = user.rating + 10
    await user.save()

    const visitCount = await Visit.count({ restaurant_id: req.body.restaurant_id })

    // Compute new restaurant rating
    if (visitCount !== 0) {
      restaurant.rating = (restaurant.rating * visitCount + req.body.rating) / (visitCount + 1)
    } else {
      restaurant.rating = req.body.rating
    }

    if (restaurant.rating > 5) {
      restaurant.rating = 5
    } else if (restaurant.rating < 0) {
      restaurant.rating = 0
    }

    await restaurant.save()

    res.status(201).send(visit.toDTO())
  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  }
}
