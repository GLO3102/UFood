export const welcome = (req, res) => {
  if (req.user) {
    res.status(200).send({
      message: 'USER_SIGNED_UP_SUCCESSFULLY',
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name
      }
    })
  }
}
