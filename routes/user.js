const User = require('../models/user.js').model

exports.allUsers = async function(req, res) {
  try {
    const docs = await User.find({})
    const users = []
    for (let i = 0; i < docs.length; i++) {
      users.push(docs[i].toDTO())
    }
    res.status(200).send(users)
  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  }
}

exports.findById = async function(req, res) {
  try {
    const user = await User.findById(req.params.id)
    if (user) {
      if (!res.headerSent) {
        res.status(200).send(user.toDTO(true))
      }
    } else {
      if (!res.headerSent) {
        res.status(404).send({
          errorCode: 'USER_NOT_FOUND',
          message: 'User ' + req.params.id + ' was not found'
        })
      }
    }
  } catch (err) {
    if (err.name === 'CastError') {
      if (!res.headerSent) {
        res.status(404).send({
          errorCode: 'USER_NOT_FOUND',
          message: 'User ' + req.params.id + ' was not found'
        })
      }
    } else {
      console.error(err)
      if (!res.headerSent) {
        res.status(500).send(err)
      }
    }
  }
}

exports.findByName = async function(req, res) {
  const name = req.query.q
  try {
    const users = await User.find({
      name: new RegExp(name, 'i')
    })
    if (users) {
      const formattedUsers = []
      for (let i = 0; i < users.length; i++) {
        formattedUsers.push(users[i].toDTO(true))
      }
      res.status(200).send(formattedUsers)
    } else {
      res.status(404).send({
        errorCode: 'USER_NOT_FOUND',
        message: 'User ' + req.params.id + ' was not found'
      })
    }
  } catch (err) {
    console.error(err)
    if (err.name === 'CastError') {
      res.status(404).send({
        errorCode: 'USER_NOT_FOUND',
        message: 'User ' + req.params.id + ' was not found'
      })
    } else {
      res.status(500).send(err)
    }
  }
}

exports.follow = async function(req, res) {
  try {
    const userToFollow = await User.findById(req.body.id)
    if (userToFollow) {
      if (!req.user.isFollowingUser(userToFollow.id)) {
        req.user.following.push({
          id: userToFollow.id,
          email: userToFollow.email,
          name: userToFollow.name
        })
        req.user.save(function(err) {
          if (!err) {
            console.log(req.user.toDTO(true))
            res.status(201).send(req.user.toDTO(true))
          } else {
            res.status(500).send('Impossible to follow.')
            console.error(err)
          }
        })
      } else {
        res.status(412).send({
          errorCode: 'ALREADY_FOLLOWING_USER',
          message: 'You already follow user ' + req.body.id
        })
      }
    } else {
      res.status(404).send({
        errorCode: 'USER_NOT_FOUND',
        message: 'User with id ' + req.body.id + ' was not found'
      })
    }
  } catch (err) {
    console.error(err)
    res.send(500)
  }
}

exports.unfollow = function(req, res) {
  const userId = req.params.id
  if (req.user.isFollowingUser(userId)) {
    req.user.unfollow(userId)
    res.status(200).send(req.user.toDTO(true))
  } else {
    res.status(404).send({
      errorCode: 'USER_NOT_FOUND',
      message: 'User does not follow user with id ' + req.body.id
    })
  }
}
