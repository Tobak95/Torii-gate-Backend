const router = require("express").Router();
const {
  createProperty,
  getLandlordProperties,
  UpdatePropertyAvailability,
  getAllProperties,
  getAProperty,
  deleteProperty,
} = require("../controllers/propertyController");

// firstly, after  importing the data form controller, we need to imported from the auth middleware

const { isLoggedIn, requirePermission } = require("../middleware/auth");

router.post("/", isLoggedIn, requirePermission("landlord"), createProperty);
router.get(
  "/landlord",
  isLoggedIn,
  requirePermission("landlord"),
  getLandlordProperties
);

router.patch(
  "/landlord/:propertyId",
  isLoggedIn,
  requirePermission("landlord"),
  UpdatePropertyAvailability
);
router.delete(
  "/landlord/:propertyId",
  isLoggedIn,
  requirePermission("landlord"),
  deleteProperty
);

router.get("/", isLoggedIn, getAllProperties);
router.get("/:propertyId", isLoggedIn, getAProperty);

module.exports = router;
