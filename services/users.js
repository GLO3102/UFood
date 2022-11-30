const User = require('../repositories/user.js').model

const returnNotFound = (req, res) => {
  if (!res.headerSent) {
    res.status(404).send({
      errorCode: 'USER_NOT_FOUND',
      message: 'User ' + req.params.id + ' was not found'
    })
  }
}

exports.allUsers = async (req, res) => {
  try {
    const { page, q } = req.query
    const limit = req.query.limit ? Number(req.query.limit) : 10
    let query = {}

    if (q) {
      query = {
        name: new RegExp(q, 'i')
      }
    }

    const docs = await User.find(query)
      .limit(limit)
      .skip(limit * page)
      .sort('name')
    const count = await User.count(query)

    const users = docs.map(d => d.toDTO())

    res.status(200).send({
      items: users,
      total: count
    })
  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  }
}

exports.findById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return returnNotFound(req, res)
    }

    res.status(200).send(user.toDTO(true, true))
  } catch (err) {
    if (err.name === 'CastError') {
      if (!res.headerSent) {
        returnNotFound(req, res)
      }
    } else {
      console.error(err)
      if (!res.headerSent) {
        res.status(500).send(err)
      }
    }
  }
}

exports.follow = async (req, res) => {
  try {
    if (req.user.id === req.body.id) {
      return res.status(404).send({
        errorCode: 'CANNOT_FOLLOW_USER',
        message: 'You cannot follow yourself'
      })
    }

    const userToFollow = await User.findById(req.body.id)
    if (!userToFollow) {
      return res.status(404).send({
        errorCode: 'USER_NOT_FOUND',
        message: 'User with id ' + req.body.id + ' was not found'
      })
    }

    if (req.user.isFollowingUser(userToFollow.id)) {
      return res.status(412).send({
        errorCode: 'ALREADY_FOLLOWING_USER',
        message: 'You already follow user ' + req.body.id
      })
    }

    req.user.following.push({
      id: userToFollow.id,
      email: userToFollow.email,
      name: userToFollow.name
    })

    userToFollow.followers.push({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name
    })

    await req.user.save()
    await userToFollow.save()

    res.status(201).send(req.user.toDTO(true, true))
  } catch (err) {
    console.error(err)
    res.send(500)
  }
}

exports.unfollow = async (req, res) => {
  try {
    const userId = req.params.id

    if (!req.user.isFollowingUser(userId)) {
      return res.status(404).send({
        errorCode: 'USER_NOT_FOUND',
        message: 'User does not follow user with id ' + userId
      })
    }

    await req.user.unfollow(userId)

    const unfollowedUser = await User.findById(userId)
    if (unfollowedUser) {
      await unfollowedUser.removeFollower(req.user.id)
    }

    res.status(200).send(req.user.toDTO(true, true))
  } catch (err) {
    console.error(err)
    res.send(500)
  }
}

exports.findIfFollowed = async (req, res) => {
  try {
    const user = await req.user.isFollowingUser(req.params.id)

    if (!user) {
      return res.status(404).send({
        errorCode: 'USER_NOT_FOUND',
        message: 'User does not follow user with id ' + req.params.id
      })
    }

    res.status(200).send(user.toDTO(true, true))
  } catch (err) {
    res.status(500).send(err)
  }
}
