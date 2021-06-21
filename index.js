const express = require('express')
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const app = express()
app.use(cors())
app.use(bodyParser.json())

const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vjryr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const jobsCollection = client.db("motiondb").collection("jobs");
    const approvalCollection = client.db("motiondb").collection("approved");
    const adminCollection = client.db("motiondb").collection("admins");

    console.log('db conntected')

    // insert jobs
    app.post('/addJobs', (req, res) => {
        const jobs = req.body;
        jobsCollection.insertOne(jobs)
            .then(result => {
                console.log(result)
            })
    })

    app.post('/approval', (req, res) => {
        const apprv = req.body;
        approvalCollection.insertOne(apprv)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.delete('/delete/:id', (req, res) => {
        console.log(req.params.id)
        jobsCollection.deleteOne({ _id: ObjectID(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0)
            })
    })

    app.post('/addAdmin', (req, res) => {
        const admin = req.body;
        adminCollection.insertOne(admin)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    //read service
    app.get('/getJobs', (req, res) => {
        jobsCollection.find({})
            .toArray((err, jobs) => {
                res.send(jobs)
            })
    })

    app.get('/getApproval', (req, res) => {
        approvalCollection.find({})
            .toArray((err, jobs) => {
                res.send(jobs)
            })
    })

    app.post('/loginBaseEmail', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0)
            })
    })

    app.get('/getDetails/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        console.log(id)
        approvalCollection.find({ _id: id })
            .toArray((err, items) => {
                res.send(items)
                console.log(items);
            })
    })

});


app.listen(port)