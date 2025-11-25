const dataPlanService = require('../services/dataPlanService');
const catchAsync = require('../utils/catchAsync');
const {ApiError} = require('../utils/apiError');



const getAllDataPlans = catchAsync(async (req, res) => {
  const filters = {
    network: req.query.network,
    type: req.query.type,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
  };
  const plans = await dataPlanService.getAllPlans(filters);
    res.status(200).json({
      success: true,
      message: 'Data plans retrieved successfully',
      data: plans
    });
});

const getDataPlanById = catchAsync(async (req, res) => {
    const planId = parseInt(req.params.planId);
    const plan = await dataPlanService.getPlanById(planId);
    if(!plan){
      throw new ApiError('Data plan not found',404,'DATA_PLAN_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      message: 'Data plan retrieved successfully',
      data: plan
    });
});

const getDataPlanByObjectId = catchAsync(async (req, res) => {
    const planObjectId = req.params.planObjectId;
    const plan = await dataPlanService.getPlanByMongoId(planObjectId);
    if(!plan){
      throw new ApiError('Data plan not found',404,'DATA_PLAN_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      message: 'Data plan retrieved successfully',
      data: plan
    });
});

//admin only
const createDataPlan = catchAsync(async (req, res) => {
    const planData = req.body;
    const newPlan = await dataPlanService.createPlan(planData);
    res.status(201).json({
      success: true,
      message: 'Data plan created successfully',
      data: newPlan
    });
});

const updateDataPlan = catchAsync(async (req, res) => {
    const planId = req.params.planId;
    const updateData = req.body;
    const updatedPlan = await dataPlanService.updatePlan(planId, updateData);
    res.status(200).json({
      success: true,
      message: 'Data plan updated successfully',
      data: updatedPlan
    });
});


const deactivatePlan = catchAsync(async (req, res) => {
    const planId = req.params.planId;
    const deactivatedPlan = await dataPlanService.deactivatePlan(planId);
    res.status(200).json({
      success: true,
      message: 'Data plan deactivated successfully',
      data: deactivatedPlan
    });
});

const activatePlan = catchAsync(async (req, res) => {
    const planId = req.params.planId;
    const activatedPlan = await dataPlanService.activatePlan(planId);
    res.status(200).json({
      success: true,
      message: 'Data plan activated successfully',
      data: activatedPlan
    });
});

module.exports = {
  getAllDataPlans,
  getDataPlanById,
  getDataPlanByObjectId,
  createDataPlan,
  updateDataPlan,
  deactivatePlan,
  activatePlan
};