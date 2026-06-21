const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios"); 
const Razorpay = require("razorpay");
const crypto = require("crypto");

admin.initializeApp();

// GEMINI CONFIGURATION
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyD2hKmbwXej3pqSotjIdptgW7g_2dpSuHk";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// RAZORPAY CONFIGURATION
// Replace these with your ACTUAL keys from the Razorpay Dashboard
const RAZORPAY_KEY_ID = "rzp_test_T4GPlvO8kwjhrf";
const RAZORPAY_KEY_SECRET = "iM3pYVj77c37E570nC927Vb5";

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

  const { amount, billId, appId } = data;

  try {
    // Parse the amount, removing any commas, and ensure it's a valid number
    const parsedAmount = parseFloat(String(amount).replace(/,/g, ""));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Invalid bill amount: " + amount);
    }

    // Razorpay receipt max length is 40 characters
    const receiptId = `bill_${billId}`.substring(0, 40);

    const order = await razorpay.orders.create({
      amount: Math.round(parsedAmount * 100), // Convert INR to Paise
      currency: "INR",
      receipt: receiptId,
      notes: {
        appId: appId || "default",
        billId: billId,
      },
    });
    return order;
  } catch (error) {
    console.error("Razorpay Error:", error);
    // Extract actual error description if it's an object (which Razorpay often returns)
    const errorMsg = error.error
      ? error.error.description
      : error.message || JSON.stringify(error);
      
    throw new functions.https.HttpsError("internal", `Razorpay Error: ${errorMsg}`);
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
// 2. Webhook for Razorpay (Optional Real-time Capture)
// ============================================================
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  // Replace with your Webhook Secret from Razorpay Dashboard
  const WEBHOOK_SECRET = "YOUR_WEBHOOK_SECRET";
  
  const signature = req.headers["x-razorpay-signature"];
  
  try {
    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest("hex");

    if (signature === expectedSignature) {
      const event = req.body.event;
      if (event === "payment.captured") {
        const payment = req.body.payload.payment.entity;
        const notes = payment.notes || {};
        
        const billId = notes.billId;
        const appId = notes.appId;

        if (billId && appId) {
          await admin
            .firestore()
            .doc(`artifacts/${appId}/public/data/bills/${billId}`)
            .update({
              status: "Paid",
              paidDate: admin.firestore.FieldValue.serverTimestamp(),
              razorpay_payment_id: payment.id,
              webhookVerified: true,
            });
          console.log(`Payment captured via webhook for bill ${billId}`);
        }
      }
      res.status(200).send("OK");
    } else {
      res.status(400).send("Invalid Signature");
    }
  } catch (error) {
    console.error("Webhook verification error:", error);
    res.status(500).send("Internal Error");
  }
});

// ============================================================
// 3. AI MEETING VIDEO ANALYSIS
// ============================================================
exports.analyzeMeetingVideo = functions
  .runWith({
    timeoutSeconds: 540,
    memory: "2GB",
  })
  .https.onCall(async (data, context) => {
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

      const prompt = `Analyze this Panchayat meeting video. Provide a summary with: 1. Main Agenda 2. Key Decisions 3. Action Items. Use ONLY HTML tags (<b>, <ul>, <li>).`;

      const result = await model.generateContent([
        { inlineData: { data: videoBase64, mimeType: "video/mp4" } },
        prompt,
      ]);

      return { summary: result.response.text(), success: true };
    } catch (error) {
      console.error("AI Analysis Error:", error);
      throw new functions.https.HttpsError("internal", "AI Analysis failed.");
    }
  });

// ============================================================
// LIVE AUDIO TRANSCRIPTION
// ============================================================
exports.processSpeech = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required.");
  const { audioBase64 } = data;
  
  if (!audioBase64) throw new functions.https.HttpsError("invalid-argument", "Audio data missing.");
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = "Transcribe this audio segment. Return ONLY the spoken words, no additional commentary, markdown, or formatting.";
    
    // Note: The frontend uses MediaRecorder, which defaults to webm on Chrome.
    const result = await model.generateContent([
      { inlineData: { data: audioBase64, mimeType: "audio/webm" } },
      prompt,
    ]);
    
    return { text: result.response.text(), success: true };
  } catch (error) {
    console.error("Transcription error:", error);
    throw new functions.https.HttpsError("internal", "Transcription failed.");
  }
});

// ============================================================
// 3. EXPERT USER LOGIC
// ============================================================
exports.createExpertUser = functions.https.onCall(async (data, context) => {
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
