const express = require("express");
const passport = require("passport");
const { Strategy } = require("@superfaceai/passport-twitter-oauth2");
const session = require("express-session");
require("dotenv").config();

// <1> Serialization and deserialization
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Use the Twitter OAuth2 strategy within Passport
passport.use(
  // <2> Strategy initialization
  new Strategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      clientType: "confidential",
      callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
    },
    // <3> Verify callback
    (accessToken, refreshToken, profile, done) => {
      console.log("Success!", { accessToken, refreshToken });
      return done(null, profile);
    }
  )
);

const app = express();

// <4> Passport and session middleware initialization
app.use(passport.initialize());
app.use(
  session({ secret: "keyboard cat", resave: false, saveUninitialized: true })
);

app.get("/", (req, res) => {
  res.end(`<h1>Authentication example</h1>`);
});

// <5> Start authentication flow
app.get(
  "/auth/twitter",
  passport.authenticate("twitter", {
    // <6> Scopes
    scope: ["tweet.read", "users.read", "offline.access", "tweet.write"],
  })
);

// <7> Callback handler
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter"),
  function (req, res) {
    const userData = JSON.stringify(req.user, undefined, 2);
    res.end(
      `<h1>Authentication succeeded</h1> User data: <pre>${userData}</pre>`
    );
  }
);

//for the refesh token and tweeting and replying
const client = new TwitterApi({
  clientId: `${process.env.CLIENT_ID}`,
  clientSecret: `${process.env.CLIENT_SECRET}`,
});

const refresh = async () => {
  //TODO: get the refresh token from above

  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await client.refreshOAuth2Token(refreshToken);

  // store the new access token and refresh token in the database
  //TODO: store the new access token and refresh token

  //tweet function
};

//tweet function
const tweet = async (tweetMsg) => {
  await refreshedClient.v2.tweet(tweetMsg);
};

app.listen(3030, "127.0.0.1", () => {
  console.log(`Listening on ${process.env.BASE_URL}`);
});
