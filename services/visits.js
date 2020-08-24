const User = require('../repositories/user.js').model
const Visit = require('../repositories/visit.js').model

exports.allUserVisits = async (req, res) => {
  try {
    const userExists = await User.exists({ _id: req.params.id })

    if (!userExists) {
      return res.status(404).send({
        errorCode: 'USER_NOT_FOUND',
        message: 'User ' + req.params.id + ' was not found'
      })
    }

    const { page } = req.query
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const query = { user_id: req.params.id }

    const docs = await Visit.find(query)
      .limit(limit)
      .skip(limit * page)
    const count = await Visit.count(query)

    res.status(200).send({
      items: docs.map(r => r.toJSON()),
      total: count
    })
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}
