/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

//HTTP
const https = require('https');
let options = {
  host: 'https://financialmodelingprep.com',
  path: '/api/v3/stock/real-time-price/'/*,
  headers: {
    'Content-Type': 'application/json'
  }*/
};

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      let stock = req.query.stock;
      let stocker = '';
      if (Array.isArray(stock)) {
        let delim = '';
        req.query.stock.forEach(element => {
          stocker += delim + element;
          delim = ',';
        });
      } else {
        stocker = stock;
      }
      console.log(req.ip);
      //https://financialmodelingprep.com/api/v3/stock/real-time-price/AAPL
      console.log(stock);
      let like = req.query.like;
      console.log(like);
      let output = '';
      //console.log(process.env.STOCKAPI);
      let request = https.get(process.env.STOCKAPI + stocker, function (result) {
        //console.log(result);
        result.setEncoding('utf8');
        result.on('data', (chunk) => {
          output += chunk;
          console.log(chunk);
        });
        
        res.on('end', () => {
          let obj = JSON.parse(output);
          console.log(obj);
        });
      });
      console.log(output);
      res.json({'stock': stock, 'price': 0, 'likes': like});
    });
    
};
