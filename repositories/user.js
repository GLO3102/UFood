const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const modelHelpers = require('./modelHelpers.js')

const userSchema = new mongoose.Schema()
userSchema.add({
  name: String,
  email: String,
  password: String,
  token: String,
  expiration: Number,
  followers: [
    {
      name: String,
      email: String,
      id: String
    }
  ],
  following: [
    {
      name: String,
      email: String,
      id: String
    }
  ]
})

userSchema.methods.toDTO = function (following, followers) {
  const obj = this.toJSON()

  const dto = {
    id: obj.id.toString(),
    name: obj.name,
    email: obj.email
  }

  if (following) {
    dto.following = obj.following.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name
    }))
  }

  if (followers) {
    dto.followers = obj.followers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name
    }))
  }

  return dto
}

userSchema.methods.isFollowingUser = userId => {
  for (let i = 0; i < this.following.length; i++) {
    if (this.following[i].id == userId) {
      return true
    }
  }
  return false
}

userSchema.methods.unfollow = userId => {
  this.following = this.following.filter(user => user.id !== userId)
  this.save()
}

userSchema.methods.removeFollower = userId => {
  this.followers = this.followers.filter(user => user.id !== userId)
  this.save()
}

userSchema.methods.generateHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
}
userSchema.methods.validPassword = password => {
  return bcrypt.compareSync(password, this.password)
}

userSchema.method('toJSON', modelHelpers.toJSON)

const User = mongoose.model('User', userSchema)

exports.schema = userSchema
exports.model = User
