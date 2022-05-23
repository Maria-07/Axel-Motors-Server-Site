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
    const orderCollection = client.db("axel-motors").collection("orders");

    // Tools details
    app.get("/tools", async (req, res) => {
      const query = {};
      const tools = await toolsCollection.find(query).toArray();
      res.send(tools);
    });

    // find a single tool details
    app.get("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const tool = await toolsCollection.findOne(query);
      res.send(tool);
    });

    // post new data in order collection
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      console.log(orders);
      const id = orders.tools_id;
      const insertResult = await orderCollection.insertOne(orders);
      const query = { _id: ObjectId(id) };
      const tool = await toolsCollection.findOne(query);
      const leftQuantity = tool.availableQuantity - orders.quantity;
      const updateQuantity = {
        $set: {
          availableQuantity: leftQuantity,
        },
      };
      const updateResult = await toolsCollection.updateOne(
        query,
        updateQuantity
      );
      const result = { insertResult, updateResult };
      res.send(result);
    });

    // get data for specific email user
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      // const toolId = req.query.id;
      const query = { email: email };
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    // delete order
    app.delete("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const deleteOrder = await orderCollection.deleteOne(filter);
      res.send(deleteOrder);
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
