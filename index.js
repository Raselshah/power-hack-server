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
const userCollection = client.db("all-user").collection("users");

function verifyJWT(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "UnAuthorized" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    await client.connect();

    app.get("/billing-list", async (req, res) => {
      console.log(req.query);
      const page = parseInt(req.query.page);
      const count = parseInt(req.query.count);
      console.log(count);
      const query = {};
      const bill = await bilCollection.find(query);

      let result;
      if (page) {
        result = await bill
          .skip(page * count)
          .limit(count)
          .toArray();
      } else {
        result = await bill.limit(count).toArray();
      }

      res.send(result);
    });

    app.post("/add-billing", async (req, res) => {
      const bill = req.body;
      const result = await bilCollection.insertOne(bill);
      res.send(result);
    });

    app.post("/register", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/login/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email: email });
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

    app.get("/bill", async (req, res) => {
      const bills = await bilCollection.estimatedDocumentCount();
      res.send({ bills });
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
