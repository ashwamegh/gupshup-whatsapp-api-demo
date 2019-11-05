const express = require("express");
const router = express.Router();
const Axios = require('axios');
const querystring = require('querystring');

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

// Route for Gupshup Inbound Messages
router.post("/callback", function(req, res) {
  const {botname, messageobj} = req.body;
  console.log("App Name: ", botname);
  console.log("Message Object: ", JSON.parse(messageobj));
  // console.log(data.text);
  res.sendStatus(200);
});

// Route for Gupshup Outbound Messages
router.get("/msg", async function(req, res) {

  const payload = {
    channel: 'whatsapp',
    source: "Demo from Github",
    destination: "917834811114",
    message: "918587099540",
  };
  const gupshupResponse = await Axios.create({
    headers: {
      accept: 'application/json, text/plain, */*',
      apikey: process.env.API_KEY,
      'content-type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
      'cache-control': 'no-cache',
    },
  }).post('https://api.gupshup.io/sm/api/v1/msg', querystring.stringify(payload));

  res.status(200).send(gupshupResponse.data);
})

module.exports = router;
