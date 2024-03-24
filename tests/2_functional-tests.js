/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

import chaiHttp from 'chai-http';
import * as chai from 'chai';
const assert = chai.assert;
import server from '../server.js';
import { suite, test } from 'mocha';

const chaiServer = chai.use(chaiHttp);

suite('Functional Tests', function () {
    suite('GET /api/stock-prices => stockData object', function () {
        test('1 stock', function (done) {
            chaiServer
                .request(server)
                .get('/api/stock-prices')
                .query({ stock: 'goog' })
                .end(function (err, res) {
                    //complete this one too
                    assert.equal(res.status, 200);
                    //console.log(res.body);
                    assert.equal(res.body.stockData.stock, 'goog');
                    assert.isNumber(res.body.stockData.price);
                    assert.isNumber(res.body.stockData.likes);
                    done();
                });
        });

        test('1 stock with like', function (done) {
            chaiServer
                .request(server)
                .get('/api/stock-prices')
                .query({ stock: 'goog', like: true })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stockData.stock, 'goog');
                    assert.isNumber(res.body.stockData.price);
                    assert.isNumber(res.body.stockData.likes);
                    done();
                });
        });

        test('1 stock with like again (ensure likes arent double counted)', function (done) {
            chaiServer
                .request(server)
                .get('/api/stock-prices')
                .query({ stock: 'goog', like: true })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stockData.stock, 'goog');
                    assert.isNumber(res.body.stockData.price);
                    assert.isNumber(res.body.stockData.likes);
                    done();
                });
        });

        test('2 stocks', function (done) {
            chaiServer
                .request(server)
                .get('/api/stock-prices')
                .query({ stock: ['goog', 'msft'] })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    console.log(res.body.stockData);
                    assert.isArray(res.body.stockData);
                    done();
                });
        });

        test('2 stocks with like', function (done) {
            chaiServer
                .request(server)
                .get('/api/stock-prices')
                .query({ stock: ['goog', 'msft'], like: true })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body.stockData);
                    done();
                });
        });
    });
});
