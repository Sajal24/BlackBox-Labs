//firebase setup
import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
import express from "express";

dotenv.config();
const appE = express();

const stateDB = {
    state: "",
    codeVerifier: "",
    accessToken: "",
    refreshToken: "",
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
stateDB.state = state;
stateDB.codeVerifier = codeVerifier;

appE.get("/", (req: string, res: any) => {
    res.send("Hello World!");
});

appE.get(CALLBACK_URL, async (req: string, res: any) => {
    const code = res.query.code;
    const state = res.query.state;

    let codeVerifier = stateDB.codeVerifier;
    let stateFromDb = stateDB.state;

    if (state !== stateFromDb) {
        return res.status(400).send("Invalid state");
    }

    // exchange the code for an access token
    client
        .loginWithOAuth2({ code, codeVerifier, redirectUri: CALLBACK_URL })
        .then(async ({ client: loggedClient, accessToken, refreshToken }) => {
            // store the access token and refresh token in the database
            // await settingDoc(twitterDocRef, { accessToken, refreshToken });

            stateDB.accessToken = accessToken;
            stateDB.refreshToken = refreshToken || "";

            // use the logged client to make requests
            const user = await loggedClient.v2.user("me");
            console.log(user);
            res.send(user);
        })
        .catch(console.error);
});

//refresh token setup
const refresh = async () => {
    let refreshToken = stateDB.refreshToken;

    const {
        client: refreshedClient,
        accessToken,
        refreshToken: newRefreshToken,
    } = await client.refreshOAuth2Token(refreshToken);

    // store the new access token and refresh token in the database
    stateDB.accessToken = accessToken;
    stateDB.refreshToken = newRefreshToken || "";
};

appE.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
//openai setup
