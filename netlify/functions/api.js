import express from "express";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import cors from "cors";
import { fetchProductDetails } from "index.js";

const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route for searching a single product
router.post("/search", async (req, res) => {
    try {
        const { barcode } = req.body;

        if (!barcode || barcode.length < 12) {
            return res.status(400).json({ error: "Barcode is required and must be at least 12 characters" });
        }

        const productInfo = await fetchProductDetails(barcode);
        res.json(productInfo);
    } catch (error) {
        console.error("Error fetching product data:", error);
        res.status(500).json({ error: "Failed to fetch product data" });
    }
});

// Route for fetching multiple products
router.post('/fetch-products', async (req, res) => {
    try {
        let upcCodes = [];

        if (req.body) {
            upcCodes = req.body;
        }

        if (!upcCodes || upcCodes.length === 0) {
            return res.status(400).json({ error: `No UPC codes provided in request body or CSV file ${upcCodes} and ` });
        }

        // Implement your batch processing logic here
        // This should be adapted from your existing code

        res.status(200).json({
            message: "Function is set up correctly",
            receivedData: upcCodes
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: error.message });
    }
});

app.use("/.netlify/functions/api", router);
app.use("/api", router);

// Export the serverless function
export const handler = serverless(app);