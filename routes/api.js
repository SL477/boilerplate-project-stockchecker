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
// HTTP
import { get } from 'https';
config();

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

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

    /**
     * @swagger
     * /api/stock-prices:
     *  get:
     *      description: Get the stock price
     *      parameters:
     *         - name: stock
     *           in: query
     *           required: true
     *           type: string
     *         - name: like
     *           in: query
     *           required: false
     *           type: boolean
     *      produces:
     *          - application/json
     *      tags:
     *          - stock price
     *      responses:
     *          200:
     *              description: shows the stock price and number of likes
     *              content:
     *                  application/json:
     *                      schema:
     *                          properties:
     *                              stockData:
     *                                  type: object
     *                                  properties:
     *                                      stock:
     *                                          type: string
     *                                          description: The stock code(s) you sent
     *                                      price:
     *                                          type: number
     *                                          description: The current stock price in $
     *                                      likes:
     *                                          type: number
     *                                          description: The number of likes a stock has
     */
    app.route('/api/stock-prices').get(async function (req, res) {
        const stockDataArr = [];
        if (Array.isArray(req.query.stock)) {
            req.query.stock.forEach((element) => {
                stockDataArr.push({ stock: element, price: 0, likes: 0 });
            });
        } else {
            stockDataArr.push({ stock: req.query.stock, price: 0, likes: 0 });
        }

        // need to get the price and number of likes

        const likes = await getLikes(stockDataArr);

        for (let stock of stockDataArr) {
            // console.log('stock', stock, likes);
            stock.price = await getPrice(stock.stock);

            const idx = likes.findIndex((like) => like.stock === stock.stock);
            if (idx > -1) {
                stock.likes = likes[idx].likes;
            }

            // if we are liking the stock set the likes
            if (req.query.like) {
                stock.likes++;
                stockRecord
                    .find({ stockCode: stock.stock, ip: req.ip })
                    .then((doc) => {
                        if (!doc || doc.length === 0) {
                            stockRecord
                                .create({
                                    ipAddr: req.ip,
                                    stockCode: stock.stock,
                                    like: 1,
                                })
                                .catch((err) => console.error(err));
                        }
                    })
                    .catch((err) => console.error(err));
            }
        }

        // console.log('before ret', stockDataArr);

        if (stockDataArr.length === 1) {
            res.json({ stockData: stockDataArr[0] });
        } else if (stockDataArr.length === 2) {
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
    });

    /**
     * Get the likes
     * @param {{stock: string}[]} stockDataArr
     * @returns {{stock: string, likes: number}[]}
     */
    async function getLikes(stockDataArr) {
        const stocks = [];
        const ret = [];
        stockDataArr.forEach((s) => {
            stocks.push(s.stock);
            ret.push({ stock: s.stock, likes: 0 });
        });

        await new Promise((resolve) => {
            stockRecord
                .aggregate([
                    {
                        $match: {
                            stockCode: {
                                $in: stocks,
                            },
                        },
                    },
                    {
                        $group: {
                            _id: '$stockCode',
                            like: { $sum: '$like' },
                        },
                    },
                ])
                .then((docs) => {
                    // console.log('getLikes', docs, stocks);
                    for (let doc of docs) {
                        const idx = ret.findIndex(
                            (stock) => stock.stock === doc._id
                        );
                        if (idx > -1) {
                            ret[idx].likes = doc.like;
                        }
                        // console.log('getlikes idx', idx, doc);
                    }
                    resolve();
                })
                .catch((err) => {
                    console.error(err);
                    resolve();
                });
        });
        // console.log('getLikes before ret', ret);
        return ret;
    }

    /**
     * Get the stock price as a promise
     * @param {string} stock
     * @returns {Promise<number>}
     */
    function getPrice(stock) {
        return new Promise((resolve) => {
            get(`${process.env.STOCKAPI}${stock}/quote`, function (result) {
                result.setEncoding('utf8');
                result.on('data', (chunk) => {
                    const obj = JSON.parse(chunk);
                    resolve(obj.latestPrice);
                });
            });
        });
    }
}
