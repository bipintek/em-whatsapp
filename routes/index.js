/* Copyright (c) Meta Platforms, Inc. and affiliates.
* All rights reserved.
*
* This source code is licensed under the license found in the
* LICENSE file in the root directory of this source tree.
*/
var express = require('express');
var router = express.Router();
require('dotenv').config()
const { sendMessage, getTemplatedMessage } = require("../messageHelper");
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Home' });
});

const templateName = process.env.TEMPLATE_NAME;

router.post('/send-message', function (req, res, next) {
  
  console.log('req.body', req.body)
  console.log('templateName', templateName)

  let data = getTemplatedMessage(req.body.phoneNo, templateName, req.body.usrName, req.body.msgText);

  try {
    sendMessage(data)
    .then(function (response) {
      console.log(response.status, response.statusText);
      res.end(JSON.stringify({
        status: 'success'
      })); 
      return;
    })
    .catch(function (error) {
      console.log(error.response.status, error.response.statusText);
      // console.log(error.response.data);
      res.end(JSON.stringify({
        status: 'failure'
      })); 
    });
  } catch (error) {
    console.log(error);
    res.end(JSON.stringify({
      status: 'failure'
    }));
  }

  

  // res.end(JSON.stringify({
  //   status: 'success'
  // })); 

   
});


module.exports = router;
