// const mongoose = require('mongoose');
// const User = require('./models/User');
// const Provider = require('./models/Provider');
// require('dotenv').config();

// const setupDatabase = async () => {
//   try {
//     console.log('🚀 Setting up VTU Application Database...\n');

//     // Connect to MongoDB
//     const mongoURI = process.env.MONGODB_URI;
//     if (!mongoURI) {
//       console.error('❌ MONGODB_URI not found in environment variables');
//       console.log('📝 Please create a .env file with your MongoDB connection string');
//       process.exit(1);
//     }

//     await mongoose.connect(mongoURI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log('✅ Connected to MongoDB\n');

//     // Clear existing data (optional - comment out if you want to keep existing data)
//     console.log('🧹 Clearing existing data...');
//     await User.deleteMany({});
//     await Provider.deleteMany({});
//     console.log('✅ Existing data cleared\n');

//     // Create sample providers
//     console.log('📡 Creating sample VTU providers...');
    
//     const providers = [
//       {
//         name: 'VTPass',
//         code: 'VTPASS',
//         type: 'multipurpose',
//         services: [
//           'mtn_airtime', 'airtel_airtime', 'glo_airtime', '9mobile_airtime',
//           'mtn_data', 'airtel_data', 'glo_data', '9mobile_data',
//           'dstv', 'gotv', 'startimes', 'showmax',
//           'ikeja_electric', 'eko_electric', 'kano_electric', 'kaduna_electric'
//         ],
//         description: 'Leading VTU service provider in Nigeria',
//         apiConfig: {
//           baseUrl: 'https://vtpass.com/api',
//           apiKey: 'your_vtpass_api_key',
//           secretKey: 'your_vtpass_secret_key',
//           timeout: 30000
//         },
//         pricing: {
//           commission: 2.5,
//           markup: 0,
//           minimumAmount: 50,
//           maximumAmount: 50000,
//           fee: 0
//         },
//         dataPlans: [
//           {
//             name: 'MTN 1GB',
//             size: '1GB',
//             validity: '30 days',
//             price: 250,
//             providerPrice: 245,
//             isActive: true,
//             description: 'MTN 1GB data plan valid for 30 days'
//           },
//           {
//             name: 'Airtel 2GB',
//             size: '2GB',
//             validity: '30 days',
//             price: 450,
//             providerPrice: 440,
//             isActive: true,
//             description: 'Airtel 2GB data plan valid for 30 days'
//           }
//         ],
//         cablePackages: [
//           {
//             name: 'DSTV Premium',
//             code: 'DSTV_PREMIUM',
//             price: 24500,
//             providerPrice: 24000,
//             isActive: true,
//             description: 'DSTV Premium package with all channels'
//           },
//           {
//             name: 'GOTV Max',
//             code: 'GOTV_MAX',
//             price: 8200,
//             providerPrice: 8000,
//             isActive: true,
//             description: 'GOTV Max package'
//           }
//         ]
//       },
//       {
//         name: 'QuickTeller',
//         code: 'QUICKTELLER',
//         type: 'multipurpose',
//         services: [
//           'mtn_airtime', 'airtel_airtime', 'glo_airtime', '9mobile_airtime',
//           'mtn_data', 'airtel_data', 'glo_data', '9mobile_data'
//         ],
//         description: 'Reliable airtime and data provider',
//         apiConfig: {
//           baseUrl: 'https://quickteller.com/api',
//           apiKey: 'your_quickteller_api_key',
//           secretKey: 'your_quickteller_secret_key',
//           timeout: 25000
//         },
//         pricing: {
//           commission: 2.0,
//           markup: 0,
//           minimumAmount: 100,
//           maximumAmount: 100000,
//           fee: 0
//         }
//       }
//     ];

//     for (const providerData of providers) {
//       const provider = new Provider(providerData);
//       await provider.save();
//       console.log(`✅ Created provider: ${provider.name}`);
//     }

//     // Create sample admin user
//     console.log('\n👤 Creating sample admin user...');
//     const adminUser = new User({
//       firstName: 'Admin',
//       lastName: 'User',
//       email: 'admin@vtuapp.com',
//       phone: '08012345678',
//       password: 'Admin123!',
//       role: 'admin',
//       isVerified: true,
//       referralCode: 'REFADMIN001'
//     });

//     await adminUser.save();
//     console.log('✅ Created admin user: admin@vtuapp.com / Admin123!');

//     // Create sample regular user
//     console.log('\n👤 Creating sample regular user...');
//     const regularUser = new User({
//       firstName: 'John',
//       lastName: 'Doe',
//       email: 'john.doe@example.com',
//       phone: '08087654321',
//       password: 'Password123!',
//       role: 'user',
//       isVerified: true,
//       wallet: {
//         balance: 10000,
//         currency: 'NGN'
//       },
//       referralCode: 'REFUSER001'
//     });

//     await regularUser.save();
//     console.log('✅ Created regular user: john.doe@example.com / Password123!');

//     console.log('\n🎉 Database setup completed successfully!');
//     console.log('\n📋 Sample credentials:');
//     console.log('   Admin: admin@vtuapp.com / Admin123!');
//     console.log('   User: john.doe@example.com / Password123!');
//     console.log('\n🚀 You can now start the application with: npm run dev');

//   } catch (error) {
//     console.error('❌ Setup failed:', error.message);
//     process.exit(1);
//   } finally {
//     await mongoose.disconnect();
//     console.log('\n🔌 Disconnected from MongoDB');
//   }
// };

// // Run setup if this file is executed directly
// if (require.main === module) {
//   setupDatabase();
// }

// module.exports = setupDatabase; 