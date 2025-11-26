/**
 * @swagger
 * components:
 *   schemas:
 *     DataPlan:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         planId:
 *           type: number
 *           description: Unique plan identifier
 *         plan:
 *           type: string
 *           description: Plan description
 *         network:
 *           type: string
 *           enum: [MTN, AIRTEL, 9MOBILE, GLO]
 *           description: Network provider
 *         type:
 *           type: string
 *           enum: [SME, Corporate, Gifting]
 *           description: Plan type
 *         size:
 *           type: string
 *           description: Data bundle size (e.g., "500MB", "1GB")
 *         validity:
 *           type: number
 *           description: Validity period in days
 *         prices:
 *           type: object
 *           properties:
 *             user:
 *               type: number
 *               description: Price for regular users
 *             agent:
 *               type: number
 *               description: Price for agents
 *             vendor:
 *               type: number
 *               description: Price for vendors
 *         isActive:
 *           type: boolean
 *           description: Whether the plan is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Transaction reference
 *         user:
 *           type: string
 *           description: User ID
 *         direction:
 *           type: string
 *           enum: [debit, credit]
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *         purpose:
 *           type: string
 *           enum: [data_purchase, airtime_purchase, wallet_funding]
 *         channel:
 *           type: string
 *           enum: [in_app, bank_transfer, card]
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *         code:
 *           type: string
 *           description: Error code
 *         statusCode:
 *           type: number
 *           description: HTTP status code
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: Data Plans
 *     description: Data plan management endpoints
 *   - name: OTAPAY
 *     description: VTU service endpoints for airtime and data purchases
 */

/**
 * @swagger
 * /dataplan:
 *   get:
 *     summary: Get all data plans
 *     tags: [Data Plans]
 *     parameters:
 *       - in: query
 *         name: network
 *         schema:
 *           type: string
 *           enum: [MTN, AIRTEL, 9MOBILE, GLO]
 *         description: Filter by network provider
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SME, Corporate, Gifting]
 *         description: Filter by plan type
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *     responses:
 *       200:
 *         description: List of data plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 79
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataPlan'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /dataplan/{planId}:
 *   get:
 *     summary: Get data plan by plan ID
 *     tags: [Data Plans]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: number
 *         description: The plan ID (e.g., 57, 58, 69)
 *     responses:
 *       200:
 *         description: Data plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DataPlan'
 *       404:
 *         description: Plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /dataplan/object/{planObjectId}:
 *   get:
 *     summary: Get data plan by MongoDB ObjectId
 *     tags: [Data Plans]
 *     parameters:
 *       - in: path
 *         name: planObjectId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the plan
 *     responses:
 *       200:
 *         description: Data plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DataPlan'
 *       404:
 *         description: Plan not found
 */

/**
 * @swagger
 * /dataplan:
 *   post:
 *     summary: Create a new data plan (Admin only)
 *     tags: [Data Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - plan
 *               - network
 *               - type
 *               - size
 *               - validity
 *               - prices
 *             properties:
 *               planId:
 *                 type: number
 *                 example: 176
 *               plan:
 *                 type: string
 *                 example: "MTN 20GB (SME) (30 days)"
 *               network:
 *                 type: string
 *                 enum: [MTN, AIRTEL, 9MOBILE, GLO]
 *                 example: "MTN"
 *               type:
 *                 type: string
 *                 enum: [SME, Corporate, Gifting]
 *                 example: "SME"
 *               size:
 *                 type: string
 *                 example: "20GB"
 *               validity:
 *                 type: number
 *                 example: 30
 *               prices:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: number
 *                     example: 13000
 *                   agent:
 *                     type: number
 *                     example: 12900
 *                   vendor:
 *                     type: number
 *                     example: 12800
 *     responses:
 *       201:
 *         description: Data plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DataPlan'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /dataplan/{planId}:
 *   put:
 *     summary: Update a data plan (Admin only)
 *     tags: [Data Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: number
 *         description: The plan ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prices:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: number
 *                   agent:
 *                     type: number
 *                   vendor:
 *                     type: number
 *               isActive:
 *                 type: boolean
 *               plan:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DataPlan'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Plan not found
 */

