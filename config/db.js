const mongoose = require("mongoose");

exports.connectDB1 = async () => {
  await mongoose.connect(process.env.DB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log("DB connected");
};
