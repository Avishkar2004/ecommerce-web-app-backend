const flatModel = require("../models/flatModel");

const getAllFlats = (req, res) => {
  flatModel.getFlats((error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Database query error' });
    }

    // Process each flat
    const flats = results.map(flat => ({
      ...flat,
      photos: flat.photos ? `data:image/jpeg;base64,${flat.photos.toString('base64')}` : ''
    }));

    res.json(flats);
  });
};

module.exports = {
  getAllFlats,
};
