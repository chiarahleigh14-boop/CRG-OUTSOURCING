const form = document.getElementById("contactForm");

// Create popup
const popup = document.createElement("div");
popup.id = "form-popup";
popup.style.position = "fixed";
popup.style.bottom = "20px";
popup.style.right = "-350px";
popup.style.padding = "15px 25px";
popup.style.background = "#0a2e5c";
popup.style.color = "white";
popup.style.borderRadius = "8px";
popup.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
popup.style.fontSize = "0.95rem";
popup.style.transition = "right 0.5s ease, opacity 0.5s ease";
popup.style.opacity = "0";
popup.style.zIndex = "10000";
document.body.appendChild(popup);

function showPopup(message, color = "white", bg = "#0a2e5c") {
  popup.innerText = message;
  popup.style.background = bg;
  popup.style.color = color;
  popup.style.opacity = "1";
  popup.style.right = "20px";

  setTimeout(() => {
    popup.style.right = "-350px";
    popup.style.opacity = "0";
  }, 4000);
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Basic validation
  const name = form.from_name.value.trim();
  const email = form.from_email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    showPopup("Please fill in all fields.", "white", "#dc3545");
    return;
  }

  showPopup("Sending message...", "white", "#0a2e5c");

  // --- 1️⃣ Send notification to CRG ---
  emailjs.sendForm("service_6xqpwn5", "template_qvrkbdr", form)
    .then((response) => {
      console.log("✅ CRG notification sent:", response);

      // --- 2️⃣ Send auto-reply to user ---
      emailjs.sendForm("service_6xqpwn5", "template_ypemyil", form)
        .then((res2) => {
          console.log("✅ Auto-reply sent to user:", res2);
          showPopup("Message sent! You will receive a confirmation email.", "white", "#28a745");
          form.reset();
        })
        .catch((err2) => {
          console.error("❌ Error sending auto-reply:", err2);
          showPopup("Message sent to CRG but failed to send confirmation email.", "white", "#dc3545");
        });

    })
    .catch((error) => {
      console.error("❌ Error sending notification to CRG:", error);

      // Detect common errors
      if (error.text && error.text.includes("Recipient address is empty")) {
        showPopup("CRG email not set in template. Check template_qvrkbdr.", "white", "#dc3545");
      } else if (error.text && error.text.includes("Invalid")) {
        showPopup("Check your EmailJS service/template/public key.", "white", "#dc3545");
      } else {
        showPopup("Failed to send message. Please try again.", "white", "#dc3545");
      }
    });
});
