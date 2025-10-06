export const welcome = (req, res) => {
  if (req.user) {
    res.status(200).send({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name
      }
    })
  }
}
