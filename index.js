import express from "express";
import serverless from "serverless-http";
import fetch from "node-fetch";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import multer from "multer";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import csv from "csv-parser";
// require('aws-sdk/lib/maintenance_mode_message').suppress = true;
import dotenv from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";


//this is the file where we are going to add the data to the database
dotenv.config({
  path: "/home/naman/workspace/pre_product/sku_list/backend/.env",
});
const TOKEN_TABLE = "UPC-Tables"
console.log(TOKEN_TABLE);
// import { TOKEN_TABLE } from "."; //this is the table name of the database
//these are for the credentials we get from the aws console
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





//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------






const main = async (product) => {
  //the below is to test whether the data is going the dummy thing data I am passing later going to use the api fetch function
  const command = new PutCommand({
    TableName: "UPC-Tables", //this is the table name of the database
    Item: {
      // id: "1234", //this is the id of the product
      UPC: product.upc, //this is the barcode of the product
      title: product.title, //this is the title of the product
      price: product.price, //this is the price of the product
      StoreInfo : product.store_info,
      description: product.description || "", //this is the description of the product
      imageUrl: product.image || "", //this is the image url of the product
    },
  });
  // console.log("uppar wala chal raha hai");
  try {
    const response = await docClient.send(command);
    console.log("item added successfully"); //this is the success message
    return response;
  } catch (err) {
    console.error("error adding item", err); //this is the error message
    return err;
  }
};

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const isProductInDb = async function (barcode) {
  try {
    const params = {//these are the parameters for the table 
      TableName: TOKEN_TABLE,//this we get from the .env file 
      Key: {
        UPC: barcode//this is the partition key
      }
    };
    const response = await docClient.send(new GetCommand(params));

    if (response.Item) {//this is the response that we get after we search the dynamo db 
      console.log("Product found in the database ");
      console.log("----------------------")
      console.log(`UPC: ${response.Item.UPC}`)//this all data we get from the database which we earlier send
      console.log(`Price: ${response.Item.price}`)
      console.log(`title: ${response.Item.title}`)
      console.log(`Desciption: ${response.Item.description}`)
      console.log(`ImageURL: ${response.Item.imageUrl}`)
      console.log("-----------------------")//this all thing gonna be print 
      return response.Item;
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





//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//fetching the data from the api using the barcode and returning the data in the required format



async function fetchProductFromApi(barcode) {
  const url = `https://barcodes1.p.rapidapi.com/?query=${barcode}`;//we are fetching the product using the barcode we get from the user
  const options = {
    method: "GET",//this is the get method 
    headers: {
      "x-rapidapi-key": "2a75e563dfmshdc0bd203536bb20p1a40c6jsn8ee56b7e7418",
      "x-rapidapi-host": "barcodes1.p.rapidapi.com",
    },
  };


  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API responded with status: ${response.status}`);
  }

  const result = await response.json();
  const stores = Object.values(result.product?.online_stores);
  const store_info = stores.map(store => `${store.name} - ${store.price} `);
  return {
    upc: result.product?.barcode_formats?.upc_a || barcode,
    store_info,
    title: result.product?.title || "No title available",
    image: result.product?.images[0] || "No image available",
    description: result.product?.description || "",
    price: result.product?.online_stores?.[0]?.price || "Price not available",
  };
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


async function fetchProductDetails(barcode) {
  try {
    // First check if product exists in database
    const dbProduct = await isProductInDb(barcode);
    if (dbProduct) {
      return dbProduct;
    }
    else{
      const apiProduct = await fetchProductFromApi(barcode);

      // Save to DB for future reference
      await main(apiProduct);
      // console.log("testing phase ")
      // console.log(apiProduct);
      return apiProduct;
    }
  } catch (error) {
    console.error(`Error fetching details for barcode ${barcode}:`, error.message);
    return {
      upc: barcode,
      title: "Failed to fetch product details",
      image: "No image available",
      price: "Price not available",
      description: "",
      error: error.message
    };
  }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




// Configure multer for temporary storage
// const storage = multer.memoryStorage();

// // File filter to only accept CSV files
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only CSV files are allowed!'), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });




//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




// async function parseCSVContent(buffer) {//this is for the parsing od the data 
//   return new Promise((resolve, reject) => {//her we create a promise 
//     const results = [];//this is the array where we are going to store the data
//     const stream = require('stream');//stream is the module that we are using to parse the csv file
//     const bufferStream = new stream.PassThrough();//this is the stream that we are going to use to parse the csv file
//     bufferStream.end(buffer);

//     bufferStream
//       .pipe(csv())//this is the csv parser that we are using to parse the csv file
//       .on('data', (data) => {
//         // Assuming the CSV has a column named 'upc' or 'barcode'
//         const upc = data.upc || data.barcode || data.UPC || data.BARCODE || data.ItemUPC || Object.values(data)[0];
//         if (upc) {
//           results.push(upc);
//         }
//       })
//       .on('end', () => {
//         resolve(results);
//       })
//       .on('error', (error) => {
//         reject(error);
//       });
//   });
// }




//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



//this function created using the AI I will replace this with the AWS sqs later
async function rateLimitedBatchProcess(items, fetchProductDetails, batchSize = 5, delayMs = 3000) {//the batchsize would be 5 like 5 api call per second
  const results = [];
  console.log(items);
  const barcodes = Object.keys(items)[0];
  console.log(barcodes);
  const batch = items?.[barcodes]?.slice(0, 5);
  console.log(batch);
  // Process items in batches
  for (let i = 0; i < items.barcodes.length; i += batchSize) {//this is about the total number of batches we have to process
    const batch = items.barcodes.slice(i, i + batchSize);//this will help in selecting the particular range of product so that later we can fetch their details 
    console.log(`Processing batch ${i / batchSize + 1}, size: ${batch.length}`);
    //for the above lets say we have 30 items then i value would 30
    //And the suze till first will be 5 so the willl be from 0 to 5
    //in this way we are getting the details and if you divide the first i that is 0/5 then you get 0 that mean that would our last batch



    // Process current batch with Promise.all
    //here we map the items in the batch to the fetchProductDetails function which we created above
    const batchPromises = batch.map(item => fetchProductDetails(item));//this will run our function to find the details while adding the new one in the database
    const batchResults = await Promise.all(batchPromises);//this will halp us in calling all the requests in a single go

    // Store results
    results.push(...batchResults);
    // console.log(results); there are too many for checking purpose
    // If this isn't the last batch, wait before processing the next one
    if (i + batchSize < items.length) {//till the last value 
      console.log(`Waiting ${delayMs}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



// Create router
const router = express.Router();

// Route for searching a single product
router.post("/search", async (req, res) => {//this router is for the single product 
  try {
    const { barcode } = req.body;

    if (!barcode || barcode.length < 12) {
      return res.status(400).json({ error: "Barcode is required and must be at least 12 characters" });
    }

    const productInfo = await fetchProductDetails(barcode);//this is used to fetch the single product details 
    res.json(productInfo);//if we foung the data then we print in console 
  } catch (error) {
    console.error("Error fetching product data:", error);//else we get the error
    res.status(500).json({ error: "Failed to fetch product data" });
  }
});



//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Route for fetching multiple products
// router.post('/fetch-products', async (req, res) => {
//   try {
//     const { upcCodes } = req.body;

//     if (!upcCodes || !Array.isArray(upcCodes) || upcCodes.length === 0) {
//       return res.status(400).json({ error: 'No UPC codes provided' });
//     }

//     // Fetch product details for all UPCs in parallel
//     const productPromises = upcCodes.map(upc => fetchProductDetails(upc));
//     const results = await Promise.allSettled(productPromises);

//     // Extract results - no need for error handling here since fetchProductDetails
//     // already returns a properly formatted error object
//     const products = results.map(result =>
//       result.status === 'fulfilled' ? result.value : result.reason
//     );

//     res.status(200).json({ products });
//   } catch (error) {
//     console.error('Error fetching product data:', error);
//     res.status(500).json({ error: error.message });
//   }
// });


// Modify your existing /fetch-products endpoint to accept either JSON or CSV file
router.post('/fetch-products', async (req, res) => {
  try {
    let upcCodes = [];//an empty array to store the upc codes

    // If CSV file was uploaded
    // if (req.file) {
    //   // Parse the CSV file to extract UPC codes
    //   upcCodes = await parseCSVContent(req.file.buffer);//this will help in parsing the csv file and extracting the upc codes from it
    // }
    console.log(upcCodes);


  //   if (req.body && req.body.data) {
  //     console.log(req.body.data);
  // // If the data is in the expected format with UPC codes
  // // Assuming there's a 'upc' field in your CSV
  //     upcCodes = req.body.data.map(item => item.upc || item.UPC);
  // // Filter out any undefined or empty codes
  //     upcCodes = upcCodes.filter(code => code);
  //   }
    // If JSON data was provided
    if (req.body) {//this is for the json if the user is passing the upc codes in the json format
      upcCodes = req.body;//maybe we dont need this as we are already checking for the upc codes in the above line
    }


    console.log(upcCodes);
    console.log("hello");

    if (!upcCodes || upcCodes.length === 0) {
      return res.status(400).json({ error: `No UPC codes provided in request body or CSV file ${upcCodes} and ` });
    }

    // Fetch product details for all UPCs in parallel
    const apiCallsPerSecond = 5; // Limit to 5 API calls per second
    const results = await rateLimitedBatchProcess(
      upcCodes,
      fetchProductDetails,//thi is the function to fetch the details we have already created 
      apiCallsPerSecond,
      3000 // 3 second delay between batches
    );
    // Extract results
    const products = results.map(result =>
      result.status === 'fulfilled' ? result.value : result.reason //ternary operator to check whether the result is fulfilled or not
    );
    
    res.status(200).json({
      products: results,//this will give the result of the products
      totalProcessed: results.length,//length like total how many we have updated 
      batchSize: apiCallsPerSecond
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});






// export { getProductFromDb as isProductInDb };
// export { saveProductToDb as main };
// export { fetchProductDetails };
export default router;
export { fetchProductDetails, isProductInDb, fetchProductFromApi, main };




















//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------









// // Configure multer for temporary storage
// const storage = multer.memoryStorage(); // Use memory storage instead of disk

// // File filter to only accept CSV files
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {//this si t
//     cb(null, true);
//   } else {
//     cb(new Error('Only CSV files are allowed!'), false);
//   }
// };


// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
// });

// Function to parse CSV content and extract UPCs
// async function parseCSVContent(buffer) {
//   return new Promise((resolve, reject) => {
//     const results = [];
//     const stream = require('stream');
//     const bufferStream = new stream.PassThrough();
//     bufferStream.end(buffer);

//     bufferStream
//       .pipe(csv())
//       .on('data', (data) => {
//         // Assuming the CSV has a column named 'upc' or 'barcode'
//         const upc = data.upc || data.barcode || data.UPC || data.BARCODE || Object.values(data)[0];
//         if (upc) {
//           results.push(upc);
//         }
//       })
//       .on('end', () => {
//         resolve(results);
//       })
//       .on('error', (error) => {
//         reject(error);
//       });
//   });
// }






// async function fetchProductDetails(barcode) {
//   try {
//     // First check if product exists in database
//     const dbProduct = await isProductInDb(barcode);
//     if (dbProduct) {
//       return {
//         upc: dbProduct.UPC,
//         title: dbProduct.title,
//         price: dbProduct.price,
//         description: dbProduct.description,
//         image: dbProduct.imageUrl
//       };
//     }

//     // If not in DB, fetch from API
//     const url = `https://barcodes1.p.rapidapi.com/?query=${barcode}`;
//     const options = {
//       method: "GET",
//       headers: {
//         "x-rapidapi-key": "02d3f614a5msh275b41ab3a8161dp1beb5ejsn15444ff70f96",
//         "x-rapidapi-host": "barcodes1.p.rapidapi.com",
//       },
//     };

//     const response = await fetch(url, options);
//     if (!response.ok) {
//       throw new Error(`API responded with status: ${response.status}`);
//     }

//     const result = await response.json();

//     const productInfo = {
//       upc: result.product?.barcode_formats?.upc_a || barcode,
//       title: result.product?.title || "No title available",
//       image: result.product?.images || "No image available",
//       description: result.product?.description || "",
//       price: result.product?.online_stores?.[0]?.price || "Price not available",
//     };

//     // Save to DB for future reference
//     await saveProductToDb(productInfo);

//     return productInfo;
//   } catch (error) {
//     console.error(`Error fetching details for barcode ${barcode}:`, error.message);
//     return {
//       upc: barcode,
//       title: "Failed to fetch product details",
//       image: "No image available",
//       price: "Price not available",
//       error: error.message
//     };
//   }
// }



// router.post('/fetch-products', async (req, res) => {
//   try {
//     const { upcCodes } = req.body;

//     if (!upcCodes || !Array.isArray(upcCodes) || upcCodes.length === 0) {
//       return res.status(400).json({ error: 'No UPC codes provided' });
//     }

//     // Fetch product details for all UPCs in parallel
//     const productPromises = upcCodes.map(upc => fetchProductDetails(upc));
//     const results = await Promise.allSettled(productPromises);

//     // Extract successful results
//     const products = results.map((result, index) => {
//       if (result.status === 'fulfilled') {
//         return result.value;
//       } else {
//         return {
//           upc: upcCodes[index],
//           title: "Failed to fetch product details",
//           image: "No image available",
//           price: "Price not available",
//           error: result.reason.message
//         };
//       }
//     });

//     res.status(200).json({ products });

//   } catch (error) {
//     console.error('Error fetching product data:', error);
//     res.status(500).json({ error: error.message });
//   }
// });










// const client = new DynamoDBClient({//creating a client
//   //these below are the credentials which are neccessary in telling where and in which datbase we want store our data
//   region: process.env.AWS_REGION,
//   // credentials: fromIni({ profile: "NamanDev" }), // uses [production] section

//   credentials: {//these are the credentials we get from the aws console
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     sessionToken: process.env.AWS_SESSION_TOKEN,
//   }
// });
// const docClient = DynamoDBDocumentClient.from(client);

// const isProductInDb = async function (barcode) {
//   try {
//     const params = {
//       TableName: TOKEN_TABLE,//this we get from the .env file
//       Key: {
//         UPC: barcode
//       }
//     };
//     const response = await docClient.send(new GetCommand(params));

//     if (response.Item) {//this is the response that we get after we search the dynamo db
//       console.log("Product found in the database ");
//       console.log("----------------------")
//       console.log(`UPC: ${response.Item.UPC}`)
//       console.log(`Price: ${response.Item.price}`)
//       console.log(`title: ${response.Item.title}`)
//       console.log(`Desciption: ${response.Item.description}`)
//       console.log(`ImageURL: ${response.Item.imageUrl}`)
//       console.log("-----------------------")//this all thing gonna be print
//       return;
//     }
//     else {
//       console.log("Product not found in the database")
//       return null;
//     }
//   }
//   catch (error) {
//     console.error("Error fetching product data from DynamoDB:", error);
//     return null;
//   }
// }





// const main = async (product) => {
//   //the below is to test whether the data is going the dummy thing data I am passing later going to use the api fetch function
//   const command = new PutCommand({
//     TableName: "Product-Details", //this is the table name of the database
//     Item: {
//       // id: "1234", //this is the id of the product
//       UPC: product.upc, //this is the barcode of the product
//       title: product.title, //this is the title of the product
//       price: product.price, //this is the price of the product
//       description: product.description || "", //this is the description of the product
//       imageUrl: product.image || "", //this is the image url of the product
//     },
//   });
//   try {
//     const response = await docClient.send(command);
//     console.log("item added successfully", response); //this is the success message
//     return response;
//   } catch (err) {
//     console.error("error adding item", err); //this is the error message
//     return err;
//   }
// };








// const router = express.Router();

// router.post("/search", async (req, res) => {//this is the api endpoint when the user click on the search

//   try {//this is the tr and catch block to handle the error
//     const { barcode } = req.body;//we store the barcode that we get from the body that is the input of the user

//     if (!barcode || barcode.length < 12) {//if that was not the case we are going to send the error message
//       return res.status(400).json({ error: "Barcode is required" });//this is the error message
//     }

//     // console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
//     // console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
//     // console.log("AWS_REGION:", process.env.AWS_REGION);
//     // console.log("AWS_SESSION_TOKEN", process.env.AWS_SESSION_TOKEN);







//     const dbproduct = await isProductInDb(barcode);//this is the function we created to check whether the product is in the database or not
//     if (dbproduct) {
//       res.json(dbproduct);//if the product is in the database we are going to send the product to the frontend
//       return;
//     }

//     const url = `https://barcodes1.p.rapidapi.com/?query=${barcode}`;//this is the api endpoints
//     const options = {
//       method: "GET",//this tell it is the fet request as we are going to get some data from by using the api
//       headers: {
//         "x-rapidapi-key": "02d3f614a5msh275b41ab3a8161dp1beb5ejsn15444ff70f96",//these were given on the api page
//         "x-rapidapi-host": "barcodes1.p.rapidapi.com",//these were given on the api page
//       },
//     };

//     const response = await fetch(url, options);//this is the fetch response we get using the above url and option bascially the get request

//     if (!response.ok) {//if response is not ok the we are going to send the error message
//       throw new Error(`API request failed with status ${response.status}`);//this is the error message we send to the frontend
//     }

//     const result = await response.json();//we store the result that we fetch in json format

//     // Extract only the information we need
//     const productInfo = {
//       upc: result.product?.barcode_formats?.upc_a || "No UPC available",
//       title: result.product?.title || "No title available", //thses . after the product is to go to required property we need
//       image: result.product?.images || "No image available",
//       // description: result.product?.description || "No description available",
//       price: result.product?.online_stores?.[0]?.price || "Price not available",
//     };
//     main(productInfo);//this is the function we created to add the data to the database
//     res.json(productInfo);//here we send the productInfo to the frontend
//   } catch (error) {//this is the catch block to handle the error
//     console.error("Error fetching product data:", error);
//     res.status(500).json({ error: "Failed to fetch product data" });//this is the error message we send to the frontend
//   }
// });

// export { isProductInDb };
// export default router;
// export { main }; 
