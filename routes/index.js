const express = require("express");
const router = express.Router();
const Axios = require('axios');
const querystring = require('querystring');
const fileType = require('file-type');

async function getFileBuffer(url, args) {
  return new Promise((resolve, reject) => {
    try {
      const payload = {
        method: 'get',
      };
      if (args && args.headers) {
        payload.headers = args.headers;
      }
      fetch(url, payload)
        .then((res) => resolve(res.buffer()));
    } catch (exception) {
      reject(exception);
    }
  });
}

async function sendMessageToCustomer(messageObj) {

  // messageObj = {
  //   // If you need to send media, place them in attachment key
  //   attachment: {
  //     url: 'your media URL',
  //     previewUrl: 'your media preview URL',
  //     originalUrl: 'your media original URL',
  //   },
  //   message: "Your text message or caption to medias",
  //   from: 'YOUR_WHATSAPP_NUMBER',
  //   to: 'RECIPIENTS_WHATSAPP_NUMBER'
  // }

  try {

    const payload = {
      channel: 'whatsapp',
      source: messageObj.from,
      destination: messageObj.to,
    };

    if (messageObj.attachment) {
      const fileBuffer = await getFileBuffer(messageObj.attachment.url);

      let typeOfFile = fileType(fileBuffer).mime.split('/')[0];
      if (!(['image', 'video', 'audio'].includes(typeOfFile))) {
        typeOfFile = 'file';
      }

      payload['message.payload'] = {
        type: typeOfFile,
        url: messageObj.attachment.url,
        previewUrl: messageObj.attachment.previewUrl || messageObj.attachment.url,
        originalUrl: messageObj.attachment.originalUrl || messageObj.attachment.url,
      };
    } else {
      payload['message.payload'] = {
        type: 'text',
        text: messageObj.message,
      };
    }

    payload['message.payload'] = JSON.stringify(payload['message.payload']);

    return await Axios.create({
      headers: {
        accept: 'application/json, text/plain, */*',
        apikey: messageObj.apiKey,
        'content-type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
        'cache-control': 'no-cache',
      },
    }).post('https://api.gupshup.io/sm/api/v1/msg', querystring.stringify(payload));
  } catch (exception) {
    log.error(exception);
    return exception;
  }
}

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

// Route for Inbound messages
// this will send the message to your customers through gupshup API
router.post("/msg", async function(req, res) {
    const {
      message, to, from, attachment,
    } = req.body;

    try {
      const apiKey = process.env.API_KEY;
      const messageObj = {
        apiKey,
        from: from, // Your whatsapp gupshup number
        to, // Recipients number
      };
      const output = [];

      if (attachment && attachment.text) {
        // If attachment comes with the text, they will be sent separately in batches
        const messageOrder = 2;

        for (let i = 0; i < messageOrder; i++) {
          let batchPayload = {};
          if (i === 0) {
            batchPayload = {
              ...messageObj,
              attachment,
            };
            const messageData = await sendMessageToCustomer(batchPayload);
            const sentMessageData = { message: attachment, ...messageData.data.messages[0] };
            output.push(sentMessageData);
          } else {
            batchPayload = {
              ...messageObj,
              message: attachment.text,
            };
            const messageData = await sendMessageToCustomer(batchPayload);
            const sentMessageData = { message: attachment.text, ...messageData.data.messages[0] };
            output.push(sentMessageData);
          }
        }
      } else {
        messageObj.message = message;
        if (attachment) {
          messageObj.attachment = attachment;
        }
        const messageData = await sendMessageToCustomer(
          messageObj,
        );
        const sentMessageData = { message: attachment || message, ...messageData.data.messages[0] };
        output.push(sentMessageData);
      }

      return res.status(200).send(output);
    } catch (exception) {
      log.error(exception);
      return res.status(500).send({
        error: true,
        message: 'Error while processing the data.',
      });
    }
})

module.exports = router;
