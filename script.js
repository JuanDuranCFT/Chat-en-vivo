// 🔥 Configuración Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC9LLKDm0_nJaAWIRvsP9ax9VV05Yslipg",
    authDomain: "chat-en-vivo-849ad.firebaseapp.com",
    projectId: "chat-en-vivo-849ad",
    storageBucket: "chat-en-vivo-849ad.firebasestorage.app",
    messagingSenderId: "48822987034",
    appId: "1:48822987034:web:a6ed8f337c49c7bb5e24a3",
    measurementId: "G-BX7X8ZDLBT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ☁️ Cloudinary (CAMBIA ESTO)
const CLOUD_NAME = "dekgau2s1";
const UPLOAD_PRESET = "chat_images_unsigned";

const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");

sendBtn.addEventListener("click", sendMessage);

// 📤 Subir imagen a Cloudinary
async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();
    return data.secure_url;
}

// 📤 Enviar mensaje
async function sendMessage() {
    const user = document.getElementById("username").value.trim();
    const message = document.getElementById("message").value.trim();
    const imageFile = document.getElementById("imageInput").files[0];

    if (user === "" || (message === "" && !imageFile)) return;

    let imageUrl = null;

    if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        document.getElementById("imageInput").value = "";
    }

    db.collection("mensajes").add({
        user: user,
        text: message,
        image: imageUrl,
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
                ${data.text ? `<div class="text">${data.text}</div>` : ""}
                ${data.image ? `<img src="${data.image}" class="chat-image">` : ""}
            `;

            messagesDiv.appendChild(messageElement);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
    });
