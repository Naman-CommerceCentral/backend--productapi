import dotenv from "dotenv"; //import dotenv to load environment variables
import { PutCommand, DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; //this is the client which is used to connect to the database
// import { fromIni } from "@aws-sdk/credential-providers";

// Explicitly load the .env file with the correct path
dotenv.config({
  path: "/home/naman/workspace/pre_product/sku_list/backend/.env",
});

// Log environment variables for debugging
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("AWS_SESSION_TOKEN", process.env.AWS_SESSION_TOKEN);

// Validate environment variables
if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_REGION ||
  !process.env.AWS_SESSION_TOKEN
) {
  console.error("Missing AWS credentials in environment variables.");
  process.exit(1); // Exit the process if credentials are missing
}

const client = new DynamoDBClient({
  //these below are the credentials which are neccessary in telling where and in which datbase we want store our data
  region: process.env.AWS_REGION,
  // credentials: fromIni({ profile: "NamanDev" }), // uses [production] section

  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

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

// main();
export { main }; 
