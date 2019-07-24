/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var Mongoose = require('mongoose');

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

//Schema
var stockSchema = new Mongoose.Schema({
  ipAddr: { type: String, required: true},
  stockCode: { type: String, required: true },
  like: { type: Number, required: true }
});

var stockrecord = Mongoose.model('stockrecords', stockSchema);

module.exports = function (app) {
  Mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true, useFindAndModify: false }, function (err) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      console.log('db connected');
    }});

  app.route('/api/stock-prices')
    .get(function (req, res){
      let stockDataArr = [];
      if (Array.isArray(req.query.stock)) {
        req.query.stock.forEach(element => {
          stockDataArr.push({'stock': element});
        });
      } else {
        stockDataArr.push({'stock': req.query.stock});
      }

      //Get the number of stocks in the array and keep count
      var cnt = stockDataArr.length;
      console.log(cnt);
      var i = 0;

      stockDataArr.forEach(element => {
        i++;
        //if like then check if the stock and IP exist in the collection
        if (req.query.like) {
          stockrecord.find({'stockCode': element.stock, 'ip': req.ip}, function (err, doc) {
            if (err) {
              console.log(err);
            } else {
              if (!doc) {
                stockrecord.create({'ipAddr': req.ip, 'stockCode': element.stock, 'like': 1}, function (err) {
                  if (err) {
                    console.log(err);
                  } else {
                    getLikes(req, res, stockDataArr, element, cnt, i);
                  }
                });
              } else {
                getLikes(req, res, stockDataArr, element, cnt, i);
              }
            }
          });
        } else {
          getLikes(req, res, stockDataArr, element, cnt, i);
        }
      });

      /*let stock = req.query.stock;
      let stocker = '';
      if (Array.isArray(stock)) {
        let delim = '';
        req.query.stock.forEach(element => {
          stocker += delim + element;
          delim = ',';

          //if like then check if the stock and IP exist in the collection
        if (req.query.like) {
            stockrecord.find({stockCode: element, ip: req.ip}, function (err, doc) {
              if (err) {
                console.log(err);
              } else {
                if (!doc) {
                  stockrecord.create({'ipAddr': req.ip, 'stockCode': element, 'like': 1}, function(err) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log('inserted into db');
                    }
                  });
                } else {
                  console.log('ip ' + req.ip + ' already used.');
                }
              }
            });
          }
          //Get the number of likes
          var likes = 0;
          stockrecord.find({stockCode: element}, function (err, docs) {
            if (err) {
              console.log(err);
            } else {
              docs.forEach(ele => {
                like += 1;
              });
              var stockrec = {'stock': element, 'price': 0, 'likes': likes};
              console.log(stockrec);
              stockDataArr.push(stockrec);
            }
          });
         
        });
      } else {
        stocker = stock;
         //if like then check if the stock and IP exist in the collection
         if (req.query.like) {
          stockrecord.find({stockCode: stock, ipAddr: req.ip}, function (err, doc) {
            if (err) {
              console.log(err);
            }
            if (!doc || doc.length == 0) {
              stockrecord.create({'ipAddr': req.ip, 'stockCode': stock, 'like': 1}, function(err) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('inserted into db');
                }
              });
            } else {
              console.log(doc);
              console.log('ip ' + req.ip + ' already used.');
            }
          });
        }

         //Get the number of likes
         var likes = 0;
         stockrecord.find({'stockCode': stock}, function (err, docs) {
           if (err) {
             console.log(err);
           } else {
             docs.forEach(ele => {
               likes += 1;
               console.log(ele);
               
             });
             var stockrec = {'stock': stock, 'price': 0, 'likes': likes};
             console.log(stockrec);
           }
         });
         
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
      res.json({'stock': stock, 'price': 0, 'likes': like});*/
    });

    function getLikes(req, res, stockDataArr, element, cnt, i) {
      //Get the number of likes. Then get the stock prices, if i = cnt call the done function and return.
      element['price'] = 0;
      element['likes'] = 0;
      stockrecord.find({'stockCode': element.stock}, function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          if (!docs) {
            getPrice(req, res, stockDataArr, element, cnt, i);
          } else {
            docs.forEach(ele => {
              element.likes += ele.like;
          });
          getPrice(req, res, stockDataArr, element, cnt, i);
          };
        }
      });
    };

    function getPrice(req, res, stockDataArr, element, cnt, i) {
      let output = '';
      let request = https.get(process.env.STOCKAPI + element.stock, function (result) {
        //console.log(result);
        result.setEncoding('utf8');
        result.on('data', (chunk) => {
          output += chunk;
          console.log(chunk);
          let obj = JSON.parse(chunk);
          console.log(obj.price);
          element.price = obj.price;
          console.log(element);
          if (i == cnt) {
            //res.json({'stockData': stockDataArr});
            done(req, res, stockDataArr, element, cnt, i);
          }
        });
        
        /*res.on('end', () => {
          let obj = JSON.parse(output);
          console.log(obj);
        });*/
      });
    };

  function done(req, res, stockDataArr, element, cnt, i) {
    if (stockDataArr.length == 1) {
      res.json({'stockData': stockDataArr[0]});
    } else if (stockDataArr.length == 2){
      stockDataArr[0]['rel_likes'] = stockDataArr[0].likes - stockDataArr[1].likes;
      stockDataArr[1]['rel_likes'] = stockDataArr[1].likes - stockDataArr[0].likes;
      delete stockDataArr[0]['likes'];
      delete stockDataArr[1]['likes'];
      res.json({'stockData': stockDataArr});
    } else {
      res.json({'stockData': stockDataArr});
    }
  };
};
