import { retrieveToken } from '../middleware/authentication.js'

export const getToken = (req, res) => {
  if (req.user) {
    res.send(req.user)
  } else {
    const token = retrieveToken(req)
    if (token) {
      res.status(401).send({
        errorCode: 'ACCESS_DENIED',
        message: 'User associated with token was not found'
      })
    } else {
      res.status(401).send({
        errorCode: 'ACCESS_DENIED',
        message: 'Access token is missing'
      })
    }
  }
  req.session.destroy()
}

export const logout = async (req, res) => {
  if (req.user) {
    req.user.token = undefined
    await req.user.save()
  }

  req.session.destroy()
  req.logout(() => {
    res.status(200).send()
  })
}
