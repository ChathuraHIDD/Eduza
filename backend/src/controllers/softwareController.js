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

const getSoftwareById = async (req, res) => {
    try {
      const software = await Software.findById(req.params.id).populate(
        "uploadedBy",
        "name email role"
      );
  
      if (!software) {
        return res.status(404).json({
          message: "Software not found",
        });
      }
  
      return res.status(200).json(software);
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Server error while fetching software",
      });
    }
  };

  module.exports = {
    createSoftware,
    getAllSoftware,
    getSoftwareById,
  };