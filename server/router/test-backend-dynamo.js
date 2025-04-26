// import express from "express";
// import fetch from "node-fetch";
// import AWS from "aws-sdk";
// import dotenv from "dotenv";
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

//       export const findProduct = async function(barcode){fo
//         try {
//         const params = {
//           TableName: TOKEN_TABLE,
//           Key:{
//             UPC: barcode
//           }
//         };

//         const response = await docClient.send(new GetCommand(params));

//         if(response.Item){
//           console.lof("Product found in the database ");
//           console.log("----------------------")
//           console.log(`Barcode: ${response.Item.UPC}`)
//           console.log(`Barcode: ${response.Item.price}`)
//           console.log(`Barcode: ${response.Item.title}`)
//           console.log(`Barcode: ${response.Item.description}`)
//           console.log(`Barcode: ${response.Item.imageUrl}`)
//           console.log("-----------------------")
//           return response.Item;
//         }
//         else {
//           console.log("Product not found in the database")
//           return null;
//         }
//       }
//       catch (error) {
//         console.error("Error fetching product data from DynamoDB:", error);
//         return null;
//       }
//     }

// export default {
//   findProduct
// };