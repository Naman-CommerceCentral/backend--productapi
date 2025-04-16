import fetch from "node-fetch";
import { main } from "./server/Dynamo DB/product.js"; //this is the file where we are going to add the data to the database
import { isProductInDb } from "./server/router/index.js"; //this is the file where we are going to get the data from the database
//to make this whole code works we have to keep the app1.js file running in the background
async function testBackend() {
  console.log("Testing backend server and barcode API endpoint...");//this is the statement to check the server works fine or not

  try {
    const serverUrl = "http://localhost:5000"; //this is the port number of the server

    //here we are going to test the sample barcode
    const testBarcode = "731509839630"; // Example barcode (Where the Crawdads Sing book)
    console.log(
      `Testing POST request to ${serverUrl}/api/search with barcode: ${testBarcode}`//this is the barcode we are going to test
    );

    const product = await isProductInDb(testBarcode);//this is the function which is going to check whether the barcode is present in the database or not
    if (product) {
      console.log("----------------------");
      console.log(`Barcode: ${product.UPC}`);
      console.log(`Price: ${product.price}`);
      console.log(`Title: ${product.title}`);
      console.log(`Description: ${product.description}`);
      console.log(`Image URL: ${product.imageUrl}`);
      console.log("-----------------------");
    } else {
      const apiResponse = await fetch(`https://y8w4u7x6qc.execute-api.ap-south-1.amazonaws.com/test3`, {//this is the api endpoint we are going to test
        method: "POST",//we are giving some data in order fetch some from the api
        headers: {
          "Content-Type": "application/json",//this is the content alreay been part of the api
        },
        body: JSON.stringify({ barcode: testBarcode }),//we are going to
      });

      if (!apiResponse.ok) {//error handling
        console.error(
          `API endpoint test FAILED with status: ${apiResponse.status}`
        );
        const errorText = await apiResponse.text();
        console.error(`Error response: ${errorText}`);
        return;
      }

      const result = await apiResponse.json();
      console.log("API endpoint test: SUCCESS");
      console.log("Response data:", JSON.stringify(result, null, 2));

      main(result);
    }

  } catch (error) {
    console.error("Test failed with error:", error.message);
    console.log("\nTROUBLESHOOTING TIPS:");
    console.log("1. Make sure your server is running (node app1.js)");
    console.log(
      "2. Check if the port matches your server configuration (currently set to 5000)"
    );
    console.log("3. Verify your API key is still valid");
    console.log("4. Check your network connection");
    console.log(
      "5. Make sure your router is properly connected in your Express app"
    );
  }
}

testBackend();
