const express = require('express');
const cors = require('cors')
const axios = require('axios')
require('dotenv').config();

const appId = process.env.APP_ID;
const callbackUrl = process.env.CALLBACK_URL
const appSecret = process.env.APP_SECRET

const app = express();

app.use(cors())
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + 'public/index.html');
})

app.get('/zalo/login', (req, res) => {
  const _callbackUrl = encodeURIComponent(`${callbackUrl}/zalo/callback`)
  const zaloUri = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${appId}&redirect_uri=${_callbackUrl}`
  res.redirect(zaloUri)
})

app.get('/zalo/callback', async (req, res) => {
  const { code, oa_id } = req.query;

  const infoRes = await axios.get(`https://oauth.zaloapp.com/v3/access_token?app_id=${appId}&app_secret=${appSecret}&code=${code}`);
  const { access_token, refresh_token } = infoRes.data;

  var returnScript = `
    <div>
      <p>${access_token}</p>
      <p>${refresh_token}</p>
      <p>${oa_id}</p>
      <script>
        var returnValue = {
          "access_token": ${access_token},
          "refresh_token": ${refresh_token}
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