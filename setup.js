const mongoose = require('mongoose');
const DataPlan = require('./models/DataPlan');
require('dotenv').config();

const parseDataPlan = (planString) => {
  // Parse "MTN 500MB (SME) (30 days)" into components
  const networkMatch = planString.match(/^(MTN|AIRTEL|9MOBILE|GLO)/);
  const sizeMatch = planString.match(/(\d+\.?\d*\s?(MB|GB))/);
  const typeMatch = planString.match(/\((SME|Corporate|Gifting)\)/);
  const validityMatch = planString.match(/\((\d+)\s+days?\)/);

  return {
    network: networkMatch ? networkMatch[1] : null,
    size: sizeMatch ? sizeMatch[1] : null,
    type: typeMatch ? typeMatch[1] : null,
    validity: validityMatch ? parseInt(validityMatch[1]) : null
  };
};

const dataPlanData = [
  { planId: 57, plan: "MTN 500MB (SME) (30 days)", user: 329 },
  { planId: 58, plan: "MTN 1GB (SME) (30 days)", user: 655 },
  { planId: 69, plan: "MTN 2GB (SME) (30 days)", user: 1308 },
  { planId: 70, plan: "MTN 3GB (SME) (30 days)", user: 1961 },
  { planId: 71, plan: "MTN 5GB (SME) (30 days)", user: 3315 },
  { planId: 72, plan: "MTN 10GB (SME) (30 days)", user: 6630 },
  { planId: 75, plan: "MTN 150.0 MB (Corporate) (30 days)", user: 60 },
  { planId: 76, plan: "MTN 250.0 MB (Corporate) (30 days)", user: 87 },
  { planId: 77, plan: "MTN 500.0 MB (Corporate) (30 days)", user: 170 },
  { planId: 78, plan: "MTN 1.0 GB (Corporate) (30 days)", user: 339 },
  { planId: 85, plan: "MTN 2.0 GB (Corporate) (30 days)", user: 677 },
  { planId: 86, plan: "MTN 3.0 GB (Corporate) (30 days)", user: 1016 },
  { planId: 87, plan: "MTN 5.0 GB (Corporate) (30 days)", user: 1692 },
  { planId: 88, plan: "MTN 20.0 GB (Corporate) (30 days)", user: 6768 },
  { planId: 91, plan: "AIRTEL 500.0 MB (Corporate) (7 days)", user: 530 },
  { planId: 92, plan: "AIRTEL 1.0 GB (Corporate) (7 days)", user: 828 },
  { planId: 94, plan: "AIRTEL 2.0 GB (Corporate) (30 days)", user: 1540 },
  { planId: 95, plan: "AIRTEL 3.0 GB (Corporate) (30 days)", user: 2048 },
  { planId: 98, plan: "9MOBILE 500.0 MB (Corporate) (30 days)", user: 154 },
  { planId: 99, plan: "9MOBILE 1.0 GB (Corporate) (30 days)", user: 305 },
  { planId: 100, plan: "9MOBILE 1.5 GB (Corporate) (30 days)", user: 457 },
  { planId: 101, plan: "9MOBILE 2.0 GB (Corporate) (30 days)", user: 610 },
  { planId: 102, plan: "9MOBILE 3.0 GB (Corporate) (30 days)", user: 915 },
  { planId: 103, plan: "9MOBILE 4.0 GB (Corporate) (30 days)", user: 1220 },
  { planId: 105, plan: "9MOBILE 5.0 GB (Corporate) (30 days)", user: 1525 },
  { planId: 108, plan: "GLO 200.0 MB (Corporate) (14 days)", user: 83 },
  { planId: 109, plan: "GLO 500.0 MB (Corporate) (30 days)", user: 206 },
  { planId: 110, plan: "GLO 1.0 GB (Corporate) (30 days)", user: 409 },
  { planId: 111, plan: "GLO 2.0 GB (Corporate) (30 days)", user: 813 },
  { planId: 112, plan: "GLO 3.0 GB (Corporate) (30 days)", user: 1220 },
  { planId: 113, plan: "GLO 5.0 GB (Corporate) (30 days)", user: 2034 },
  { planId: 114, plan: "GLO 10.0 GB (Corporate) (30 days)", user: 4068 },
  { planId: 115, plan: "AIRTEL 10.0 GB (Corporate) (30 days)", user: 4082 },
  { planId: 118, plan: "MTN 110.0 MB (Gifting) (1 days)", user: 101 },
  { planId: 121, plan: "AIRTEL 25.0 GB (Corporate) (30 days)", user: 8150 },
  { planId: 122, plan: "AIRTEL 150.0 MB (SME) (1 days)", user: 58 },
  { planId: 125, plan: "AIRTEL 1.0 GB (SME) (3 days)", user: 345 },
  { planId: 127, plan: "AIRTEL 3.0 GB (SME) (7 days)", user: 1031 },
  { planId: 128, plan: "AIRTEL 7.0 GB (SME) (7 days)", user: 2048 },
  { planId: 129, plan: "GLO 750 MB (SME) (1 days)", user: 194 },
  { planId: 130, plan: "GLO 1.5 GB (SME) (1 days)", user: 295 },
  { planId: 131, plan: "GLO 2.5 GB (SME) (2 days)", user: 482 },
  { planId: 132, plan: "GLO 10.0 GB (SME) (7 days)", user: 1906 },
  { planId: 133, plan: "AIRTEL 10.0 GB (SME) (30 days)", user: 3065 },
  { planId: 135, plan: "MTN 40.0 GB (Corporate) (30 days)", user: 13056},
  { planId: 141, plan: "MTN 500.0 MB (Gifting) (1 days)", user: 345},
  { planId: 142, plan: "MTN 1.0 GB (Gifting) (1 days)", user: 493 },
  { planId: 144, plan: "MTN 2.5 GB (Gifting) (2 days)", user: 896 },
  { planId: 145, plan: "MTN 3.2 GB (Gifting) (2 days)", user: 996 },
  { planId: 146, plan: "MTN 6.0 GB (Gifting) (7 days)", user: 2466 },
  { planId: 147, plan: "MTN 7.0 GB (Gifting) (30 days)", user: 3452 },
  { planId: 148, plan: "MTN 1.5 GB (Gifting) (2 days)", user: 591 },
  { planId: 149, plan: "MTN 1.0 GB (Gifting) (7 days)", user: 789 },
  { planId: 150, plan: "MTN 2.0 GB (Gifting) (30 days)", user: 1479 },
  { planId: 151, plan: "MTN 2.7 GB (Gifting) (30 days)", user: 1972 },
  { planId: 152, plan: "MTN 3.5 GB (Gifting) (30 days)", user: 2466 },
  { planId: 153, plan: "MTN 10.0 GB (Gifting) (30 days)", user: 4439 },
  { planId: 154, plan: "MTN 12.5 GB (Gifting) (30 days)", user: 5425 },
  { planId: 155, plan: "MTN 14.5 GB (Gifting) (30 days)", user: 4932 },
  { planId: 156, plan: "MTN 16.5 GB (Gifting) (30 days)", user: 6412 },
  { planId: 157, plan: "MTN 40.0 GB (Gifting) (60 days)", user: 8969 },
  { planId: 158, plan: "MTN 36.0 GB (Gifting) (30 days)", user: 10851 },
  { planId: 159, plan: "MTN 75.0 GB (Gifting) (30 days)", user: 17756 },
  { planId: 160, plan: "MTN 90.0 GB (Gifting) (60 days)", user: 24916 },
  { planId: 161, plan: "MTN 165.0 GB (Gifting) (30 days)", user: 34527 },
  { planId: 162, plan: "MTN 150.0 GB (Gifting) (60 days)", user: 39459 },
  { planId: 163, plan: "MTN 200.0 GB (Gifting) (30 days)", user: 49324 },
  { planId: 164, plan: "MTN 200.0 GB (Gifting) (60 days)", user: 49833 },
  { planId: 165, plan: "MTN 250.0 GB (Gifting) (30 days)", user: 54256 },
  { planId: 166, plan: "MTN 480.0 GB (Gifting) (90 days)", user: 88784 },
  { planId: 167, plan: "AIRTEL 60.0 GB (Corporate) (30 days)", user: 15269 },
  { planId: 168, plan: "9MOBILE 10.0 GB (Corporate) (30 days)", user: 3051},
  { planId: 169, plan: "9MOBILE 20.0 GB (Corporate) (30 days)", user: 6102 },
  { planId: 170, plan: "GLO 1.0 GB (Gifting) (3 days)", user: 274},
  { planId: 171, plan: "GLO 3.0 GB (Gifting) (3 days)", user: 823},
  { planId: 172, plan: "GLO 5.0 GB (Gifting) (3 days)", user: 1372 },
  { planId: 173, plan: "GLO 1.0 GB (Gifting) (7 days)", user: 320 },
  { planId: 174, plan: "GLO 3.0 GB (Gifting) (7 days)", user: 961 },
  { planId: 175, plan: "GLO 5.0 GB (Gifting) (7 days)", user: 1601 },
];

async function seedDataPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans (optional)
    await DataPlan.deleteMany({});
    console.log('Cleared existing plans');

    // Transform and insert data
    const plans = dataPlanData.map(item => {
      const parsed = parseDataPlan(item.plan);
      return {
        planId: item.planId,
        plan: item.plan,
        network: parsed.network,
        type: parsed.type,
        size: parsed.size,
        validity: parsed.validity,
        price: item.user,
         isActive: true
      };
    });

    await DataPlan.insertMany(plans);
    console.log(`Successfully seeded ${plans.length} data plans`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data plans:', error);
    process.exit(1);
  }
}

seedDataPlans();