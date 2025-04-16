import fetch from "node-fetch";
import cors from "cors";



export const handler = async (event, context) => {//ths is for getting the input the event basically
    try {
        const barcode = event.queryStringParameters?.barcode;//to check whther it is defined or not
        console.log("barcode extracted ", barcode);
        if (!barcode) {//if not defined basically error handling
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({ error: "barcode is required" })
            };
        }
        //if everything works fine then we put the input in to the link and fetch the details
        const url = `https://barcodes1.p.rapidapi.com/?query=${barcode}`;
        const options = {//this si for the request method
            method: "GET",
            headers: {//this is the header for the api key and the host 
                "x-rapidapi-key": "02d3f614a5msh275b41ab3a8161dp1beb5ejsn15444ff70f96",
                "x-rapidapi-host": "barcodes1.p.rapidapi.com"
            }
        };

        const response = await fetch(url, options);//here we are fetching the data 
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();//we store the data in result in json format
        console.log("product data structure")
        console.log("API response:", JSON.stringify(result));
        const productInfo = {//now storing the each property in the productInfo object
            UPC: result.product?.barcode_formats?.upc_a || "No UPC available",
            description: result.product?.description || "No description available",
            title: result.product?.title || "No title available",
            image: Object.values(result.product?.images || {})[0] || "No image available",
            price: result.product?.online_stores?.[0]?.price || "Price not available"
        };

        return {//this is the message we are going to send to the frontend
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(productInfo)
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ error: "Internal server error" })
        };
    }
}