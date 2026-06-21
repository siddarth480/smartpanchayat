const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const app = express();

// Allow only your frontend origin
const corsOptions = {
    origin: "http://localhost:3000", // your React app URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.use(express.json());


const razorpay = new Razorpay({
    key_id: "rzp_test_T4GPlvO8kwjhrf",
    key_secret: "SqOwN26KJeZeE0jjeHkPwJGn",
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post("/api/payment/create-order", async (req, res) => {
    const order = await razorpay.orders.create({
        amount: req.body.amount * 100, // in paise
        currency: "INR",
        receipt: "receipt_" + Date.now(),
    });
    res.json(order);
});

app.listen(5000, () => console.log("Server running on 5000"));