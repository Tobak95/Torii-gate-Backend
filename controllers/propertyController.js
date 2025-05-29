const PROPERTY = require("../models/property");

const createProperty = async (req, res) => {
  res.send("create property");
};

const getLandlordProperties = async (req, res) => {
  const { userId } = req.user; // Assuming userId is available in req.user
  const { page = 1 } = req.query; // Get the page number from query parameters
  const limit = 5; // Limit the number of properties to return
  const skip = (page - 1) * limit; // Calculate the number of documents to skip
  try {
    const properties = await PROPERTY.find({ landlord: userId })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    // Count the total number of properties for the landlord //
    const total = await PROPERTY.countDocuments({ landlord: userId });

    const totalPages = Math.ceil(total / limit); // Calculate total pages based on the total count and limit

    const availableProperties = await PROPERTY.countDocuments({
      landlord: userId,
      availability: "available",
    });
    const rentedProperties = await PROPERTY.countDocuments({
      landlord: userId,
      availability: "rented",
    });
    res.status(200).json({
      total,
      availableProperties,
      rentedProperties,
      currentPage: parseInt(page),
      totalPages,
      properties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const UpdatePropertyAvailability = async (req, res) => {
  const { propertyId } = req.params;
  const { availability } = req.body; // Expecting availability to be either "available" or "rented"

  if (!availability) {
    return res.status(400).json({ message: "Provide Availability" });
  }
  try {
    const property = await PROPERTY.findById(propertyId);
    property.availability = availability; // Update the availability status
    await property.save(); // Save the updated property

    res.status(200).json({
      success: true,
      message: "Status Updated Successfully",
      property,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Firstly we start with This function that retrieves all properties from the database
const getAllProperties = async (req, res) => {
  try {
    const { page = 1, location, budget, type } = req.query; //location was not used in the original code, but you can implement filtering based on location if needed.
    const limit = 12;
    const skip = (page - 1) * limit;
    const filter = {
      availability: "available",
    };
    if (location) {
      filter.location = { $regex: location, $options: "i" }; // Case-insensitive search for location
    }
    if (budget) {
      filter.price = { $lte: parseInt(budget) }; // Filter properties with price less than or equal to budget
    }
    if (type) {
      filter.title = { $regex: type, $options: "i" }; // Case-insensitive search for property type
    }

    const properties = await PROPERTY.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const totalProperties = await PROPERTY.countDocuments(filter);
    const totalPages = Math.ceil(totalProperties / limit);

    res.status(200).json({
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
  const { propertyId } = req.params;
  try {
    const property = await PROPERTY.findById(propertyId).populate(
      "landlord",
      "fullName profilePicture email phoneNumber"
    );

    // displaying more  property from landlord
    const moreFromProperties = await PROPERTY.find({
      landlord: property.landlord._id,
      _id: { $ne: propertyId }, // Exclude the current property
      availability: "available", // Ensure the properties are available
    })
      .limit(3) // Limit to 3 more properties\
      .sort("-createdAt");

    //similarly we can also display more properties from the same price range
    //boston texas - geo-location
    // 1000 - 800 - 1200

    const priceRange = property.price * 0.2;
    const similarPriceProperties = await PROPERTY.find({
      _id: { $ne: propertyId },
      availability: "available",
      price: {
        $gte: property.price - priceRange,
        $lte: property.price + priceRange,
      },
      location: property.location, // Assuming location is a field in the property schema
    })
      .limit(3) // Limit to 3 similar price properties
      .sort("-createdAt");

    res
      .status(200)
      .json({ property, moreFromProperties, similarPriceProperties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProperty,
  getLandlordProperties,
  UpdatePropertyAvailability,
  getAllProperties,
  getAProperty,
};
