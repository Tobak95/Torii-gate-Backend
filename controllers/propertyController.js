const PROPERTY = require("../models/property");

const createProperty = async (req, res) => {
  res.send("create property");
};

const getLandlordProperties = async (req, res) => {
  res.send("get landlords properties");
};

const UpdatePropertyAvailability = async (req, res) => {
  res.send("update property availability");
};

// Firstly we start with This function that retrieves all properties from the database
const getAllProperties = async (req, res) => {
  try {
    const { page = 1, location } = req.query; //location was not used in the original code, but you can implement filtering based on location if needed.
    const limit = 12;
    const skip = (page - 1) * limit;
    const filter = {
      availability: "available",
    };
    if (location) {
        filter.location = { $regex: location, $options: "i" }; // Case-insensitive search for location
    }



    const properties = await PROPERTY.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const totalProperties = await PROPERTY.countDocuments(filter);
    const totalPages = Math.ceil(totalProperties / limit);

    res
      .status(200)
      .json({
        num: properties.length,
        totalPages,
        currentPage: parseInt(page),
        properties,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error.message" });
  }
};

const getAProperty = async (req, res) => {
  res.send("get a property");
};

module.exports = {
  createProperty,
  getLandlordProperties,
  UpdatePropertyAvailability,
  getAllProperties,
  getAProperty,
};
