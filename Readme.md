# 🔒 Password Guardian

*A comprehensive password strength analyzer with security insights and admin tools*


## ✨ Features

### 🔍 Core Analysis
- **Real-time strength testing** (zxcvbn algorithm)
- **Visual strength meter** with color-coded feedback
- **Password rarity check** against 10K+ common passwords
- **Hashing simulation** (demonstrates secure storage)


### 🛠️ User Tools
- **One-click password generator**
- **Copy to clipboard** button for generated passwords
- **Meme-powered feedback** for weak passwords
- **Test history** (last 20 analyzed passwords)


### ⚙️ Admin Features
- **Dashboard** with password stats visualization
- **Common password database** management
- **Rate limiting** (prevents brute-force attacks)


## 🚀 Quick Start

1. **Clone & Install**  
   ```bash
   git clone https://github.com/shahedahmed0/PasswordTester.git
   cd PasswordTester
   npm install
   cd frontend && npm install
   ```

2. **Configure Environment**  
   Create `.env` with:
   ```env
   MONGODB_URI=mongodb+srv://burnedwanderer:404051@passwordapp.gfveem3.mongodb.net/?retryWrites=true&w=majority&appName=PasswordApp
   PORT=5000
   ```

3. **Run**  
   ```bash
   node app.js       # Backend
   cd frontend && npm start  # Frontend
   ```
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`



## 🛡️ Technical Stack
- **Frontend**: React, Chart.js, CSS-in-JS
- **Backend**: Node.js, Express
- **Database**: MongoDB (Atlas)
- **Security**: Rate limiting, no password storage


## 🌟 Why This Project?
- **Educational**: Demonstrates password security principles
- **Practical**: Ready-to-deploy analysis tool
- **Extensible**: Modular design for new features
