//firebase setup
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  doc,
} = require("firebase/firestore");
const { TwitterApi } = require("twitter-api-v2");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const appE = express();

const firebaseConfig = {
  apiKey: "AIzaSyAdZDez2Mk2-hQMm7zaJgGiuhu-A9mUnwM",
  authDomain: "coders-mark-ecb87.firebaseapp.com",
  projectId: "coders-mark-ecb87",
  storageBucket: "coders-mark-ecb87.appspot.com",
  messagingSenderId: "250808911476",
  appId: "1:250808911476:web:85d267daa529b6f0707321",
};

// Initializing Firebase
const app = initializeApp(firebaseConfig);

//reference to firestore database
const db = getFirestore(app);

//reference to the tweets collection
const tokenCollection = collection(db, "tokens");

//adding a new document to the tokens collection
const verifierDocRef = doc(db, "tokens", "verifiers");
const twitterDocRef = doc(db, "tokens", "twitter");

//adding a new document to the tokens collection
const settingDoc = async (docRef, data) => {
  await setDoc(docRef, data);
  console.log("Document stored!");
};

//getting a document from the tokens collection
const queryDoc = async () => {
  const querySnapshot = await getDocs(doc(db, "tokens", "verifiers"));
  return querySnapshot.data();
};

//twitter setup
const client = new TwitterApi({
  clientId: `${process.env.CLIENT_ID}`,
  clientSecret: `${process.env.CLIENT_SECRET}`,
});

const CALLBACK_URL = "http://127.0.0.1:5500/index.html";
const port = 3000;

const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
  CALLBACK_URL,
  { scope: ["tweet.read", "users.read", "offline.access", "tweet.write"] }
);
// storing the code verifier and the state in the database
settingDoc(verifierDocRef, { codeVerifier, state });

appE.get("/", (req, res) => {
  res.send("Hello World!");
});

appE.get(CALLBACK_URL, async (req, res) => {
  const { code, state } = req.query;

  const querySnapshot = await getDoc(verifierDocRef);
  // console.log(querySnapshot.data());
  const { codeVerifier, state: stateFromDb } = querySnapshot.data();

  if (state !== stateFromDb) {
    return res.status(400).send("Invalid state");
  }

  // exchange the code for an access token
  client
    .loginWithOAuth2({ code, codeVerifier, redirectUri: CALLBACK_URL })
    .then(async ({ client: loggedClient, accessToken, refreshToken }) => {
      // store the access token and refresh token in the database
      // await settingDoc(twitterDocRef, { accessToken, refreshToken });

      await setDoc(twitterDocRef, { accessToken, refreshToken });
      console.log("Document stored!");
      // use the logged client to make requests
      const user = await loggedClient.v2.user("me");
      console.log(user);
      res.send(user);
    })
    .catch(console.error);
});

//refresh token setup
const refresh = async () => {
  const { refreshToken } = await getDoc(twitterDocRef).data();

  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await client.refreshOAuth2Token(refreshToken);

  // store the new access token and refresh token in the database
  await setDoc(twitterDocRef, { accessToken, refreshToken: newRefreshToken });
};

appE.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
//openai setup
