require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');

const app = express();

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log("DB is connected");
})

app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: false
}));

app.use(express.static(__dirname + '/public'));

app.get("/", async (req, res) => {
    try {
        const shortUrls = await ShortUrl.find();
        shortUrls.reverse();
        res.render('index', {
            shortUrls: shortUrls
        });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post("/shortURLs", async (req, res) => {
    try {
      let shortUrl;
      const fullURL = req.body.fullURL.trim();
      if (req.body.customName) {
        const existingShortUrl = await ShortUrl.findOne({ short: req.body.customName });
        if (existingShortUrl) {
          return res.render("custom-name-exists", { customName: req.body.customName });
        }
        shortUrl = await ShortUrl.create({ full: fullURL, short: req.body.customName });
      } else {
        shortUrl = await ShortUrl.create({ full: fullURL });
      }
      res.redirect("/");
      return;
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });  

app.get("/:shortURL", async (req, res) => {
    try {
        const short = await ShortUrl.findOne({
            short: req.params.shortURL
        })
        if (short == null) return res.sendStatus(404);
        short.clicks++;
        await short.save();
        res.redirect(short.full);
        return;
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.listen(process.env.PORT || 5000, () => {
    console.log("server is running at 5000");
})