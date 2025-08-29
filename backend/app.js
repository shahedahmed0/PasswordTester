require('dotenv').config();
const zxcvbn = require('zxcvbn');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

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


const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many login attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many password checks, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    error: 'Too many admin requests, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});


app.use('/api/', generalLimiter); 
app.use('/api/check-strength', passwordCheckLimiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
app.use('/api/admin', adminLimiter);

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

const RateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  endpoint: { type: String, required: true },
  count: { type: Number, default: 1 },
  lastRequest: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});


RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordTest = mongoose.model('PasswordTest', PasswordTestSchema);
const AdminToken = mongoose.model('AdminToken', AdminTokenSchema);
const RateLimit = mongoose.model('RateLimit', RateLimitSchema);

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


const customRateLimit = (windowMs, maxRequests) => {
  return async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const endpoint = req.path;
    const now = Date.now();
    const windowStart = new Date(now - windowMs);
    
    try {
      let rateRecord = await RateLimit.findOne({ ip, endpoint });
      
      if (rateRecord) {
        if (rateRecord.lastRequest < windowStart) {
          rateRecord.count = 1;
          rateRecord.lastRequest = now;
          rateRecord.expiresAt = new Date(now + windowMs);
          await rateRecord.save();
          return next();
        }
        
        if (rateRecord.count >= maxRequests) {
          return res.status(429).json({ 
            error: 'Too many requests, please try again later.',
            retryAfter: Math.ceil((rateRecord.expiresAt - now) / 1000)
          });
        }
        

        rateRecord.count++;
        rateRecord.lastRequest = now;
        await rateRecord.save();
      } else {
        rateRecord = new RateLimit({
          ip,
          endpoint,
          count: 1,
          lastRequest: now,
          expiresAt: new Date(now + windowMs)
        });
        await rateRecord.save();
      }
      
      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  };
};

app.post('/api/hash-simulation', customRateLimit(15 * 60 * 1000, 10), (req, res) => {
  try {
    const { password, algorithm = 'sha256', rounds = 5 } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const validAlgorithms = ['sha256', 'sha512', 'md5'];
    if (!validAlgorithms.includes(algorithm)) {
      return res.status(400).json({ error: 'Invalid algorithm' });
    }

    const parsedRounds = Math.min(10, Math.max(1, parseInt(rounds) || 5));

    const steps = [];
    let currentValue = password;
    
    steps.push({
      step: 0,
      description: "Original password",
      value: currentValue,
      valueHex: bufferToHex(Buffer.from(currentValue)),
      operation: "Input"
    });

    for (let i = 1; i <= parsedRounds; i++) {
      const salt = i % 2 === 0 ? `s4l7_${i}_r0und` : '';
      const operation = salt ? `Hash with salt (round ${i})` : `Hash (round ${i})`;
      
      const hash = crypto.createHash(algorithm);
      hash.update(currentValue + salt);
      currentValue = hash.digest('hex');
      
      steps.push({
        step: i,
        description: `After ${algorithm} hashing`,
        value: currentValue,
        valueHex: currentValue,
        operation,
        salt: salt || undefined
      });
    }

    res.json({
      originalPassword: password,
      finalHash: currentValue,
      algorithm,
      rounds: parsedRounds,
      steps,
      securityExplanation: getSecurityExplanation(algorithm, parsedRounds)
    });

  } catch (err) {
    console.error('Hashing simulation error:', err);
    res.status(500).json({ error: 'Failed to simulate hashing' });
  }
});

function bufferToHex(buffer) {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function getSecurityExplanation(algorithm, rounds) {
  const explanations = {
    sha256: {
      1: "Single SHA-256 hash is vulnerable to rainbow table attacks. Always use a salt!",
      3: "Multiple rounds of SHA-256 provide better protection but still need salt.",
      5: "Five rounds of SHA-256 with salting provides good protection against brute force attacks.",
      10: "Ten rounds significantly increase the computational cost for attackers."
    },
    sha512: {
      1: "SHA-512 produces a longer hash but still needs salt for protection.",
      3: "Multiple rounds of SHA-512 with salting provide excellent security.",
      5: "Five rounds of SHA-512 are very resistant to brute force attacks.",
      10: "Ten rounds of SHA-512 provide enterprise-level security for sensitive data."
    },
    md5: {
      1: "MD5 is cryptographically broken and unsuitable for password storage.",
      3: "Even multiple rounds of MD5 cannot fix its fundamental vulnerabilities.",
      5: "MD5 should never be used for password hashing in modern applications.",
      10: "Despite multiple rounds, MD5 remains vulnerable to collision attacks."
    }
  };

  return explanations[algorithm][rounds] || 
    `Using ${algorithm} with ${rounds} rounds${rounds > 1 ? '' : ' (consider more rounds for better security)'}.`;
}

app.get('/api/generate-password', customRateLimit(15 * 60 * 1000, 15), (req, res) => {
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

app.get('/api/history', customRateLimit(15 * 60 * 1000, 20), async (req, res) => {
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
