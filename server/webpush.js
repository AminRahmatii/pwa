const webpush = require('web-push');

const gcmServerKey = 'AIzaSyC5itnz9jHmpvQRhq8sJUCFUy2SYUPanGs';
webpush.setGCMAPIKey(gcmServerKey);

const vapidKeys = {
  publicKey: 'BHCPK4spNm3ujiZzZ-QVeacOyQhdAgkJnXKakvusf0cLDmQZIpcpSF2XBU-772ruMVkSPQBIIfsJ34Wu-5IF-Pg',
  privateKey: 'Unxk-YO-KJKwBnUvw_P82MwXlURSNCikplQpJEjXxz4'
};

webpush.setVapidDetails(
  'mailto:hesammoousavi@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

module.exports = webpush;