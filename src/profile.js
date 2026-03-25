import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig.js";

// -------------------------------------------------------------
// Function to populate user info in the profile form
// Fetches user data from Firestore and fills in the form fields
// Assumes user is already authenticated
// and their UID corresponds to a document in the "users" collection
// of Firestore.
// Fields populated: name, school, city
// Form field IDs: nameInput, schoolInput, cityInput
// -------------------------------------------------------------
function populateUserInfo() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // reference to the user document
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          //unpack the data into json
          const userData = userSnap.data();

          //extract the fields
          const { name = "", school = "", city = "" } = userData;

          //update the DOM elements with fields
          document.getElementById("nameInput").value = name;
          document.getElementById("schoolInput").value = school;
          document.getElementById("cityInput").value = city;
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error getting user document:", error);
      }
    } else {
      console.log("No user is signed in");
    }
  });
}

//call the function to run it
populateUserInfo();

//-------------------------------------------------------------
// Function to enable editing of user info form fields
//------------------------------------------------------------- 
document.querySelector('#editButton').addEventListener('click', editUserInfo);
function editUserInfo() {
    //Enable the form fields
    document.getElementById('personalInfoFields').disabled = false;
}
