const express = require('express');
const cors = require('cors')
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

  const zaloUri = encodeURIComponent(`https://oauth.zaloapp.com/v4/oa/permission?app_id=${appId}&redirect_uri=${callbackUrl}/zalo/callback`)
  res.redirect(zaloUri)
})

app.get('/zalo/callback', async (req, res) => {
  const { code, uid } = req.query;

  const infoRes = await axios.get(`https://oauth.zaloapp.com/v3/access_token?app_id=${appId}&app_secret=${appSecret}&code=${code}`);
  const { access_token, refresh_token } = infoRes.data;

  var returnScript = `
    <script>
      var returnValue = {
        "access_token": ${access_token},
        "refresh_token": ${refresh_token}
      }

      window.returnValue = returnValue
      window.close()
    </script>
  `
  return res.send(returnScript);
})

app.listen(process.env.PORT, (err) => {
  if (err) throw err;
  console.log(`Server started ${process.env.PORT}`)
})