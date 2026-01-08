const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios"); 
const Razorpay = require("razorpay");
const crypto = require("crypto");

admin.initializeApp();

// RAZORPAY CONFIGURATION
// Replace these with your ACTUAL keys from the Razorpay Dashboard
const RAZORPAY_KEY_ID = "rzp_test_S0uLIRwkoZzK3m";
const RAZORPAY_KEY_SECRET = "Idxrdi3CMf2luMRZVwk6DtcE";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// 1. Function to Create an Order
exports.createOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Please login first."
    );
  }

  const { amount, billId } = data;

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100), // Convert INR to Paise
      currency: "INR",
      receipt: `bill_${billId}`,
    });
    return order;
  } catch (error) {
    console.error("Razorpay Error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// 2. Function to Verify Payment
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    billId,
    appId,
  } = data;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // Payment is valid, update the bill status
    await admin
      .firestore()
      .doc(`artifacts/${appId}/public/data/bills/${billId}`)
      .update({
        status: "Paid",
        paidDate: admin.firestore.FieldValue.serverTimestamp(),
        razorpay_payment_id: razorpay_payment_id,
      });
    return { success: true };
  } else {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Payment verification failed."
    );
  }
});

// ============================================================
// 2. AI MEETING VIDEO ANALYSIS
// ============================================================
exports.analyzeMeetingVideo = functions
  .runWith({
    timeoutSeconds: 540,
    memory: "2GB",
  })
  .https.onCall(async (data, context) => {
    // ... (Your existing Gemini code remains exactly as it was)
    if (!context.auth)
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Login required."
      );

    const { videoUrl } = data;
    try {
      const response = await axios.get(videoUrl, {
        responseType: "arraybuffer",
      });
      const videoBase64 = Buffer.from(response.data).toString("base64");
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Context: Digital Secretary Gram Panchayat... (etc)`;

      const result = await model.generateContent([
        { inlineData: { data: videoBase64, mimeType: "video/mp4" } },
        prompt,
      ]);

      return { summary: result.response.text(), success: true };
    } catch (error) {
      throw new functions.https.HttpsError("internal", "AI Analysis failed.");
    }
  });

// ============================================================
// 3. EXPERT USER LOGIC
// ============================================================
exports.createExpertUser = functions.https.onCall(async (data, context) => {
  // ... (Your existing Expert creation code remains exactly as it was)
  const { fullName, email, password, expertise } = data;
  if (!context.auth)
    throw new functions.https.HttpsError("unauthenticated", "Unauthorized.");

  try {
    const userRecord = await admin
      .auth()
      .createUser({ email, password, displayName: fullName });
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      fullName,
      email,
      role: "expert",
      expertise,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isApproved: true,
    });
    return { message: `Expert ${fullName} created.`, uid: userRecord.uid };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
