const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const modelHelpers = require('./modelHelpers.js')
const _ = require('underscore')

const userSchema = new mongoose.Schema()
userSchema.add({
  name: String,
  email: String,
  password: String,
  token: String,
  expiration: Number,
  following: [
    {
      name: String,
      email: String,
      id: String
    }
  ]
})

userSchema.methods.toDTO = function(following) {
  const obj = this.toJSON()

  const dto = {
    id: obj.id.toString(),
    name: obj.name,
    email: obj.email
  }

  if (following) {
    dto.following = obj.following.map(user => {
      return {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  }

  return dto
}

userSchema.methods.isFollowingUser = function(userId) {
  for (let i = 0; i < this.following.length; i++) {
    if (this.following[i].id == userId) {
      return true
    }
  }
  return false
}

userSchema.methods.unfollow = function(userId) {
  let userToRemove
  for (let i = 0; i < this.following.length; i++) {
    if (this.following[i].id == userId) {
      userToRemove = this.following[i]
    }
  }

  if (userToRemove) {
    this.following = _.without(this.following, userToRemove)
    this.save()
  }
}

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
}
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

userSchema.method('toJSON', modelHelpers.toJSON)

const User = mongoose.model('User', userSchema)

exports.schema = userSchema
exports.model = User
