const express = require('express');
const cors = require('cors')
const app = express();

app.use(cors())
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + 'public/index.html');
})

app.get('/zalo/login', (req, res) => {
  const zaloUri = "https://oauth.zaloapp.com/v4/oa/permission?app_id=3612785874375008341&redirect_uri=https%3A%2F%2Fb660-118-70-129-35.ap.ngrok.io%2Fzalo%2Fcallback"
  res.redirect(zaloUri)
})

app.get('/zalo/callback', async (req, res) => {
  const { code, uid } = req.query;

  const infoRes = await axios.get(`https://oauth.zaloapp.com/v3/access_token?app_id=3612785874375008341&app_secret=KLWaRy6RW6BC66mmEEw6&code=${code}`);
  const { access_token, refresh_token } = infoRes.data;

 
  return res.redirect(`/zalo/result?access_token=${access_token}&refresh_token=${refresh_token}`);
})

app.listen(8080, (err) => {
  if (err) throw err;
  console.log('Server started 8080')
})