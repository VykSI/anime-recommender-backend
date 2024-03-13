const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const app = express();
const cors = require('cors');

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: 'https://anime-recommender-frontend.vercel.app',
             methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
             }));

// MongoDB connection
const uri =process.env.MONGODB_URI;

// Connect to MongoDB Atlas
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB Atlas:', err));
const User = mongoose.model('User', {
  username: String,
  password: String,
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
});

// Signin endpoint
app.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      // Generate JWT token
      const token = jwt.sign({ username: user.username }, 'secret_key');
      res.json({ token });
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error signing in');
  }
});

// Middleware for verifying JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is required');
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(401).send('Invalid token');
    req.user = decoded;
    next();
  });
}

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
  res.json(req.user);
});

app.get('/search', async (req, res) => {
    try {
      const { title } = req.query;
      if (!title) {
        return res.status(400).send('Title parameter is required');
      }
  
      const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${title}`);
      const animeList = response.data.data;
      res.json(animeList);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching anime data');
    }
  });

  app.get('/anime', async (req, res) => {
    try {
      const title = req.query.title;
      if (!title) {
        return res.status(400).send('Title parameter is required');
      }
      
      const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${title}`);
      const animeList = response.data.data;
      res.json(animeList);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching anime data');
    }
  });

  app.get('/recommend', async (req, res) => {
    let title = req.query.title;
    console.log(title);
    title = title.replace(/-/g, ' ');
    console.log(title);
    axios.post('http://vyksi.pythonanywhere.com/recommender', { 'anime_name': title })
      .then(async response => {
        const animeData = [];
        console.log(response);
        if(response.status!=200){
          const animeData1 = ['Naruto','One-Piece','Bleach','Dragon-Ball'];
          console.log("Hello")
          for (const animeTitle of animeData1) {
            try {
              // Make request to Jikan API for each anime title
              const response1 = await axios.get(`https://api.jikan.moe/v4/anime?q=${animeTitle}`);
              // Push response data to the array
              animeData.push(response1.data.data[0]);
              console.log(response1.data.data);
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error('Error fetching anime data:', error.message);
            }
          }
        }
        
else{
  // Iterate over each anime title
  for (const animeTitle of response.data.data) {
    try {
      // Make request to Jikan API for each anime title
      const response1 = await axios.get(`https://api.jikan.moe/v4/anime?q=${animeTitle}`);
      // Push response data to the array
      animeData.push(response1.data.data[0]);
      console.log(response1.data.data);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      conbsole.log("hello");
      console.error('Error fetching anime data:', error.message);
    }
  }

  // Send the collected anime data back to the frontend
  res.json(animeData);
}
      })
      .catch(async err => {
        const animeData2 = [];
        const animeData1 = ['One-Piece','Naruto','Bleach','Dragon-Ball', 'Tokyo Ghoul'];
          console.log("Hello")
          for (const animeTitle of animeData1) {
            try {
              // Make request to Jikan API for each anime title
              const response1 = await axios.get(`https://api.jikan.moe/v4/anime?q=${animeTitle}`);
              // Push response data to the array
              animeData2.push(response1.data.data[0]);
              console.log(response1.data.data);
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error('Error fetching anime data:', error.message);
            }
          }
          res.json(animeData2);
      });
  });
  
// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
