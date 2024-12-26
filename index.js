const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://service-review-7e78b.web.app'],
    credentials: true
}))
app.use(express.json());
app.use(cookieParser());

function verifyToken(req, res, next) {
    const token = req?.cookies?.token;
    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            req.user = null;
        } else {
            req.user = decoded;
        }
        next();
    });
}





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
        const reviewsCollection = client.db('servicesPortal').collection('reviews');
        const usersCollection = client.db('servicesPortal').collection('users')

        // users related APIs
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const { email, name, createdAt } = req.body;
            const existingUser = await usersCollection.findOne({ email });

            if (existingUser) {
                return res.status(200).send({ message: "User already exists" });
            }

            const newUser = { email, name, createdAt };

            const result = await usersCollection.insertOne(newUser);
            res.send(result)
        })

        // auth related APIs
        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '5h'
            })
            res
                .cookie('token', token, {
                    httpOnly: true,
                    // secure: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                })
                .send({ success: true })
        })

        app.post('/logout', (req, res) => {
            res
                .clearCookie('token', {
                    httpOnly: true,
                    // secure: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                })
                .send({ success: true })
        })


        // Service related APIs
        app.get('/services', verifyToken, async (req, res) => {
            const email = req.query.email;
            const featured = req.query.featured;
            let query = {}
            if (email) {
                query = { userEmail: email }

                if (!req.user || req.user.email !== email) {
                    return res.status(403).send({ message: "Forbidden Access" });
                }
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
        app.get('/reviews', verifyToken, async (req, res) => {
            const id = req.query.id
            const email = req.query.email;
            let query = {}
            if (id) {
                query = { serviceId: id }
            }

            if (email) {
                query = { userEmail: email }

                if (!req.user || req.user.email !== email) {
                    return res.status(403).send({ message: "Forbidden Access" });
                }
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

        // counting users,services and reviews related APIs
        app.get('/counts', async (req, res) => {
            const userCount = await usersCollection.estimatedDocumentCount();
            const reviewsCount = await reviewsCollection.estimatedDocumentCount();
            const servicesCount = await servicesCollection.estimatedDocumentCount();

            res.send({ userCount, reviewsCount, servicesCount });
        })

        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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