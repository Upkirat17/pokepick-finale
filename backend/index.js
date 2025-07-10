const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const teamRoutes = require('./routes/teams');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/team', teamRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
  res.send('Pokepick backend running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 