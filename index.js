require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const PORT = process.env.PORT || 3000;
const userRouter = require("./routes/userRouter");
const propertyRouter = require("./routes/propertyRouter");

//middleware
app.use(express.json());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  })
);

//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//route
app.get("/", (req, res) => {
  res.status(200).json({ success: True, message: "Torii Gate Server" });
});

app.use("/api/auth", userRouter);
app.use("/api/property", propertyRouter);

//error route
app.use((req, res) => {
  res.status(400).json({ success: false, message: "ROUTE NOT FOUND" });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "toriigate" });
    app.listen(PORT, () => {
      console.log(`App running on port : ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();
