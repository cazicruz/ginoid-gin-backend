const mongoose = require('mongoose');

// models/Transaction.js
const { Schema } = mongoose;

const transactionSchema = new Schema(
    {
        // user reference (nullable for guest/third-party)
        user: { type: Schema.Types.ObjectId, ref: 'User', index: true },

        // channel/type
        channel: {
            type: String,
            enum: ['in_app', 'third_party'],
            required: true,
            default: 'in_app',
            index: true,
        },

        // third-party provider info
        provider: { type: String, maxlength: 64, required: false },
        providerTransactionId: { type: String, maxlength: 128, required: false },

        // monetary fields (Decimal128 to preserve precision)
        amount: { type: Schema.Types.Decimal128, required: true }, // gross amount
        currency: { type: String, required: true, default: 'NGN', maxlength: 3 },
        feeAmount: { type: Schema.Types.Decimal128, required: false },
        netAmount: { type: Schema.Types.Decimal128, required: false }, // amount - feeAmount

        // direction & business meaning
        direction: { type: String, enum: ['credit', 'debit'], required: true },
        purpose: { type: String, maxlength: 128, required: false },

        // lifecycle / status
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
            required: true,
            default: 'pending',
            index: true,
        },

        // raw payloads & extra metadata
        metadata: { type: Schema.Types.Mixed, required: false },
        providerResponse: { type: Schema.Types.Mixed, required: false },

        processedAt: { type: Date, required: false },
    },
    {
        collection: 'transactions',
        timestamps: true,
    }
);

// compute netAmount if missing before save
transactionSchema.pre('save', function (next) {
    try {
        const doc = this;

        function toNumber(val) {
            if (val == null) return 0;
            const s = typeof val === 'string' ? val : val.toString();
            const n = parseFloat(s);
            return Number.isFinite(n) ? n : 0;
        }

        if (doc.netAmount == null && doc.amount != null) {
            const amt = toNumber(doc.amount);
            const fee = toNumber(doc.feeAmount);
            const net = amt - fee;
            doc.netAmount = mongoose.Types.Decimal128.fromString(net.toString());
        }

        // set processedAt when transitioning to completed and not previously set
        if (doc.isModified('status') && doc.status === 'completed' && !doc.processedAt) {
            doc.processedAt = new Date();
        }

        next();
    } catch (err) {
        next(err);
    }
});

// indexes
transactionSchema.index({ user: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ channel: 1 });

// unique provider + providerTransactionId only when provider & providerTransactionId are present
transactionSchema.index(
    { provider: 1, providerTransactionId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            provider: { $exists: true, $ne: null },
            providerTransactionId: { $exists: true, $ne: null },
        },
        name: 'ux_provider_provider_txn_id',
    }
);

module.exports = mongoose.model('Transaction', transactionSchema);
