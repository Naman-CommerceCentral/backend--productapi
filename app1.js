import express from "express";
import bodyParser from "body-parser";
import apiRoutes from "./server/router/index.js"; // Adjust path as needed
const app = express();

import cors from "cors";
const PORT = process.env.PORT || 5000;
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Welcome to the SKU List API!");
// });
app.use(cors({ origin: "*" })); // Enable CORS for all routes

// Middleware
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use("/api", apiRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

//   import path from "path";
  app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
