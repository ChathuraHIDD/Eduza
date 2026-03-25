const Software = require("../models/Software");

// CREATE SOFTWARE
const createSoftware = async (req, res) => {
  try {
    const software = await Software.create({
      ...req.body,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      message: "Software uploaded successfully",
      software,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL SOFTWARE
const getSoftware = async (req, res) => {
  try {
    const software = await Software.find().sort({ createdAt: -1 });
    res.json(software);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SOFTWARE BY ID
const getSoftwareById = async (req, res) => {
  try {
    const software = await Software.findById(req.params.id);

    if (!software) {
      return res.status(404).json({
        message: "Software not found",
      });
    }

    res.status(200).json(software);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createSoftware,
  getSoftware,
  getSoftwareById,
};