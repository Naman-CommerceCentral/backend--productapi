import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import errorHandler from "errorhandler";

// Optional: Import routes if you have any
import apiRoutes from "./server/router/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Fix for __dirname in ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler({ dumpExceptions: true, showStack: true }))

// Example API route (replace or expand as needed)
// app.get("/api/hello", (req, res) => {
//   res.json({ message: "Hello from server!" });
// });

// Uncomment when you have route files
// app.use("/api", apiRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}




app.post("/api/save", (req, res) => {
  const dataFolder = path.join(__dirname, ".data");
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder); // create .data folder if it doesn't exist
  }

  const filePath = path.join(dataFolder, "foo.json");

  fs.writeFileSync(filePath, JSON.stringify({ message: "Hello from /api/save!" }, null, 2));

  res.json({ status: "success", path: filePath });
});




// Handle unexpected errors
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


