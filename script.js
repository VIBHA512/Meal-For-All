document.addEventListener("DOMContentLoaded", () => {

  // ================= FIREBASE INIT =================
  const firebaseConfig = {
    apiKey: "AIzaSyCcTAdHdM_xxzrcT7JFFaPEvNEkwGGapG0",
    authDomain: "food-rescue-1cfc8.firebaseapp.com",
    projectId: "food-rescue-1cfc8",
    storageBucket: "food-rescue-1cfc8.appspot.com",
    messagingSenderId: "571196450384",
    appId: "1:571196450384:web:5b316891a8a4e65bd79355"
  };
  


  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  // ================= DOM REFERENCES (VERY IMPORTANT) =================
  const loginSection = document.getElementById("loginSection");
  const donorSection = document.getElementById("donorSection");
  const ngoSection = document.getElementById("ngoSection");
  const mainApp = document.getElementById("mainApp");

  

  // ================= IMAGE PREVIEW =================
  let imageData = "";
  const foodImage = document.getElementById("foodImage");
  const preview = document.getElementById("preview");

  if (foodImage) {
    foodImage.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        imageData = reader.result;
        preview.src = imageData;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }

  // ================= POST FOOD =================
  window.postFood = () => {
    const donorName = document.getElementById("donorName").value.trim();
    const foodDetails = document.getElementById("foodDetails").value.trim();
    const location = document.getElementById("location").value.trim();

    if (!donorName || !foodDetails || !location) {
      alert("Please fill Donor Name, Food Details & Location");
      return;
    }

    db.collection("foods").add({
      donorName,
      donorType: document.getElementById("donorType").value,
      donorPhone: document.getElementById("donorPhone").value,
      donorEmail: document.getElementById("donorEmail").value,
      food: foodDetails,
      quantity: document.getElementById("foodQuantity").value,
      foodType: document.getElementById("foodType").value,
      pickupTime: document.getElementById("pickupTime").value,
      location,
      image: imageData || "",
      claimed: false,
      postedAt: Date.now()
    });

    alert("Food posted successfully 🎉");

    document.querySelectorAll("#donorSection input").forEach(i => {
      if (i.type !== "file") i.value = "";
    });

    preview.style.display = "none";
    foodImage.value = "";
    imageData = "";
  };

  // ================= NGO LIVE VIEW =================
  db.collection("foods").orderBy("postedAt", "desc")
    .onSnapshot(snapshot => {
      const foodList = document.getElementById("foodList");
      if (!foodList) return;

      foodList.innerHTML = "";

      snapshot.forEach(doc => {
        const d = doc.data();
        if (!d.food || !d.location) return;

        const li = document.createElement("li");
        li.className = "food-card";

        li.innerHTML = `
          <h4>${d.food}</h4>
          <p>📍 ${d.location}</p>
          <p>👤 Donor: ${d.donorName}</p>
          ${d.image ? `<img src="${d.image}" width="120">` : ""}
          ${d.claimed
            ? `<strong>✔ Claimed by ${d.claimedBy}</strong>`
            : `<button class="claim-btn" onclick="claimFood('${doc.id}')">Claim</button>`
          }
        `;

        foodList.appendChild(li);
      });
    });

  // ================= CLAIM FOOD =================
  window.claimFood = (docId) => {
    const ngoName = document.getElementById("ngoName").value.trim();
    if (!ngoName) {
      alert("Please enter NGO Name first");
      return;
    }

    db.collection("foods").doc(docId).update({
      claimed: true,
      claimedBy: ngoName,
      distance: (Math.random() * 8 + 1).toFixed(1)
    });
  };

  // ================= LOGIN =================
  window.loginUser = () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
  const roleInput = document.querySelector('input[name="role"]:checked');
const role = roleInput ? roleInput.value : null;


    if (!email || !password || !role) {
      alert("Please fill all details");
      return;
    }

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        localStorage.setItem("userRole", role);
        applyRoleUI();
      })
      .catch(err => alert(err.message));
  };

  // ================= ROLE BASED UI =================
function applyRoleUI() {
  const role = localStorage.getItem("userRole");

  loginSection.style.display = "none";
  mainApp.style.display = "block"; // 🔥 THIS WAS MISSING

  if (role === "donor") {
    donorSection.style.display = "block";
    ngoSection.style.display = "none";
  } else {
    donorSection.style.display = "none";
    ngoSection.style.display = "block";
  }
}

  // ================= AUTO LOGIN =================
  auth.onAuthStateChanged(user => {
    if (user && localStorage.getItem("userRole")) {
      applyRoleUI();
    } else {
    loginSection.style.display = "block";
mainApp.style.display = "none";
donorSection.style.display = "none";
ngoSection.style.display = "none";

    }
  });

  // ================= LOGOUT =================
  window.logout = () => {
    auth.signOut().then(() => {
      localStorage.clear();
      location.reload();
    });
  };

});





