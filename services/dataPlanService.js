// services/dataPlanService.js
const DataPlan = require('../models/DataPlan');
const apiError = require('../utils/apiError');

class DataPlanService {
  async getAllPlans(filters = {}) {
    const query = { isActive: true };
    
    if (filters.network) {
      query.network = filters.network.toUpperCase();
    }
    
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.minPrice) {
      query['price'] = { $gte: parseInt(filters.minPrice) };
    }
    
    if (filters.maxPrice) {
      query['price'] = { 
        ...query['price'], 
        $lte: parseInt(filters.maxPrice) 
      };
    }
    
    const plans = await DataPlan.find(query).sort({ 'price': 1 });
    return plans;
  }

  async getPlanById(planId) {
    const plan = await DataPlan.findOne({ planId, isActive: true });
    if (!plan) {
      throw apiError('Plan not found', 404, 'PLAN_NOT_FOUND');
    }
    return plan;
  }

  async getPlanByMongoId(id) {
    const plan = await DataPlan.findById(id);
    if (!plan) {
      throw apiError('Plan not found', 404, 'PLAN_NOT_FOUND');
    }
    return plan;
  }

  async getPlansByNetwork(network) {
    return await DataPlan.findByNetwork(network);
  }

  async getPlansByType(type) {
    return await DataPlan.findByType(type);
  }

  async getPlansByNetworkAndType(network, type) {
    return await DataPlan.findByNetworkAndType(network, type);
  }

  async createPlan(planData) {
    const plan = new DataPlan(planData);
    await plan.save();
    return plan;
  }

  async updatePlan(planId, updates) {
    const allowedUpdates = ['price', 'isActive', 'plan'];
    const updateKeys = Object.keys(updates);
    
    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));
    if (!isValidUpdate) {
      throw apiError('Invalid updates', 400, 'INVALID_UPDATES');
    }

    const plan = await DataPlan.findOneAndUpdate(
      { planId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!plan) {
      throw apiError('Plan not found', 404, 'PLAN_NOT_FOUND');
    }

    return plan;
  }

  async bulkUpdatePrices(updates) {
    // updates: [{ planId: 57, prices: { user: 330, agent: 329, vendor: 328 } }]
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { planId: update.planId },
        update: { $set: { price: update.price } }
      }
    }));

    const result = await DataPlan.bulkWrite(bulkOps);
    return result;
  }

  async deactivatePlan(planId) {
    return await this.updatePlan(planId, { isActive: false });
  }

  async activatePlan(planId) {
    return await this.updatePlan(planId, { isActive: true });
  }

  async searchPlans(searchTerm) {
    const plans = await DataPlan.find({
      isActive: true,
      $or: [
        { plan: { $regex: searchTerm, $options: 'i' } },
        { network: { $regex: searchTerm, $options: 'i' } },
        { type: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    return plans;
  }
}

module.exports = new DataPlanService();