/**
 * @swagger
 * /dataplan/deactivate/{planId}:
 *   patch:
 *     summary: Deactivate a data plan (Admin only)
 *     tags: [Data Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: number
 *         description: The plan ID to deactivate
 *     responses:
 *       200:
 *         description: Data plan deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DataPlan'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Plan not found
 */

/**
 * @swagger
 * /dataplan/activate/{planId}:
 *   patch:
 *     summary: Activate a data plan (Admin only)
 *     tags: [Data Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: number
 *         description: The plan ID to activate
 *     responses:
 *       200:
 *         description: Data plan activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DataPlan'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Plan not found
 */

/**
 * @swagger
 * /otapay/purchase-data:
 *   post:
 *     summary: Purchase data bundle
 *     tags: [OTAPAY]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - network
 *               - data_plan
 *               - planObjectId
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "08012345678"
 *                 description: Phone number to receive the data
 *               network:
 *                 type: string
 *                 enum: [MTN, AIRTEL, 9MOBILE, GLO]
 *                 example: "MTN"
 *                 description: Network provider
 *               data_plan:
 *                 type: number
 *                 example: 57
 *                 description: Data plan ID from OTAPAY
 *               planObjectId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *                 description: MongoDB ObjectId of the data plan
 *     responses:
 *       200:
 *         description: Data bundle purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Data bundle purchased successfully"
 *                 data:
 *                   type: object
 *                   description: Response from OTAPAY service
 *       400:
 *         description: Insufficient wallet balance or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               insufficient_balance:
 *                 value:
 *                   success: false
 *                   message: "Insufficient wallet balance"
 *                   code: "INSUFFICIENT_WALLET_BALANCE"
 *                   statusCode: 400
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Data plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Data plan not found"
 *               code: "DATA_PLAN_NOT_FOUND"
 *               statusCode: 404
 *       503:
 *         description: OTAPAY service unavailable
 */

/**
 * @swagger
 * /otapay/purchase-airtime:
 *   post:
 *     summary: Purchase airtime
 *     tags: [OTAPAY]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - network
 *               - amount
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "08012345678"
 *                 description: Phone number to receive the airtime
 *               network:
 *                 type: string
 *                 enum: [MTN, AIRTEL, 9MOBILE, GLO]
 *                 example: "MTN"
 *                 description: Network provider
 *               amount:
 *                 type: number
 *                 example: 500
 *                 description: Airtime amount in Naira
 *               airtime_type:
 *                 type: string
 *                 enum: [VTU, SHARE_AND_SELL]
 *                 default: "VTU"
 *                 example: "VTU"
 *                 description: Type of airtime purchase
 *     responses:
 *       200:
 *         description: Airtime purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Airtime purchased successfully"
 *                 data:
 *                   type: object
 *                   description: Response from OTAPAY service
 *       400:
 *         description: Insufficient wallet balance or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized - Authentication required
 *       503:
 *         description: OTAPAY service unavailable
 */

/**
 * @swagger
 * /otapay/transaction-status:
 *   get:
 *     summary: Check transaction status
 *     tags: [OTAPAY]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: transaction_ref
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction reference ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Transaction status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction status retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [pending, completed, failed]
 *                       example: "completed"
 *                     reference:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *       400:
 *         description: Transaction reference is missing
 *       401:
 *         description: Unauthorized - Authentication required
 *       503:
 *         description: OTAPAY service unavailable
 */

/**
 * @swagger
 * /otapay/wallet-balance:
 *   get:
 *     summary: Get OTAPAY wallet balance
 *     tags: [OTAPAY]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Wallet balance retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 50000
 *                     currency:
 *                       type: string
 *                       example: "NGN"
 *       401:
 *         description: Unauthorized - Authentication required
 *       503:
 *         description: OTAPAY service unavailable
 */

module.exports = {};