const webpush = require('./webpush');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/mycustomproject' , { useNewUrlParser: true });

const Subscriptions = require('./subscriptions');

const isValidSaveRequest = (req, res) => {
  // Check the request body has at least an endpoint.
  if (!req.body || !req.body.endpoint) {
    // Not a valid subscription.
    res.status(400);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      error: {
        id: 'no-endpoint',
        message: 'Subscription must have an endpoint.'
      }
    }));
    
    return false;
  }
  return true;
};

const app = express();
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
app.use(cors())

app.post('/api/save-subscription/', async (req, res) => {
  try {
    if (!isValidSaveRequest(req, res)) {
      return;
    }
  
    let newSubscription = new Subscriptions({
      ...req.body
    });
  
    await newSubscription.save();

    res.json({ 
      data: { success: true } 
    })
  } catch (err) {
    res.status(500).json({
      error: {
        id: 'unable-to-save-subscription',
        message: 'The subscription was received but we were unable to save it to our database.'
      }
    })
  }
});

app.post('/api/get-subscriptions/', async (req, res) => {
  try {
      let subscriptions = await Subscriptions.find({ });
      const reducedSubscriptions = subscriptions.map((subscription) => {
        return {
          id: subscription._id,
          endpoint: subscription.endpoint
        }
      });

      res.json({
        data : {
          subscriptions : reducedSubscriptions
        }
      })
  } catch (err) {
      res.status(500).json({
        error: {
          id: 'unable-to-get-subscriptions',
          message: 'We were unable to get the subscriptions from our database.'
        }
      })
  }
 
});


const triggerPushMsg = async (subscription, dataToSend) => {
  return webpush.sendNotification(subscription, JSON.stringify(dataToSend))
  .catch(async (err) => {
    if (err.statusCode === 410) {
      return await Subscriptions.find({ _id : subscription._id }).remove();
    } else {
      console.log('Subscription is no longer valid: ', err);
    }
  });
};

app.post('/api/trigger-push-msg/', async (req, res) => {
    try {
      const dataToSend = req.body;

      let subscriptions = await Subscriptions.find({ });
      subscriptions.forEach(async subscription => {
          await triggerPushMsg(subscription, dataToSend);
      })  
  
      res.json({ data: { success: true } })
    } catch (err) {
      res.status(500).json({
        error: {
          id: 'unable-to-send-messages',
          message: `We were unable to send messages to all subscriptions : ` +
            `'${err.message}'`
        }
      })
    }

});

const port = process.env.PORT || 9012;

const server = app.listen(port, function () {
  console.log('Running on http://localhost:' + port);
});
