const FavoriteList = require('../repositories/favoriteList').model
const User = require('../repositories/user').model
const Restaurant = require('../repositories/restaurant').model

const returnNotFound = (req, res) => {
  res.status(404).send({
    errorCode: 'FAVORITE_LIST_NOT_FOUND',
    message: 'Favorite list ' + req.params.id + ' was not found'
  })
}

const returnRestaurantNotFound = (req, res) => {
  res.status(404).send({
    errorCode: 'RESTAURANT_NOT_FOUND',
    message: 'Restaurant ' + req.body.id + ' was not found'
  })
}

const handleError = (req, res, err) => {
  console.error(err)
  if (err.name === 'CastError') {
    returnNotFound(req, res)
  } else {
    res.status(500).send(err)
  }
}

exports.createFavoriteList = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const favoriteList = new FavoriteList({
      name: req.body.name,
      owner: user.toJSON()
    })
    await favoriteList.save()
    res.status(201).send(favoriteList.toJSON())
  } catch (err) {
    console.error(err)
    res.status(500)
  }
}

exports.createFavoriteListUnsecure = async (req, res) => {
  try {
    if (!req.body.owner || !req.body.name) {
      return res.status(400).send({
        errorCode: 'BAD_REQUEST',
        message: 'Missing parameters. Unsecure favorite list must specify a name and an owner.'
      })
    }

    const user = await User.findOne({ email: req.body.owner })
    if (user) {
      const favoriteList = new FavoriteList({
        name: req.body.name,
        owner: user.toJSON()
      })
      await favoriteList.save()
      res.status(201).send(favoriteList.toJSON())
    } else {
      res.status(404).send({
        errorCode: 'USER_NOT_FOUND',
        message: `User with email "${req.body.owner}" does not exist.`
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500)
  }
}

exports.addRestaurantToFavoriteList = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({
        errorCode: 'REQUEST_BODY_REQUIRED',
        message: 'Request body is missing'
      })
    }

    if (!req.body.id) {
      return returnRestaurantNotFound(req, res)
    }

    const favoriteList = await FavoriteList.findById(req.params.id)

    if (!favoriteList) {
      return returnNotFound(req, res)
    }

    const restaurant = await Restaurant.findById(req.body.id)
    if (!restaurant) {
      return returnRestaurantNotFound(req, res)
    }

    const newRestaurant = new Restaurant(req.body)

    favoriteList.restaurants.push({
      ...newRestaurant.toJSON(),
      _id: restaurant.id
    })

    await favoriteList.save()
    res.status(200).send(favoriteList.toJSON())
  } catch (err) {
    handleError(req, res, err)
  }
}

exports.removeRestaurantFromFavoriteList = async (req, res) => {
  try {
    const favoriteList = await FavoriteList.findById(req.params.id)

    if (!favoriteList) {
      return returnNotFound(req, res)
    }

    const restaurantToRemove = favoriteList.restaurants
      .filter(r => r.id === req.params.restaurantId)
      .pop()

    if (!restaurantToRemove) {
      return res.status(404).send({
        errorCode: 'RESTAURANT_NOT_FOUND',
        message: 'Restaurant ' + req.params.restaurantId + ' was not found'
      })
    }

    restaurantToRemove.remove()
    favoriteList.save()
    res.status(200).send(favoriteList.toJSON())
  } catch (err) {
    handleError(req, res, err)
  }
}

exports.updateFavoriteList = async (req, res) => {
  try {
    const favoriteList = await FavoriteList.findById(req.params.id)

    if (!favoriteList) {
      return returnNotFound(req, res)
    }

    favoriteList.name = req.body.name
    favoriteList.tracks = req.body.tracks
    favoriteList.save()
    res.status(200).send(favoriteList.toJSON())
  } catch (err) {
    handleError(req, res, err)
  }
}

exports.removeFavoriteList = async (req, res) => {
  try {
    const favoriteList = await FavoriteList.findById(req.params.id)

    if (!favoriteList) {
      return returnNotFound(req, res)
    }

    if (favoriteList.owner.id !== req.user.id) {
      return res.status(400).send({
        errorCode: 'NOT_FAVORITE_LIST_OWNER',
        message: 'Favorite list can only be deleted by their owner'
      })
    }

    favoriteList.remove()
    res.status(200).send({
      message: 'Favorite list ' + req.params.id + ' deleted successfully'
    })
  } catch (err) {
    handleError(req, res, err)
  }
}

exports.removeFavoriteListUnsecure = async (req, res) => {
  try {
    const favoriteList = await FavoriteList.findById(req.params.id)

    if (!favoriteList) {
      return returnNotFound(req, res)
    }

    favoriteList.remove()
    res.status(200).send({
      message: 'Favorite list ' + req.params.id + ' deleted successfully'
    })
  } catch (err) {
    handleError(req, res, err)
  }
}

exports.getFavoriteLists = async (req, res) => {
  try {
    const { page } = req.query
    const limit = req.query.limit ? Number(req.query.limit) : 10

    const docs = await FavoriteList.find({})
      .limit(limit)
      .skip(limit * page)
    const count = await FavoriteList.count()

    const favoriteLists = docs.map(d => d.toJSON())

    res.status(200).send({
      items: favoriteLists,
      total: count
    })
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

exports.findFavoriteListById = async (req, res) => {
  try {
    const favoriteList = await FavoriteList.findById(req.params.id)

    if (!favoriteList) {
      return returnNotFound(req, res)
    }

    res.status(200).send(favoriteList.toJSON())
  } catch (err) {
    handleError(req, res, err)
  }
}

exports.findFavoriteListsByUser = async (req, res) => {
  try {
    const { page } = req.query
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const userId = req.params.id
    const query = { 'owner.id': userId }

    const docs = await FavoriteList.find(query)
      .limit(limit)
      .skip(limit * page)
    const count = await FavoriteList.count(query)

    const favoriteLists = docs.map(d => d.toJSON())

    res.status(200).send({
      items: favoriteLists,
      total: count
    })
  } catch (err) {
    res.status(500).send(err)
  }
}
