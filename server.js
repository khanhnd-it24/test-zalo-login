const express = require('express');
const cors = require('cors')
const axios = require('axios')
const sha256 = require('sha256')
require('dotenv').config();

const appId = process.env.APP_ID;
const callbackUrl = process.env.CALLBACK_URL
const appSecret = process.env.APP_SECRET

const app = express();

app.use(cors())
app.use(express.static('public'));

let codeVerifier = ""

function generateString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const toAscii = (string) => string.split('').map(char=>char.charCodeAt(0)).join("")

app.get('/', (req, res) => {
  res.sendFile(__dirname + 'public/index.html');
})

app.get('/zalo/login', (req, res) => {
  codeVerifier = generateString(43)
  const codeChallenge = Buffer.from(sha256(toAscii(codeVerifier))).toString('base64');
  const _callbackUrl = encodeURIComponent(`${callbackUrl}/zalo/callback`)
  const zaloUri = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${appId}&redirect_uri=${_callbackUrl}`
  res.redirect(zaloUri)
})

app.get('/zalo/callback', async (req, res) => {
  const { code, oa_id } = req.query;

  let data = qs.stringify({
    'code': code,
    'app_id': appId,
    'grant_type': 'authorization_code',
    'code_verifier': codeVerifier 
  });

  let headers = { 
    'Content-Type': 'application/x-www-form-urlencoded', 
    'secret_key': appSecret
  };
  
  const infoRes = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', data, {
    headers
  });
  const { access_token, refresh_token } = infoRes.data;

  var returnScript = `
    <div>
      <p>${access_token}</p>
      <p>${refresh_token}</p>
      <p>${oa_id}</p>
      <script>
        var returnValue = {
          "data": ${infoRes.data}
        }

        window.opener.callback(returnValue)
        window.close()
      </script>
    </div>
  `
  return res.send(returnScript);
})

app.listen(process.env.PORT, (err) => {
  if (err) throw err;
  console.log(`Server started ${process.env.PORT}`)
})