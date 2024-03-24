/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

import { Schema, model, connect } from 'mongoose';
import { config } from 'dotenv';
config();

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

// HTTP
import { get } from 'https';
// let options = {
//   host: 'https://financialmodelingprep.com',
//   path: '/api/v3/stock/real-time-price/'/*,
//   headers: {
//     'Content-Type': 'application/json'
//   }*/
// };

// Schema
const stockSchema = new Schema({
    ipAddr: { type: String, required: true },
    stockCode: { type: String, required: true },
    like: { type: Number, required: true },
});

const stockRecord = model('stockrecords', stockSchema);

export default function (app) {
    connect(CONNECTION_STRING)
        .then(console.log('db connected'))
        .catch((err) => console.error(err));

    app.route('/api/stock-prices').get(function (req, res) {
        const stockDataArr = [];
        if (Array.isArray(req.query.stock)) {
            req.query.stock.forEach((element) => {
                stockDataArr.push({ stock: element });
            });
        } else {
            stockDataArr.push({ stock: req.query.stock });
        }

        // Get the number of stocks in the array and keep count
        let cnt = stockDataArr.length;
        console.log(cnt);
        let i = 0;

        stockDataArr.forEach((element) => {
            i++;
            // if like then check if the stock and IP exist in the collection
            if (req.query.like) {
                stockRecord
                    .find({ stockCode: element.stock, ip: req.ip })
                    .then((doc) => {
                        if (!doc) {
                            stockRecord
                                .create({
                                    ipAddr: req.ip,
                                    stockCode: element.stock,
                                    like: 1,
                                })
                                .then(
                                    getLikes(
                                        req,
                                        res,
                                        stockDataArr,
                                        element,
                                        cnt,
                                        i
                                    )
                                )
                                .catch((err) => console.error(err));
                        } else {
                            getLikes(req, res, stockDataArr, element, cnt, i);
                        }
                    })
                    .catch((err) => console.error(err));
            } else {
                getLikes(req, res, stockDataArr, element, cnt, i);
            }
        });
    });

    function getLikes(req, res, stockDataArr, element, cnt, i) {
        // Get the number of likes. Then get the stock prices, if i = cnt call the done function and return.
        element['price'] = 0;
        element['likes'] = 0;
        stockRecord
            .find({ stockCode: element.stock })
            .then((docs) => {
                if (!docs) {
                    getPrice(req, res, stockDataArr, element, cnt, i);
                } else {
                    docs.forEach((element) => (element.likes += element.like));
                }
            })
            .catch((err) => console.error(err));
    }

    function getPrice(req, res, stockDataArr, element, cnt, i) {
        get(process.env.STOCKAPI + element.stock, function (result) {
            result.setEncoding('utf8');
            result.on('data', (chunk) => {
                console.log(chunk);
                const obj = JSON.parse(chunk);
                console.log(obj.price);
                element.price = obj.price;
                console.log(element);
                if (i == cnt) {
                    done(req, res, stockDataArr, element, cnt, i);
                }
            });
        });
    }

    // eslint-disable-next-line no-unused-vars
    function done(req, res, stockDataArr, element, cnt, i) {
        if (stockDataArr.length == 1) {
            res.json({ stockData: stockDataArr[0] });
        } else if (stockDataArr.length == 2) {
            stockDataArr[0]['rel_likes'] =
                stockDataArr[0].likes - stockDataArr[1].likes;
            stockDataArr[1]['rel_likes'] =
                stockDataArr[1].likes - stockDataArr[0].likes;
            delete stockDataArr[0]['likes'];
            delete stockDataArr[1]['likes'];
            res.json({ stockData: stockDataArr });
        } else {
            res.json({ stockData: stockDataArr });
        }
    }
}
