import express from "express";
import cors from "cors";
import { routes } from "./routes/index.js";
import { connect } from "./config/database.js";
import { auditTrailLog } from "./middlewares/audit-trail-log.middleware.js";
import { filterExceptionMiddleware } from "./middlewares/filter-exception.middleware.js";
import { v2 as cloudinary } from "cloudinary";
require('dotenv').config();

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Routes setup
app.use(auditTrailLog);
app.use(routes);

// // Handle exceptions
app.use(filterExceptionMiddleware);

let PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

connect();
cloudinary.config({
  secure: true,
});

export default app;
