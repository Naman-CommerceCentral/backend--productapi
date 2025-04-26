import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import serverless from "serverless-http";
const router = express.Router();
import path from "path";
// import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import apiRoutes from "./server/router/index.js";
// import router from "./functions/index.js";


// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Define routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from server!" });
});


app.use("/api", apiRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.use("/.netlify/functions/index", router);
module.exports.handler = serverless(app);

// Data storage endpoint
// app.post("/api/save", (req, res) => {
//   const dataFolder = path.join(__dirname, ".data");

//   // Create data directory if it doesn't exist
//   if (!fs.existsSync(dataFolder)) {
//     fs.mkdirSync(dataFolder);
//   }

//   const filePath = path.join(dataFolder, "foo.json");

//   // Save data to file
//   fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));

//   res.json({ status: "success" });
// });

// // Start the server


// import express from "express";
// import bodyParser from "body-parser";
// import apiRoutes from "./server/router/backup_index.js"; // Adjust path as needed
// const app = express();

// import cors from "cors";
// const PORT = process.env.PORT || 5000;
// app.use(express.json());

// // app.get("/", (req, res) => {
// //   res.send("Welcome to the SKU List API!");
// // });
// app.use(cors({ origin: "*" })); // Enable CORS for all routes

// // Middleware
// app.use(bodyParser.json());

// app.use(bodyParser.urlencoded({ extended: true }));

// // API Routes
// app.use("/api", apiRoutes);

// // Serve static files in production
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));

//   //   import path from "path";
//   app.get("/", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
//   });
// }

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
