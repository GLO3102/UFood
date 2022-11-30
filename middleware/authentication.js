const url = require('url')
const UserModel = require('../repositories/user').model
const jwt = require('jwt-simple')

exports.isAuthenticated = async (req, res, next) => {
  const token = exports.retrieveToken(req)

  if (token) {
    let decoded = null;

    try {
      decoded = jwt.decode(token, 'UFOOD_TOKEN_SECRET')
    } catch (err) {
      return res.status(401).send({
        errorCode: 'ACCESS_DENIED',
        message: err.toString()
      })
    }
    try {
      const user = await UserModel.findOne({ _id: decoded.iss })
      if (user) {
        req.user = user
        return next()
      } else {
        return res.status(401).send({
          errorCode: 'ACCESS_DENIED',
          message: 'User associated with token was not found'
        })
      }
    } catch (err) {
      return res.status(401).send({
        errorCode: 'ACCESS_DENIED',
        message: 'Error retrieving user associated with token'
      })
    }
  } else {
    return res.status(401).send({
      errorCode: 'ACCESS_DENIED',
      message: 'Access token is missing'
    })
  }
}

exports.retrieveToken = req => {
  const parsedUrl = url.parse(req.url, true)

  return (
    (req.body && req.body.access_token) ||
    parsedUrl.query.access_token ||
    req.headers['authorization'] ||
    req.headers['Authorization']
  )
}
