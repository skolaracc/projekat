import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
  orderBy,
  setDoc,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzZrHZ-GDUlOa9OAA4GQutmGSkkJN_e78",
  authDomain: "projekatt-6a688.firebaseapp.com",
  projectId: "projekatt-6a688",
  storageBucket: "projekatt-6a688.appspot.com",
  messagingSenderId: "106158181819",
  appId: "1:106158181819:web:19f006d418830aac1b889e",
  measurementId: "G-W1E7FBNFC7",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

var provider;
var auth;
var credential;
var token;

var email;

window.onload = function () {
  document.getElementById("loginbutton").onclick = function () {
    signIn();
  };
  document.getElementById("createitembutton").onclick = function () {
    createShoppingListDocument();
  };
};

async function signIn() {
  provider = new GoogleAuthProvider();
  auth = getAuth();

  signInWithPopup(auth, provider).then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    credential = GoogleAuthProvider.credentialFromResult(result);
    token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    email = user.email;
    document.getElementById("useremail").innerHTML = email;

    document.getElementById("loginbutton").style.display = "none";
    document.getElementById("shoppinglistpage").style.display = "block";

    displayShoppingList(email);
  });
}

async function displayShoppingList(email) {
  const userShoppingListsCollection = collection(db, "userShoppingLists");
  const userShoppingListsQuery = query(
    userShoppingListsCollection,
    orderBy("userPurchase", "asc")
  );
  const userShoppingListsSnapshot = await getDocs(userShoppingListsQuery);

  let userShoppingList = "";
  userShoppingListsSnapshot.forEach(function (doc) {
    if (doc.data().userEmail !== email) {
      return; // Skip items not belonging to the current user
    }

    userShoppingList +=
      `<div style="border: 1px solid black; background-color: #f2f2f2; padding: 10px; margin-bottom: 10px;">
        <input type='text' maxlength='30' size='20' id='o${doc.id}' autocomplete='off'
          placeholder='${doc.data().userPurchase}' value='${doc.data().userPurchase}'>
        <button id='e${doc.id}'>Update</button>
        <button id='d${doc.id}'>Delete</button>
      </div>`;
  });

  document.getElementById("usershoppinglist").innerHTML = userShoppingList;

  userShoppingListsSnapshot.forEach(function (doc) {
    if (doc.data().userEmail !== email) {
      return; // Skip items not belonging to the current user
    }

    document.getElementById("e" + doc.id).onclick = function () {
      updateShoppingListDocument(doc.id);
    };
    document.getElementById("d" + doc.id).onclick = function () {
      deleteShoppingListDocument(doc.id);
    };
  });
}


async function updateShoppingListDocument(id) {
  // update the userPurchase field for document id

  let newUserPurchase = document.getElementById("o" + id).value;
  const docRef = doc(db, "userShoppingLists", id);
  await setDoc(docRef, { userPurchase: newUserPurchase }, { merge: true });
}

async function deleteShoppingListDocument(id) {
  // delete the document for document id

  const docRef = doc(db, "userShoppingLists", id);
  await deleteDoc(docRef);
  displayShoppingList(email);
}

async function createShoppingListDocument() {
  // create a new document, leaving Firestore to allocate its document id automatically

  let newUserPurchase = document.getElementById("newpurchaseitem").value;
  const collRef = collection(db, "userShoppingLists");
  const docRef = doc(collRef);
  await setDoc(docRef, {
    userEmail: email,
    userPurchase: newUserPurchase,
  });

  displayShoppingList(email);
  document.getElementById("newpurchaseitem").value = "";
}
