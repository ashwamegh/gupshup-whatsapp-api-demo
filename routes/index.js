var express = require("express");
var router = express.Router();
var fetch = require("node-fetch");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/callback", function(req, res) {
  const data = req.body;
  console.log(data);
  // console.log(data.text);
  res.sendStatus(200);
});

router.get("/msg", function(req, res) {
  
  fetch("https://api.gupshup.io/sm/api/v1/msg", {
    credentials: "include",
    headers: {
      accept: "application/json, text/plain, */*",
      apikey: "faefecf791f34cc8cce8976357a15f57",
      authorization: "faefecf791f34cc8cce8976357a15f57",
      "content-type": "application/x-www-form-urlencoded",
      "sec-fetch-mode": "cors"
    },
    body:
      "channel=whatsapp&source=917834811114&destination=918587099540&message=fromngrok",
    method: "POST",
    mode: "cors"
  })
  .then(response => response.json())
  .then(json => { 
    console.log(json);
    res.json(json);
  });
})

router.post("/twilio", (req,res) => {
  console.log(req.body);
  res.json(req.body);
})

module.exports = router;
