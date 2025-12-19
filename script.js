// 🔥 Configuración Firebase (PEGA AQUÍ LA TUYA)
const firebaseConfig = {
    apiKey: "AIzaSyC9LLKDm0_nJaAWIRvsP9ax9VV05Yslipg",
    authDomain: "chat-en-vivo-849ad.firebaseapp.com",
    projectId: "chat-en-vivo-849ad",
    storageBucket: "chat-en-vivo-849ad.firebasestorage.app",
    messagingSenderId: "48822987034",
    appId: "1:48822987034:web:a6ed8f337c49c7bb5e24a3",
    measurementId: "G-BX7X8ZDLBT"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Firestore
const db = firebase.firestore();

const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");

sendBtn.addEventListener("click", sendMessage);

// 📤 Enviar mensaje
function sendMessage() {
    const user = document.getElementById("username").value.trim();
    const message = document.getElementById("message").value.trim();

    if (user === "" || message === "") return;

    db.collection("mensajes").add({
        user: user,
        text: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("message").value = "";
}

// 📥 Escuchar mensajes en tiempo real
db.collection("mensajes")
  .orderBy("timestamp")
  .onSnapshot(snapshot => {
      messagesDiv.innerHTML = "";

      snapshot.forEach(doc => {
          const data = doc.data();

          const messageElement = document.createElement("div");
          messageElement.classList.add("message");

          messageElement.innerHTML = `
              <div class="user">${data.user}</div>
              <div class="text">${data.text}</div>
          `;

          messagesDiv.appendChild(messageElement);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
      });
  });
