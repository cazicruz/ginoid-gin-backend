# 🚀 Quick Start Guide - B-Classy e-comm Application

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (free tier works)

## Step 1: Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Whitelist your IP address

## Step 2: Environment Setup
1. Copy the environment template:
   ```bash
   cp env.template .env
   ```

2. Edit `.env` file with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/vtu_app
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   ```

## Step 3: Install Dependencies
```bash
npm install
```

## Step 4: Set Up Database
```bash
npm run setup
```

This will create:
- Sample VTU providers
- Admin user: `admin@vtuapp.com` / `Admin123!`
- Regular user: `john.doe@example.com` / `Password123!`

## Step 5: Start the Application
```bash
npm run dev
```

The API will be available at: `http://localhost:3000/api`

## 🧪 Test the API

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "08012345678",
    "password": "Password123!"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### 4. Get Wallet Balance
```bash
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile

### VTU Services
- `POST /api/vtu/airtime` - Purchase airtime
- `POST /api/vtu/data` - Purchase data
- `POST /api/vtu/cable` - Pay cable TV
- `POST /api/vtu/electricity` - Pay electricity

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/fund` - Fund wallet
- `POST /api/wallet/withdraw` - Withdraw from wallet
- `GET /api/wallet/transactions` - Get transaction history

## 🔧 Troubleshooting

### Database Connection Issues
- Check your MongoDB Atlas connection string
- Ensure your IP is whitelisted in Atlas
- Verify username and password are correct

### Port Already in Use
- Change the PORT in your .env file
- Or kill the process using the port

### Module Not Found Errors
- Run `npm install` again
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## 📚 Next Steps

1. **Add Real Payment Gateways**: Integrate Flutterwave or Paystack
2. **Add Real VTU Providers**: Connect to actual VTU APIs
3. **Add Email Service**: Set up email notifications
4. **Add SMS Service**: Set up SMS notifications
5. **Build Frontend**: Create web or mobile app
6. **Add Admin Dashboard**: Create admin interface

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Create an issue in the repository
- Contact: support@vtuapp.com

---

**Happy Coding! 🎉** 