import { db } from "./firebaseConfig.js";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

// Get the document ID from the URL
function getDocIdFromUrl() {
  const params = new URL(window.location.href).searchParams;
  return params.get("docID");
}

// Fetch the hike and display its name and image
async function displayHikeInfo() {
  const id = getDocIdFromUrl();
  try {
    const hikeRef = doc(db, "hikes", id);
    const hikeSnap = await getDoc(hikeRef);
    const hike = hikeSnap.data();
    document.getElementById("hikeName").textContent = hike.name;
    const img = document.getElementById("hikeImage");
    img.src = `./images/${hike.code}.jpg`;
    img.alt = `${hike.name} image`;
  } catch (error) {
    console.error("Error loading hike:", error);
    document.getElementById("hikeName").textContent = "Error loading hike.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const writeReviewBtn = document.getElementById("writeReviewBtn");
  writeReviewBtn.addEventListener("click", saveHikeDocumentIDAndRedirect);
});

function saveHikeDocumentIDAndRedirect() {
  const hikeID = new URL(window.location.href).searchParams.get("docID");
  if (!hikeID) {
    console.warn("No hike ID found in URL. Cannot continue.");
    return;
  }
  localStorage.setItem("hikeDocID", hikeID);
  window.location.href = "review.html";
}

async function populateReviews() {
  const reviewCardTemplate = document.getElementById("reviewCardTemplate");
  const reviewCardGroup = document.getElementById("reviewCardGroup");
  const hikeID = getDocIdFromUrl();

  if (!hikeID) {
    console.warn("No hike ID found in URL.");
    return;
  }

  try {
    const reviewsRef = collection(db, "hikes", hikeID, "reviews");
    const querySnapshot = await getDocs(reviewsRef);
    console.log("Found", querySnapshot.size, "reviews");

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const rating = Number(data.rating ?? 0);

      let time = "";
      if (data.timestamp?.toDate) {
        time = data.timestamp.toDate().toLocaleString();
      }

      const reviewCard = reviewCardTemplate.content.cloneNode(true);
      reviewCard.querySelector(".title").textContent = data.title || "(No title)";
      reviewCard.querySelector(".time").textContent = time;
      reviewCard.querySelector(".level").textContent = data.level || "(Not specified)";
      reviewCard.querySelector(".season").textContent = data.season || "(Not specified)";
      reviewCard.querySelector(".scrambled").textContent = data.scrambled ?? "(unknown)";
      reviewCard.querySelector(".flooded").textContent = data.flooded ?? "(unknown)";
      reviewCard.querySelector(".description").textContent = data.description || "";

      let starRating = "";
      const safeRating = Math.max(0, Math.min(5, rating));
      for (let i = 0; i < safeRating; i++) starRating += '<span class="material-icons">star</span>';
      for (let i = safeRating; i < 5; i++) starRating += '<span class="material-icons">star_outline</span>';
      reviewCard.querySelector(".star-rating").innerHTML = starRating;

      reviewCardGroup.appendChild(reviewCard);
    });
  } catch (error) {
    console.error("Error loading reviews:", error);
  }
}

displayHikeInfo();
populateReviews();