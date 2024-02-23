const express = require('express');
const { Client } = require('pg');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
// const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({extended: true}));

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/saa_2',
  // ssl: process.env.DATABASE_URL ? true : false
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

app.use(express.static('public'));

app.get('/', (req, res) => {
  var submissions;
  client.query("SELECT * FROM submissions", (err, result) => {
    if (err) throw err;
    submissions = result.rows;
    // console.log(submissions);
    res.render('layout', { data: submissions, success: true });
    // client.end();
  });
  // res.render('layout');
});

app.post('/', (req, res) => {

  if (req.body.statement != '' && req.body.statement != 'Why do you use or support birth control? (200 character max.)') {
    let latlng = req.body.latlng;
    console.log(latlng);
    latlng = latlng.replace('(', '').replace(')', '').split(', ');
    let lat = latlng[0];
    let lng = latlng[1];

    if (lng != null) {
      client.query('INSERT INTO submissions(statement,zipcode,latlng,lat, lng) VALUES($1, $2, $3, $4, $5)', [req.body.statement, req.body.zipcode, latlng, lat, lng]);
    } else {
      console.log("spam submission");
    }

    // console.log('done');
    var submissions;
    client.query("SELECT * FROM submissions", (err, result) => {
      if (err) throw err;
      submissions = result.rows;
      // console.log(submissions);
    res.render('layout', { data: submissions, success: true });
      // client.end();
    });

    // res.render('layout');
  } else {
    var submissions;
    client.query("SELECT * FROM submissions", (err, result) => {
      if (err) throw err;
      submissions = result.rows;
      res.render('layout', { data: submissions, success: false });
    });
  }

});

app.get('/about', (req, res) => {
  res.render('about');
});

http.listen(process.env.PORT || 8000, () => {
  console.log("App listening on port!")
});
