const express = require("express");
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rnw2g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('tourism');
        const vacationPackageCollection = database.collection('vacationPackages');
        const contactDetailsCollection = database.collection('contactUs');
        const orderDetailsCollection = database.collection('placeOrder');

        // GET/FIND API or GET Products API
        app.get('/vacationPackages', async (req, res) => {
            const cursor = vacationPackageCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });


        // GET/FIND API for all Orders
        app.get('/allOrders', async (req, res) => {
            const cursor = orderDetailsCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });


        // POST Contact Us
        app.post('/contactUs', async (req, res) => {
            const contactDetails = req.body;
            console.log('hit the post api', contactDetails)
            const result = await contactDetailsCollection.insertOne(contactDetails);
            // console.log(result);
            res.json(result);
        })

        // POST new package (Add new Pcakage)
        app.post('/addNewPackage', async (req, res) => {
            const packageDetails = req.body;
            console.log('hit the post api', packageDetails)
            const result = await vacationPackageCollection.insertOne(packageDetails);
            // console.log(result);
            res.json(result);
        })

        // POST Order (Place an order)
        app.post('/placeOrder', async (req, res) => {
            const orderDetails = req.body;
            orderDetails.orderStatus = "pending" 
            console.log('hit the post api', orderDetails)
            const result = await orderDetailsCollection.insertOne(orderDetails);
            console.log(result)
            res.json(result)
        })

        // GET Single Item
        app.get('/vacationPackage/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id)
            const query = { _id: ObjectId(id) };
            const package = await vacationPackageCollection.findOne(query);
            res.json(package);
        })


        // use POST to get data by email for myOrders section
        app.post('/myOrders', async (req, res) => {
            console.log(req.body.email);
            const email = req.body.email;
            // this query will find the items those have the same key as in the array "keys" above
            const query = { email: email };
            console.log(query)
            const orders = await orderDetailsCollection.find(query).toArray();
            console.log(orders)
            res.json(orders);
        })


        // UPDATE API
        app.put('/updateStatus/:id', async(req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            console.log(status);
            // in some doc query is written as filter
            const query = { _id: ObjectId(id) };
            // upsert: true means if the updated field doesn't exit it will insert a new one
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    orderStatus: status
                }
            }
            // const update = { orderStatus: status };
            const result = await orderDetailsCollection.updateOne(query, updateDoc, options)
            // console.log('load user with id: ', id);
            res.json(result);
        })


        // DELETE API from MyOrders
        app.delete('/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderDetailsCollection.deleteOne(query);
            res.json(result);
        })
        // DELETE API from AllOrders
        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderDetailsCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running my Tourism Server')
})

app.listen(port, ()=>{
    console.log('Running server on port', port)
})