const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios"); // Required for downloading video from Cloudinary

admin.initializeApp();

// --- AI CONFIGURATION ---
const GEMINI_API_KEY = "AIzaSyAwN-VPtd-k3xc-pyaw4c_GnUx-W4MrioI";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ============================================================
// 1. AI MEETING VIDEO ANALYSIS (Gemini 2.0 Flash)
// ============================================================
exports.analyzeMeetingVideo = functions
  .runWith({
    timeoutSeconds: 540, // Extended for video processing
    memory: "2GB",       // High memory for video buffering
  })
  .https.onCall(async (data, context) => {
    // Security Check
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login required.");
    }

    const { videoUrl } = data;
    if (!videoUrl) {
      throw new functions.https.HttpsError("invalid-argument", "Video URL missing.");
    }

    try {
      // 🚀 Step 1: Download video buffer from Cloudinary
      // Gemini needs the file content, not just the URL string
      const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      const videoBase64 = Buffer.from(response.data).toString("base64");

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Context: You are the Digital Secretary for a Gram Panchayat (Village Council).
        Task: Analyze the attached video and extract:
        1. **Main Agenda**: Primary purpose of the meeting.
        2. **Discussion Points**: Issues raised by villagers (translate from Hindi/Marathi if needed).
        3. **Resolutions**: Final decisions made.
        4. **Financial Approvals**: Specific funds or budgets mentioned.

        Rules:
        - Return ONLY HTML tags (<b>, <i>, <ul>, <li>).
        - Use professional, secretary-level English.
        - DO NOT use Markdown.
      `;

      // 🚀 Step 2: Generate content with Multimodal Input
      const result = await model.generateContent([
        {
          inlineData: {
            data: videoBase64,
            mimeType: "video/mp4",
          },
        },
        prompt,
      ]);

      const summaryText = result.response.text();

      return {
        summary: summaryText,
        success: true,
      };
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new functions.https.HttpsError("internal", "AI Analysis failed.");
    }
  });

// ============================================================
// 2. EXPERT USER LOGIC (Official Admin Control)
// ============================================================
exports.createExpertUser = functions.https.onCall(async (data, context) => {
  const { fullName, email, password, expertise } = data;

  // Only logged-in users (likely admins) can create experts
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Unauthorized.");
  }

  try {
    // 1. Create the user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    });

    // 2. Store expert details in Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      fullName,
      email,
      role: "expert",
      expertise,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isApproved: true, // Defaulting to true for admin-created experts
    });

    return { 
      message: `Expert ${fullName} created successfully.`, 
      uid: userRecord.uid 
    };
  } catch (error) {
    console.error("Expert Creation Error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});