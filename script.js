// 🔥 Firebase
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

// ☁️ Cloudinary
const CLOUD_NAME = "dekgau2s1";
const UPLOAD_PRESET = "chat_images_unsigned";

const sendBtn = document.getElementById("sendBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const messagesDiv = document.getElementById("messages");

sendBtn.addEventListener("click", sendMessage);

// 🗑️ Limpiar chat
clearChatBtn.addEventListener("click", async () => {
    if (!confirm("¿Seguro que deseas borrar todo el chat?")) return;

    const snapshot = await db.collection("mensajes").get();
    const batch = db.batch();

    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
});

// 📤 Cloudinary
async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.secure_url;
}

// 📤 Enviar mensaje
async function sendMessage() {
    const user = username.value.trim();
    const text = message.value.trim();
    const imageFile = imageInput.files[0];

    if (!user || (!text && !imageFile)) return;

    let imageUrl = null;

    if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        imageInput.value = "";
    }

    await db.collection("mensajes").add({
        user,
        text: text || null,
        image: imageUrl || null,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    message.value = "";
}

// 📥 Mensajes + botón editar
db.collection("mensajes")
.orderBy("timestamp")
.onSnapshot(snapshot => {
    messagesDiv.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();

        const msg = document.createElement("div");
        msg.classList.add("message");

        msg.innerHTML = `
            <div class="user">${data.user}</div>
            <div class="text" data-id="${doc.id}">
                ${data.text ? `<div class="msg-text">${data.text}</div>` : ""}
                ${data.image ? `<img src="${data.image}">` : ""}
                ${data.text ? `<button class="edit-btn">✏️ Editar</button>` : ""}
            </div>
        `;

        messagesDiv.appendChild(msg);

        // ✏️ Evento editar
        const editBtn = msg.querySelector(".edit-btn");
        if (editBtn) {
            editBtn.onclick = async () => {
                const newText = prompt("Editar mensaje:", data.text);
                if (!newText || !newText.trim()) return;

                await db.collection("mensajes").doc(doc.id).update({
                    text: newText
                });
            };
        }
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
