exports.verify = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [bearer, access_token] = await authorization.split(" ");
    if (!access_token) {
      rs.status(400).json({
        success: false,
        error: "unauthorized, access token required"
      });
    }
    conn.query(
      `SELECT * FROM users WHERE access_token='${access_token}'`,
      (error, user) => {
        if (error) {
          res.status(400).json({ success: false, error: error });
        }
        if (user.length > 0) {
          req.user = user[0];
          next(null, user);
        } else {
          res.status(400).json({ success: false, error: `unauthorized` });
        }
      }
    );
  } catch (error) {
    if (error) {
      res.status(400).json({ success: false, error: error });
    }
  }
};
