import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Get the MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

let client = null;
let db = null;

const connectDB = async () => {
  try {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    // Store the database connection for use in other parts of the app
    db = client.db("masters-applications");
    
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Function to get the database instance
const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

// Function to get the client instance
const getClient = () => {
  if (!client) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return client;
};

export { connectDB, getDB, getClient };
export default connectDB;
