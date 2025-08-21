require('dotenv').config();
const zxcvbn = require('zxcvbn');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://burnedwanderer:404051@passwordapp.gfveem3.mongodb.net/?retryWrites=true&w=majority&appName=PasswordApp';

mongoose.connect(MONGO_URI, {
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

const PasswordTestSchema = new mongoose.Schema({
  strengthScore: { type: Number, required: true },
  isCommon: Boolean,
  testedAt: { type: Date, default: Date.now },
  strengthLabel: String,
  feedback: String
});

const AdminTokenSchema = new mongoose.Schema({
  token: { type: String, unique: true }
});

const PasswordTest = mongoose.model('PasswordTest', PasswordTestSchema);
const AdminToken = mongoose.model('AdminToken', AdminTokenSchema);

let commonPasswords = new Set();

async function initializeData() {
  try {
    await AdminToken.deleteMany();
    await AdminToken.create({ token: 'dev123' });

    const filePath = path.join(__dirname, 'common-passwords.txt');
    console.log(`Loading common passwords from: ${filePath}`);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const passwords = fileContent
    .split(/\r?\n/)
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length > 0);

    passwords.forEach(p => commonPasswords.add(p));
    console.log(`Loaded ${commonPasswords.size} common passwords`);

  } catch (err) {
    console.error('Initialization error:', err);
    process.exit(1);
  }
}

app.post('/api/check-strength', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Valid password required' });
    }

    const normalizedPassword = password.trim().toLowerCase();
    const isCommon = commonPasswords.has(normalizedPassword);
    const result = zxcvbn(password);
    const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][isCommon ? 0 : result.score];

    // Meme feedback based on score
    const getMemeFeedback = (score, isCommon) => {
      if (isCommon) {
        return {
          meme: 'https://media.giphy.com/media/LMN7qL2BpE9vW/giphy.gif',
          text: 'Seriously? This password is more common than pineapple on pizza! 🍍'
        };
      }

      const memes = [
        { // Score 0 - Very Weak
          meme: 'memes/QoZunxgU0Z1i8.gif',
          text: 'Your password is weaker than my grandma\'s tea! ☕'
        },
        { // Score 1 - Weak
          meme: 'memes/M2qCVgOKaSNLG.gif',
          text: 'This password wouldn\'t protect a chocolate from a toddler! 🍫'
        },
        { // Score 2 - Fair
          meme: 'memes/3dkXFcZgXEu9noZQCE.gif',
          text: 'Not bad... but not great either. Like lukewarm coffee. ☕'
        },
        { // Score 3 - Strong
          meme: 'memes/uim459G9DiGQXDv8zt.gif',
          text: 'Now we\'re talking! This password means business! 💼'
        },
        { // Score 4 - Very Strong
          meme: 'memes/rCByhKpqKDZErtLDzm.gif',
          text: 'UNBREAKABLE! This password could guard the Crown Jewels! 👑'
        }
      ];

      return memes[score];
    };

    const memeFeedback = getMemeFeedback(isCommon ? 0 : result.score, isCommon);

    await PasswordTest.create({
      strengthScore: isCommon ? 0 : result.score,
      isCommon,
      strengthLabel,
      feedback: isCommon ?
        'Common password detected' :
        result.feedback.suggestions.join(' ') || 'Good password!'
    });

    res.json({
      strength: strengthLabel,
      score: isCommon ? 0 : result.score,
      isCommon,
      feedback: isCommon ?
        'This password is too common and easily guessable' :
        result.feedback.suggestions.join(' ') || 'Good password!',
      meme: memeFeedback.meme,
      memeText: memeFeedback.text
    });

  } catch (err) {
    console.error('Password check error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const history = await PasswordTest.find()
    .sort({ testedAt: -1 })
    .limit(20)
    .select('strengthScore isCommon testedAt strengthLabel feedback -_id');
    res.json(history);
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

app.use('/api/admin', async (req, res, next) => {
  try {
    const tokenExists = await AdminToken.exists({
      token: req.headers.authorization?.replace('Bearer ', '')
    });
    if (!tokenExists) return res.status(401).json({ error: 'Unauthorized' });
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error during auth check' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = {
      totalTests: await PasswordTest.countDocuments(),
        strengthDistribution: await PasswordTest.aggregate([
          { $group: { _id: "$strengthScore", count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]),
        lastTests: await PasswordTest.find().sort({ testedAt: -1 }).limit(10)
    };

    const distributionArray = [0, 0, 0, 0, 0];
    stats.strengthDistribution.forEach(item => {
      distributionArray[item._id] = item.count;
    });
    stats.strengthDistribution = distributionArray;

    res.json(stats);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

initializeData().then(() => {
  const PORT = 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
