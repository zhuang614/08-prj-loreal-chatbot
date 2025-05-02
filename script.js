/* System prompt */
const messages = [{
  role: 'system',
  content: "You are a friendly L'Oréal beauty assistant. Help users with skincare routines, product recommendations, and beauty advice. Use emojis to enhance the conversation. Be concise and engaging. Reply in PLAIN TEXT only."
}];

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "🤖 Get personalized recommendations for skincare, hair, makeup, fragrance, and more.";

/* Format chat message */
function formatMessage(question, answer) {
  const div = document.createElement('div');
  div.style.whiteSpace = 'pre-line';
  if (question) {
    div.innerHTML = `<strong>You:</strong> ${question}\n\n${answer}`;
  } else {
    div.textContent = answer;
  }
  return div;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();

  // Show thinking state
  chatWindow.innerHTML = '';
  chatWindow.appendChild(formatMessage(question, "Thinking..."));
  userInput.value = "";

  // Add user message
  messages.push({ role: "user", content: question });

  try {
    const response = await fetch('https://damp-fog-2e23.guil-c5e.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    const answer = result.choices[0].message.content;

    // Update UI and history
    chatWindow.innerHTML = '';
    chatWindow.appendChild(formatMessage(question, answer));
    messages.push({ role: "assistant", content: answer });

  } catch (err) {
    console.error('Error:', err);
    chatWindow.innerHTML = '';
    chatWindow.appendChild(formatMessage(question, "⚠️ Sorry, something went wrong. Please try again."));
  }
});
