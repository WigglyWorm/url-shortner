const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const shortUrl = require("./models/shortUrl");

app.use(bodyParser.json());
app.use(cors());
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/shortUrls');

app.use(express.static(__dirname +'/public'));

// create database entry
app.get('/new/:urlToShorten(*)', (req, res)=>{
    var urlToShorten  = req.params.urlToShorten;  // ES5
    // Regex for url
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-90:%_\+.~#?&//=]*)?/gi;
    var regex = expression;
    if(regex.test(urlToShorten) === true){
        var short = Math.floor(Math.random()* 100000).toString();
        var data = new shortUrl ({
            originalUrl: urlToShorten,
            shorterUrl: short
            
        });
        data.save(err=>{
            if(err){
                return res.send('Error')
            }
        });
        return res.json(data)
    }
    var data = new shortUrl ({
        originalUrl: urlToShorten,
        shorterUrl: "InvalidURL"
    });
    return res.json(data);
});

app.get('/:urlToForward', (req, res)=>{
    var shorterUrl = req.params.urlToForward;
    
    shortUrl.findOne({'shorterUrl': shorterUrl}, (err, data)=>{
       if(err)
       return res.send('Error reading database');
       var re = new RegExp("^(http|https)://", "i");
       var strToCheck = data.originalUrl;
       
       if(re.test(strToCheck)){
          res.redirect(301, data.originalUrl); 
       }
       else {
           res.redirect(301, 'https://' + data.originalUrl); 
       }
    });
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server connected!");
})
