const db = require("../config/db");

const getFlats = (callback) => {
  const query = "SELECT * FROM flats";
  db.query(query, (error, results) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, results);
  });
};

module.exports = {
  getFlats,
};
