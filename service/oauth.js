exports.authenticate = (req, res) => {
  try {
    const { code } = req;
    res.status(200).json({ code });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error
    });
  }
};
