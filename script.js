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

  const db = firebase.firestore();

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

  // ================= VIEW SWITCH =================
  window.showDonor = () => {
    document.getElementById("donorSection").style.display = "block";
    document.getElementById("ngoSection").style.display = "none";
  };

  window.showNGO = () => {
    document.getElementById("donorSection").style.display = "none";
    document.getElementById("ngoSection").style.display = "block";
  };

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
      donorName: donorName,
      donorType: document.getElementById("donorType").value,
      donorPhone: document.getElementById("donorPhone").value,
      donorEmail: document.getElementById("donorEmail").value,

      food: foodDetails,
      quantity: document.getElementById("foodQuantity").value,
      foodType: document.getElementById("foodType").value,
      pickupTime: document.getElementById("pickupTime").value,
      location: location,

      image: imageData || "",
      claimed: false,
      postedAt: Date.now()
    });

    alert("Food posted successfully 🎉");

    // reset form
    document.querySelectorAll("#donorSection input").forEach(i => {
      if (i.type !== "file") i.value = "";
    });

    preview.style.display = "none";
    foodImage.value = "";
    imageData = "";
  };

  // ================= NGO VIEW =================
  db.collection("foods")
    .orderBy("postedAt", "desc")
    .onSnapshot(snapshot => {
      const foodList = document.getElementById("foodList");
      foodList.innerHTML = "";

      snapshot.forEach(doc => {
        const d = doc.data();
        const li = document.createElement("li");

        if (!d.food || !d.location) return;

        const mapLink = `
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.location)}"
             target="_blank">🗺 Open in Maps</a>
        `;

        if (d.claimed) {
          li.innerHTML = `
            <b>${d.food}</b><br>
            📍 ${d.location}<br>
            ✔ Claimed by: ${d.claimedBy}<br>
            🚚 Distance: ${d.distance} km<br>
            ${mapLink}
          `;
        } else {
          li.innerHTML = `
            <b>${d.food}</b><br>
            🍱 ${d.foodType || ""}<br>
            👥 ${d.quantity || ""}<br>
            ⏰ Pickup: ${d.pickupTime || ""}<br>
            📍 ${d.location}<br>
            👤 Donor: ${d.donorName}<br>
            ${d.image ? `<img src="${d.image}" width="120">` : ""}
            <button onclick="claimFood('${doc.id}')">Claim</button>
            <br>${mapLink}
          `;
        }

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

    const distance = (Math.random() * 8 + 1).toFixed(1);

    db.collection("foods").doc(docId).update({
      claimed: true,
      claimedBy: ngoName,
      distance: distance
    });
  };

});