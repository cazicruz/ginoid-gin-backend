// /c:/Users/ADMIN/Documents/ginoid-Gin/models/Transaction.js
// Sequelize model for storing in-app and 3rd-party transactions

module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define(
        'Transaction',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },

            // optional relation to your users table
            userId: {
                type: DataTypes.UUID,
                allowNull: true,
                comment: 'Reference to local user (nullable for guest/third-party)',
            },

            // type/channel of the transaction
            channel: {
                type: DataTypes.ENUM('in_app', 'third_party'),
                allowNull: false,
                defaultValue: 'in_app',
            },

            // provider info for third-party (e.g., Stripe, PayPal)
            provider: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
            providerTransactionId: {
                type: DataTypes.STRING(128),
                allowNull: true,
                comment: 'ID returned by 3rd-party provider',
            },

            // basic monetary fields (store as decimal to avoid precision loss)
            amount: {
                type: DataTypes.DECIMAL(20, 8),
                allowNull: false,
                comment: 'Gross amount (positive for credits to platform, negative for debits)',
            },
            currency: {
                type: DataTypes.STRING(3),
                allowNull: false,
                defaultValue: 'USD',
            },
            feeAmount: {
                type: DataTypes.DECIMAL(20, 8),
                allowNull: true,
            },
            netAmount: {
                type: DataTypes.DECIMAL(20, 8),
                allowNull: true,
                comment: 'amount - feeAmount (store for convenience or compute on write)',
            },

            // direction & business meaning
            direction: {
                type: DataTypes.ENUM('credit', 'debit'),
                allowNull: false,
            },
            purpose: {
                type: DataTypes.STRING(128),
                allowNull: true,
                comment: 'business purpose e.g. purchase, refund, payout',
            },

            // lifecycle / status
            status: {
                type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending',
            },

            // raw payloads & extra metadata
            metadata: {
                type: DataTypes.JSONB || DataTypes.JSON,
                allowNull: true,
                comment: 'free-form JSON for app-specific data',
            },
            providerResponse: {
                type: DataTypes.JSONB || DataTypes.JSON,
                allowNull: true,
                comment: 'raw response from provider (if applicable)',
            },

            processedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: 'transactions',
            underscored: true,
            timestamps: true,
            indexes: [
                { fields: ['user_id'] },
                { fields: ['status'] },
                { fields: ['channel'] },
                {
                    unique: true,
                    fields: ['provider', 'provider_transaction_id'],
                    where: { provider: { [sequelize.Sequelize.Op.ne]: null } },
                    name: 'ux_provider_provider_txn_id',
                },
            ],
        }
    );

    Transaction.associate = (models) => {
        // Example associations - enable if you have a User model
        // Transaction.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return Transaction;
};