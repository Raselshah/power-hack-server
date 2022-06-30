const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zugdw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const bilCollection = client.db("all-bill").collection("bill");

async function run() {
  try {
    await client.connect();

    app.get("/billing-list", async (req, res) => {
      const query = {};
      const result = await bilCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/add-billing", async (req, res) => {
      const bill = req.body;
      const result = await bilCollection.insertOne(bill);
      res.send(result);
    });

    app.put("/update-billing/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateBill = req.body;
      const updateDoc = {
        $set: updateBill,
      };
      const result = await bilCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/delete-billing/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await bilCollection.deleteOne(filter);
      res.send(result);
    });
  } finally {
    //
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("power hack connect db");
});

app.listen(port, () => {
  console.log("listen db to", port);
});
