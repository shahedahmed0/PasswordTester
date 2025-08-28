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
  rarityScore: Number,
  testedAt: { type: Date, default: Date.now },
  strengthLabel: String,
  feedback: String,
  rarityLabel: String
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

function analyzePasswordRarity(password) {
  if (!password || password.length === 0) {
    return { score: 0, label: 'No password' };
  }

  let score = 0;
  let feedback = [];

  if (password.length >= 16) score += 3;
  else if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

  const charTypesCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
  .filter(Boolean).length;

  score += charTypesCount;

  const commonPatterns = [
    /^123/, /^qwert/, /^asdf/, /^password/, /^admin/, /^welcome/, /^login/,
    /^\d+$/,
    /^[a-zA-Z]+$/,
    /(.)\1{2,}/,
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
    /(012|123|234|345|456|567|678|789|890)/
  ];

  let patternCount = 0;
  commonPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      patternCount++;
      feedback.push(`Contains common pattern: ${pattern.toString()}`);
    }
  });

  score = Math.max(0, score - patternCount);

  const dictionaryWords = password.split(/[^a-zA-Z]/).filter(word => word.length > 3);
  if (dictionaryWords.length > 0) {
    score = Math.max(0, score - 1);
    feedback.push('Contains dictionary words');
  }

  score = Math.min(5, Math.max(0, score));

  let label;
  if (score >= 4) label = 'Very Rare';
  else if (score >= 3) label = 'Rare';
  else if (score >= 2) label = 'Uncommon';
  else if (score >= 1) label = 'Common';
  else label = 'Very Common';

  return { score, label, feedback };
}


app.get('/api/generate-password', (req, res) => {
  try {
    const { length = 16, useNumbers = true, useSymbols = true } = req.query;
    const parsedLength = Math.min(32, Math.max(8, parseInt(length) || 16));
    
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let charset = lowercase + uppercase;
    if (useNumbers === 'true' || useNumbers === true) charset += numbers;
    if (useSymbols === 'true' || useSymbols === true) charset += symbols;
    

    let password = '';
    if (useNumbers === 'true' || useNumbers === true) {
      password += numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (useSymbols === 'true' || useSymbols === true) {
      password += symbols[Math.floor(Math.random() * symbols.length)];
    }
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    

    for (let i = password.length; i < parsedLength; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    

    password = password.split('').sort(() => Math.random() - 0.5).join('');
    

    const result = zxcvbn(password);
    const rarity = analyzePasswordRarity(password);
    
    res.json({
      password,
      strength: ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][result.score],
      score: result.score,
      feedback: result.feedback.suggestions.join(' ') || 'Strong password!',
      rarity: {
        score: rarity.score,
        label: rarity.label,
        feedback: rarity.feedback
      }
    });
    
  } catch (err) {
    console.error('Password generation error:', err);
    res.status(500).json({ error: 'Failed to generate password' });
  }
});

app.post('/api/check-strength', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Valid password required' });
    }

    const normalizedPassword = password.trim().toLowerCase();
    const isCommon = commonPasswords.has(normalizedPassword);
    const result = zxcvbn(password);
    const rarity = analyzePasswordRarity(password);
    const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][isCommon ? 0 : result.score];

    const getMemeFeedback = (score, isCommon) => {
      if (isCommon) {
        return {
          meme: 'memes/vwI4mYEHP8k0w.gif',
          text: 'Seriously? This password is more common than pineapple on pizza! 🍍'
        };
      }

      const memes = [
        {
          meme: 'memes/QoZunxgU0Z1i8.gif',
          text: 'Your password is weaker than my grandma\'s tea! ☕'
        },
        {
          meme: 'memes/M2qCVgOKaSNLG.gif',
          text: 'This password wouldn\'t protect a chocolate from a toddler! 🍫'
        },
        {
          meme: 'memes/3dkXFcZgXEu9noZQCE.gif',
          text: 'Not bad... but not great either. Like lukewarm coffee. ☕'
        },
        {
          meme: 'memes/uim459G9DiGQXDv8zt.gif',
          text: 'Now we\'re talking! This password means business! 💼'
        },
        {
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
      rarityScore: rarity.score,
      strengthLabel,
      feedback: isCommon ?
      'Common password detected' :
      result.feedback.suggestions.join(' ') || 'Good password!',
                              rarityLabel: rarity.label
    });

    res.json({
      strength: strengthLabel,
      score: isCommon ? 0 : result.score,
      isCommon,
      feedback: isCommon ?
      'This password is too common and easily guessable' :
      result.feedback.suggestions.join(' ') || 'Good password!',
             meme: memeFeedback.meme,
             memeText: memeFeedback.text,
             rarity: {
               score: rarity.score,
               label: rarity.label,
               feedback: rarity.feedback
             }
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
    .select('strengthScore isCommon testedAt strengthLabel feedback rarityScore rarityLabel -_id');
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
        rarityDistribution: await PasswordTest.aggregate([
          { $group: { _id: "$rarityScore", count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]),
        lastTests: await PasswordTest.find().sort({ testedAt: -1 }).limit(10)
    };

    const strengthDistributionArray = [0, 0, 0, 0, 0];
    stats.strengthDistribution.forEach(item => {
      strengthDistributionArray[item._id] = item.count;
    });
    stats.strengthDistribution = strengthDistributionArray;

    const rarityDistributionArray = [0, 0, 0, 0, 0, 0];
    stats.rarityDistribution.forEach(item => {
      rarityDistributionArray[item._id] = item.count;
    });
    stats.rarityDistribution = rarityDistributionArray;

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
