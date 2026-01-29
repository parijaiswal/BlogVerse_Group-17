const Razorpay = require('razorpay');
require("dotenv").config();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

const RazorPayController = {

    createOrder: async (req, res) => {
        try {
            console.log("REQ BODY:", req.body);

            const amount = Number(req.body.amount) * 100; // Convert to paise

            const options = {
                amount: amount,
                currency: "INR",
                receipt: "receipt_" + Date.now()
            };

            razorpayInstance.orders.create(options, (err, order) => {
                if (err) {
                    console.log("RAZORPAY ERROR:", err);
                    return res.status(400).send({
                        success: false,
                        msg: err.error ? err.error.description : "Failed to create order"
                    });
                }

                res.status(200).send({
                    success: true,
                    msg: "Order Created",
                    order_id: order.id,
                    amount: amount,
                    key_id: process.env.RAZORPAY_ID_KEY,
                    product_name: req.body.name,
                    description: req.body.description,
                    type: req.body.type || 'subscription' // 'subscription' or 'pdf'
                });
            });

        } catch (error) {
            console.log(error);
            res.status(500).send({ success: false, msg: "Internal Server Error" });
        }
    }

};

module.exports = RazorPayController;
