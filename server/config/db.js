// Rewrite/server/config/db.js
import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  try {
    // DeprecationWarning: Mongoose: the `strictQuery` option will be switched back to `false` by default in Mongoose 7.
    // mongoose.set('strictQuery', true); // Or false, depending on desired behavior. True is safer.
    // As of Mongoose 6, useNewUrlParser, useUnifiedTopology, useCreateIndex, and useFindAndModify are no longer needed.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.red.underline.bold);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;