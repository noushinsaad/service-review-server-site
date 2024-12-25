const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json());
app.use(cookieParser());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gmmth.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const servicesCollection = client.db('servicesPortal').collection('services');
        const reviewsCollection = client.db('servicesPortal').collection('reviews')

        // Service related APIs
        app.get('/services', async (req, res) => {
            const email = req.query.email;
            const featured = req.query.featured;

            let query = {}
            if (email) {
                query = { userEmail: email }
            }
            const cursor = featured
                ? servicesCollection.find(query).limit(6)
                : servicesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })

        app.post('/services', async (req, res) => {
            const newService = req.body;
            const result = await servicesCollection.insertOne(newService);
            res.send(result)
        })

        app.put('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedService = req.body;

            const service = {
                $set: {
                    image: updatedService.image,
                    companyName: updatedService.companyName,
                    website: updatedService.website,
                    description: updatedService.description,
                    price: updatedService.price,
                }
            }

            const result = await servicesCollection.updateOne(query, service, options);
            res.send(result);
        })

        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.send(result)
        })

        // review related APIs
        app.get('/reviews', async (req, res) => {
            const id = req.query.id
            const email = req.query.email;
            let query = {}
            if (id) {
                query = { serviceId: id }
            }
            if (email) {
                query = { userEmail: email }
            }

            const result = await reviewsCollection.find(query).toArray();
            res.send(result);
        });

        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            res.send(result);
        })

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedReview = req.body;

            const service = {
                $set: {
                    text: updatedReview.text,
                    rating: updatedReview.rating
                }
            }

            const result = await reviewsCollection.updateOne(query, service, options);
            res.send(result);
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result)
        })

        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Service is falling from the sky')
})

app.listen(port, () => {
    console.log(`Service is waiting at: ${port}`)
})