const express = require("express");
const cors = require("cors");
const { connectDB1 } = require("./config/db");
require("dotenv").config();
const path = require("path");

const { unlink } = require("fs").promises;

//db connection
connectDB1();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use(express.static(path.join(__dirname, "upload")));

//routers
app.use("/user", require("./router/auth"));

//start server
const PORT = process.env.PORT || 9000;

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
