require('dotenv').config();
const express = require ('express')
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');

const app = express();

mongoose.connect(process.env.MONGO_URL, 
    {useNewUrlParser: true, useUnifiedTopology: true}, ()=>{
        console.log("DB is connected");
    })

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));

app.use(express.static(__dirname + '/public'));

app.get("/",async (req,res)=>{
    const shortUrls = await ShortUrl.find()
    res.render('index', { shortUrls: shortUrls })
})

app.post("/shortURLs", async (req,res)=>{
    await ShortUrl.create({full: req.body.fullURL});
    res.redirect("/");
})

app.get("/:shortURL", async(req,res)=>{
   const short = await ShortUrl.findOne({short: req.params.shortURL})
   if(short == null) return res.sendStatus(404);

   short.clicks++
   short.save();

   res.redirect(short.full)
})

app.listen(process.env.PORT || 5000, ()=>{
    console.log("server is running");
})