// DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const currentQuestion = document.getElementById("currentQuestion");
const questionText = currentQuestion.querySelector(".question-text");

// System prompt for AI context
const SYSTEM_PROMPT = `You are a L'Oréal Smart Product Advisor. Your role is to help customers with L'Oréal products, beauty routines, and recommendations.

Guidelines:
- Only answer questions related to L'Oréal products, beauty, skincare, haircare, and makeup
- Provide helpful product recommendations from L'Oréal's portfolio
- Suggest beauty routines and tips using L'Oréal products
- If asked about non-L'Oréal topics, politely redirect to L'Oréal-related questions
- Be friendly, professional, and knowledgeable about beauty and L'Oréal products
- Keep responses concise and helpful
- Remember the user's name and previous questions to provide personalized advice

If someone asks about topics unrelated to L'Oréal or beauty, respond with: "I'm here to help with L'Oréal products and beauty advice. How can I assist you with your beauty routine or product recommendations?"`;

// Conversation history to preserve chat context
const conversationHistory = [];

// Initial welcome message
chatWindow.innerHTML = "";
addMessage(
  "👋 Hello! I'm your L'Oréal Smart Product Advisor. What's your name, and how can I help you today?",
  "ai"
);

// Handle user form submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Show current question
  questionText.textContent = userMessage;
  currentQuestion.style.display = "block";

  addMessage(userMessage, "user");
  conversationHistory.push({ role: "user", content: userMessage });
  userInput.value = "";

  const loadingElement = addMessage("Thinking...", "ai");

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory,
    ];

    const response = await fetch("https://loreal-chatbot.zhuang61.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const { choices } = await response.json();
    const aiMessage = choices[0].message.content;

    conversationHistory.push({ role: "assistant", content: aiMessage });
    loadingElement.remove();
    addMessage(aiMessage, "ai");
  } catch (err) {
    console.error("Error:", err);
    loadingElement.remove();
    addMessage("Sorry, I encountered an error. Please try again.", "ai");
  }
});

// Append message to chat window
function addMessage(message, sender) {
  const msg = document.createElement("div");
  msg.className = `msg ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.textContent = message;

  msg.appendChild(bubble);
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return msg;
}
