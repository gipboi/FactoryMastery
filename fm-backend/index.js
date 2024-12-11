import express from "express";
import cors from "cors";
import { PORT } from "./config/index.js";
import { routes } from "./routes/index.js";
import { connect } from "./config/database.js";
import { auditTrailLog } from "./middlewares/audit-trail-log.middleware.js";
import { filterExceptionMiddleware } from "./middlewares/filter-exception.middleware.js";
import { v2 as cloudinary } from "cloudinary";

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Routes setup
app.use(auditTrailLog);
app.use(routes);

// // Handle exceptions
app.use(filterExceptionMiddleware);

const port = PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

connect();
cloudinary.config({
  secure: true,
});

export default app;
