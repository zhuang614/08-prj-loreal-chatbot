// === DOM Elements ===
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const currentQuestion = document.getElementById("currentQuestion");
const questionText = currentQuestion.querySelector(".question-text");

// === System Prompt for AI Context ===
const SYSTEM_PROMPT = `You are a helpful and knowledgeable beauty assistant for L’Oréal. Follow these guidelines:

- Only answer questions related to L’Oréal’s products and expertise, including skincare, haircare, makeup, and fragrances.
- Provide helpful product recommendations from L’Oréal’s portfolio (e.g., L’Oréal Paris, Garnier, Maybelline, etc.).
- Suggest personalized beauty routines and tips that use L’Oréal products.
- If the user asks about topics unrelated to L’Oréal or beauty, politely redirect them to ask something related to L’Oréal products or routines.
- Be friendly, professional, and confident in your beauty knowledge.
- Keep your responses concise, clear, and helpful.
- Remember the user's name and previous questions to offer personalized, context-aware advice throughout the conversation.

If someone asks about topics unrelated to L'Oréal or beauty, respond with: 
"Sorry, I'm here to help with L'Oréal products and beauty advice only. How can I assist you with your beauty routine or product recommendations?"`;

// === Chat History ===
const conversationHistory = [];

// === Initial Greeting ===
chatWindow.innerHTML = "";
addMessage(
  "👋 Hello! I'm your L'Oréal Smart Beauty Advisor. What's your name, and how can I help you today?",
  "ai"
);

// === Form Submission Handler ===
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Display current user question
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
  } catch (error) {
    console.error("Error:", error);
    loadingElement.remove();
    addMessage("Sorry, I encountered an error. Please try again.", "ai");
  }
});

// === Message Renderer ===
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
