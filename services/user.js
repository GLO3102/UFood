const User = require('../repositories/user.js').model

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

    const docs = await User.find(query).limit(limit).skip(limit * page)
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

exports.findByName = async (req, res) => {
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

exports.follow = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.body.id)
    if (userToFollow) {
      if (!req.user.isFollowingUser(userToFollow.id)) {
        req.user.following.push({
          id: userToFollow.id,
          email: userToFollow.email,
          name: userToFollow.name
        })
        req.user.save(err => {
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

exports.unfollow = (req, res) => {
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
