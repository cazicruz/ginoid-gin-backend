/**
 * @swagger
 * /api/transactions/transfer:
 *   post:
 *     summary: Transfer balance between users
 *     description: Transfer wallet balance from authenticated user to another user using their GIN ID
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientGinId
 *               - amount
 *             properties:
 *               recipientGinId:
 *                 type: string
 *                 description: The GIN ID of the recipient user
 *                 example: "GIN123456789"
 *               amount:
 *                 type: number
 *                 format: double
 *                 minimum: 0.01
 *                 description: Amount to transfer (must be greater than zero)
 *                 example: 1000.50
 *     responses:
 *       200:
 *         description: Transfer completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Transfer completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     senderTransaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     recipientTransaction:
 *                       $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recipient not found
 *       500:
 *         description: Internal server error
 */
