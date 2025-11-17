# B-Classy e-comm Application Backend

A comprehensive Node.js backend application for Virtual Top-Up (VTU) services in Nigeria. This application provides APIs for airtime purchase, data plans, cable TV subscriptions, electricity payments, and wallet management.

## 🚀 Features

### Core Services
- **Items Purchase**: MTN, Airtel, Glo, 9mobile
- **payment Enabled**: DSTV, GOTV, Startimes, Showmax

### Security & Authentication
- JWT-based authentication
- Password encryption with bcrypt
- Account lockout protection
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers

### Database & Performance
- MongoDB with Mongoose ODM
- Optimized database indexes
- Transaction management
- Performance monitoring
- Data validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vtu-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/vtu_app
   MONGODB_URI_PROD=mongodb+srv://your_username:your_password@cluster.mongodb.net/vtu_app

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Payment Gateway Configuration
   FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
   FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
   PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key

   # VTU Provider API Keys
   VTPASS_USERNAME=your_vtpass_username
   VTPASS_PASSWORD=your_vtpass_password
   VTPASS_API_URL=https://vtpass.com/api

   # Security
   SESSION_SECRET=your_session_secret_key_change_this
   BCRYPT_ROUNDS=12

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "08012345678",
  "password": "Password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "Password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### VTU Service Endpoints

#### Purchase Airtime
```http
POST /api/vtu/airtime
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "08012345678",
  "amount": 1000,
  "provider": "mtn",
  "paymentMethod": "wallet"
}
```

#### Purchase Data
```http
POST /api/vtu/data
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "08012345678",
  "provider": "mtn",
  "planId": "plan_id_here",
  "paymentMethod": "wallet"
}
```

#### Pay Cable TV
```http
POST /api/vtu/cable
Authorization: Bearer <token>
Content-Type: application/json

{
  "smartCardNumber": "12345678901",
  "provider": "dstv",
  "package": "premium",
  "months": 1,
  "amount": 24500,
  "paymentMethod": "wallet"
}
```

#### Pay Electricity
```http
POST /api/vtu/electricity
Authorization: Bearer <token>
Content-Type: application/json

{
  "meterNumber": "12345678901",
  "provider": "ikeja_electric",
  "meterType": "prepaid",
  "amount": 5000,
  "paymentMethod": "wallet"
}
```

### Wallet Endpoints

#### Get Balance
```http
GET /api/wallet/balance
Authorization: Bearer <token>
```

#### Fund Wallet
```http
POST /api/wallet/fund
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000,
  "paymentMethod": "card"
}
```

#### Withdraw from Wallet
```http
POST /api/wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "bankCode": "044",
  "accountNumber": "1234567890",
  "accountName": "John Doe"
}
```

#### Get Transactions
```http
GET /api/wallet/transactions?page=1&limit=20&type=airtime
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### User Model
- Personal information (name, email, phone)
- Wallet balance and currency
- Authentication details
- Account status and verification
- Security features (login attempts, lockout)

### Transaction Model
- Transaction details (type, service, amount)
- Payment information
- Provider responses
- Status tracking
- Error handling
- Refund management

### Provider Model
- Provider configuration
- API settings
- Pricing and commission
- Service availability
- Performance metrics

## 🔧 Configuration

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port number

### Payment Gateway Integration
The application supports multiple payment gateways:
- Flutterwave
- Paystack
- Bank transfers
- USSD payments

### VTU Provider Integration
- VTPass API
- Custom provider APIs
- Mock providers for testing

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB
3. Set secure JWT secret
4. Configure payment gateway keys
5. Set up SSL certificates
6. Configure reverse proxy (nginx)

### Docker Deployment
```bash
# Build image
docker build -t vtu-app .

# Run container
docker run -p 3000:3000 --env-file .env vtu-app
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring

### Health Check
```http
GET /api/health
```

### Performance Metrics
- Transaction success rates
- Response times
- Error rates
- Provider performance

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Account lockout protection
- Rate limiting
- Input validation and sanitization
- CORS protection
- Security headers with Helmet
- Session management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@vtuapp.com

## 🔄 Changelog

### v1.0.0
- Initial release
- Basic VTU services
- Wallet management
- Authentication system
- API documentation

## 📞 Contact

- **Email**: info@vtuapp.com
- **Phone**: +234 123 456 7890
- **Website**: https://vtuapp.com

---

**Note**: This is a development version. For production use, ensure all security measures are properly configured and tested. 