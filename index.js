const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fbddh.mongodb.net/axel-motors?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
console.log(uri);

async function run() {
  try {
    await client.connect();

    // database collections
    const toolsCollection = client.db("axel-motors").collection("tools");

    // Tools details
    app.get("/tools", async (req, res) => {
      const query = {};
      const tools = await toolsCollection.find(query).toArray();
      res.send(tools);
    });
  } finally {
  }
}

run().catch(console.dir);

// root
app.get("/", (req, res) => {
  res.send("Axel Motors Portal running");
});

app.listen(port, () => {
  console.log("Server is running : ", port);
});
