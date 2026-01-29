const express = require("express");
const router = express.Router();
const RazorPayController = require("../controller/razorPayController");
const db = require("../Database");

router.post("/createorder", RazorPayController.createOrder);

// Save subscription purchase after successful payment
router.post("/save-subscription", async (req, res) => {
    const { userId, subId, paymentId, orderId } = req.body;

    // Validate required fields
    if (!userId || !subId) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields (userId, subId)"
        });
    }

    try {
        // Check if user already has an active subscription
        const [existingSub] = await db.query(
            `SELECT * FROM Sub_Purchase_Table 
       WHERE Userid = ? AND Status = 'active' AND End_date >= CURDATE()`,
            [userId]
        );

        if (existingSub.length > 0) {
            return res.status(400).json({
                success: false,
                message: "You already have an active subscription"
            });
        }

        // Get subscription details to calculate end date
        const [subDetails] = await db.query(
            `SELECT SubDuration FROM SubscriptionTable WHERE SubId = ?`,
            [subId]
        );

        if (subDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subscription plan not found"
            });
        }

        const durationMonths = subDetails[0].SubDuration;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + durationMonths);

        // Insert the subscription purchase
        await db.query(
            `INSERT INTO Sub_Purchase_Table 
       (Userid, SubId, Status, Start_date, End_date, PaymentId, OrderId)
       VALUES (?, ?, 'active', ?, ?, ?, ?)`,
            [userId, subId, startDate, endDate, paymentId || null, orderId || null]
        );

        res.json({
            success: true,
            message: "Subscription purchased successfully",
            subscription: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                durationMonths
            }
        });

    } catch (err) {
        console.error("Save subscription error:", err);

        // Handle case where PaymentId/OrderId columns don't exist
        if (err.code === 'ER_BAD_FIELD_ERROR') {
            try {
                // Retry without PaymentId and OrderId columns
                const durationMonths = (await db.query(
                    `SELECT SubDuration FROM SubscriptionTable WHERE SubId = ?`,
                    [subId]
                ))[0][0].SubDuration;

                const startDate = new Date();
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + durationMonths);

                await db.query(
                    `INSERT INTO Sub_Purchase_Table 
           (Userid, SubId, Status, Start_date, End_date)
           VALUES (?, ?, 'active', ?, ?)`,
                    [userId, subId, startDate, endDate]
                );

                return res.json({
                    success: true,
                    message: "Subscription purchased successfully",
                    subscription: {
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                        durationMonths
                    }
                });
            } catch (fallbackErr) {
                console.error("Fallback save error:", fallbackErr);
                return res.status(500).json({
                    success: false,
                    message: "Database error while saving subscription"
                });
            }
        }

        res.status(500).json({
            success: false,
            message: "Database error while saving subscription"
        });
    }
});

module.exports = router;
