import express from "express";
import fetch from "node-fetch";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
//this is the file where we are going to add the data to the database

dotenv.config({
  path: "/home/naman/workspace/pre_product/sku_list/backend/.env",
});
const TOKEN_TABLE = "Product-Details"
// import { TOKEN_TABLE } from "."; //this is the table name of the database

if (//do we actually need this I dont know ya I think 
  //hey I think we need it the client we create below will using these credentials and using which our aws will understand which table I am talking about 
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_REGION ||
  !process.env.AWS_SESSION_TOKEN
) {
  console.error("Missing AWS credentials in environment variables.");
  process.exit(1); // Exit the process if credentials are missing
}


const client = new DynamoDBClient({//creating a client 
  //these below are the credentials which are neccessary in telling where and in which datbase we want store our data
  region: process.env.AWS_REGION,
  // credentials: fromIni({ profile: "NamanDev" }), // uses [production] section

  credentials: {//these are the credentials we get from the aws console
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  }
});
const docClient = DynamoDBDocumentClient.from(client);

const isProductInDb = async function (barcode) {
  try {
    const params = {
      TableName: TOKEN_TABLE,//this we get from the .env file 
      Key: {
        UPC: barcode
      }
    };
    const response = await docClient.send(new GetCommand(params));

    if (response.Item) {//this is the response that we get after we search the dynamo db 
      console.log("Product found in the database ");
      console.log("----------------------")
      console.log(`UPC: ${response.Item.UPC}`)
      console.log(`Price: ${response.Item.price}`)
      console.log(`title: ${response.Item.title}`)
      console.log(`Desciption: ${response.Item.description}`)
      console.log(`ImageURL: ${response.Item.imageUrl}`)
      console.log("-----------------------")//this all thing gonna be print 
      return;
    }
    else {
      console.log("Product not found in the database")
      return null;
    }
  }
  catch (error) {
    console.error("Error fetching product data from DynamoDB:", error);
    return null;
  }
}





const main = async (product) => {
  //the below is to test whether the data is going the dummy thing data I am passing later going to use the api fetch function
  const command = new PutCommand({
    TableName: "Product-Details", //this is the table name of the database
    Item: {
      // id: "1234", //this is the id of the product
      UPC: product.upc, //this is the barcode of the product
      title: product.title, //this is the title of the product
      price: product.price, //this is the price of the product
      description: product.description || "", //this is the description of the product
      imageUrl: product.image || "", //this is the image url of the product
    },
  });
  try {
    const response = await docClient.send(command);
    console.log("item added successfully", response); //this is the success message
    return response;
  } catch (err) {
    console.error("error adding item", err); //this is the error message
    return err;
  }
};








const router = express.Router();

router.post("/search", async (req, res) => {//this is the api endpoint when the user click on the search 

  try {//this is the tr and catch block to handle the error
    const { barcode } = req.body;//we store the barcode that we get from the body that is the input of the user

    if (!barcode || barcode.length < 12) {//if that was not the case we are going to send the error message
      return res.status(400).json({ error: "Barcode is required" });//this is the error message 
    }

    // console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
    // console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
    // console.log("AWS_REGION:", process.env.AWS_REGION);
    // console.log("AWS_SESSION_TOKEN", process.env.AWS_SESSION_TOKEN);







    const dbproduct = await isProductInDb(barcode);//this is the function we created to check whether the product is in the database or not
    if (dbproduct) {
      res.json(dbproduct);//if the product is in the database we are going to send the product to the frontend
      return;
    }

    const url = `https://barcodes1.p.rapidapi.com/?query=${barcode}`;//this is the api endpoints
    const options = {
      method: "GET",//this tell it is the fet request as we are going to get some data from by using the api
      headers: {
        "x-rapidapi-key": "02d3f614a5msh275b41ab3a8161dp1beb5ejsn15444ff70f96",//these were given on the api page 
        "x-rapidapi-host": "barcodes1.p.rapidapi.com",//these were given on the api page 
      },
    };

    const response = await fetch(url, options);//this is the fetch response we get using the above url and option bascially the get request

    if (!response.ok) {//if response is not ok the we are going to send the error message
      throw new Error(`API request failed with status ${response.status}`);//this is the error message we send to the frontend
    }

    const result = await response.json();//we store the result that we fetch in json format

    // Extract only the information we need
    const productInfo = {
      upc: result.product?.barcode_formats?.upc_a || "No UPC available",
      title: result.product?.title || "No title available", //thses . after the product is to go to required property we need
      image: result.product?.images || "No image available",
      // description: result.product?.description || "No description available",
      price: result.product?.online_stores?.[0]?.price || "Price not available",
    };
    main(productInfo);//this is the function we created to add the data to the database
    res.json(productInfo);//here we send the productInfo to the frontend
  } catch (error) {//this is the catch block to handle the error
    console.error("Error fetching product data:", error);
    res.status(500).json({ error: "Failed to fetch product data" });//this is the error message we send to the frontend
  }
});

export { isProductInDb };
export default router;
export { main }; 
