import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const url = process.env.URL;

const Connection = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (e) {
    console.log('Error while connecting to MongoDB:', e.message);
  }
};

Connection();

const UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  }
});

const User = mongoose.model('user', UserSchema);

app.get('/', (req, res) => {
  res.render('main');
});

app.get("/webPage",(req,res)=>{
  res.render("webPage",{calories:"",totalCO2Emissions:"",co2EmissionsClass:"",healthLabels:[]});
});

app.post('/webPage', (req, res) => {
  
const foodName = req.body.foodName; 
const appId = 'c039a00c'; 
const apiKey = '278504b256939d184954f198de05c9c8'; 

const url = `https://api.edamam.com/api/nutrition-data?app_id=${appId}&app_key=${apiKey}&ingr=${foodName}`;

axios.get(url)
  .then(response => {
    
    res.render("webPage",
    {
      calories:response.data.calories,
      totalCO2Emissions:response.data.totalCO2Emissions,
      co2EmissionsClass:response.data.co2EmissionsClass,
      healthLabels:response.data.healthLabels
    });
  })
  .catch(error => {
    console.log('Error:', error);
  });

});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  User.findOne({ email: req.body.email }).then((found) => {
    if (found && found.password === req.body.password) {
      res.redirect('/webPage');
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }).then((found) => {
    if (found) {
      res.redirect('/login');
    } else {
      const newUser = new User({
        name: req.body.userName,
        email: req.body.email,
        password: req.body.password
      });
      newUser.save();
      res.redirect('/webPage');
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000!');
});
