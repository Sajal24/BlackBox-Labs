import { Strategy } from "@superfaceai/passport-twitter-oauth2";
import { TwitterApiAutoTokenRefresher } from "@twitter-api-v2/plugin-token-refresher";
import { Client } from "discord.js";
import express from "express";
import session from "express-session";
import passport from "passport";
import { TwitterApi } from "twitter-api-v2";
import { sendMsgInChannel } from "./helpers";
import { test_id } from "./constants";
require("dotenv").config();

class TwitterHandler {
    app: express.Application;
    client: TwitterApi;
    accessToken: string;
    refreshToken: string;
    discordClient: Client<boolean>;
    constructor(discordClient: Client) {
        // <1> Serialization and deserialization
        passport.serializeUser((user, done) => {
            done(null, user);
        });
        passport.deserializeUser((obj: unknown, done) => {
            done(null, obj as Express.User);
        });

        // Use the Twitter OAuth2 strategy within Passport
        passport.use(
            // <2> Strategy initialization
            new Strategy(
                {
                    clientID: process.env.CLIENT_ID || "",
                    clientSecret: process.env.CLIENT_SECRET || "",
                    clientType: "confidential",
                    callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
                },
                // <3> Verify callback
                (accessToken, refreshToken, profile, done) => {
                    console.log("Success!", { accessToken, refreshToken });

                    this.accessToken = accessToken;
                    this.refreshToken = refreshToken;

                    return done(null, profile);
                }
            )
        );

        this.app = express();
        this.accessToken = "";
        this.refreshToken = "";
        this.discordClient = discordClient;

        // <4> Passport and session middleware initialization
        this.setupRoutes();

        const tmpToken = {
            accessToken: "",
            refreshToken: "",
        };
        const credentials = {
            clientId: process.env.CLIENT_ID || "",
            clientSecret: process.env.CLIENT_SECRET || "",
        };
        const autoRefresherPlugin = new TwitterApiAutoTokenRefresher({
            refreshToken: this.refreshToken,
            refreshCredentials: credentials,
            onTokenUpdate(token) {
                tmpToken.accessToken = token.accessToken;
                tmpToken.refreshToken = token.refreshToken!;
                // store in DB/Redis/...
            },
            onTokenRefreshError(error) {
                console.error("Refresh error", error);
            },
        });
        this.accessToken = tmpToken.accessToken;
        this.refreshToken = tmpToken.refreshToken;

        //for the refesh token and tweeting and replying
        this.client = new TwitterApi(
            {
                clientId: `${process.env.CLIENT_ID}`,
                clientSecret: `${process.env.CLIENT_SECRET}`,
            },
            {
                plugins: [autoRefresherPlugin],
            }
        );
    }

    private setupRoutes = () => {
        this.app.use(passport.initialize());
        this.app.use(
            session({
                secret: "keyboard cat",
                resave: false,
                saveUninitialized: true,
            })
        );

        this.app.get("/", (_, res) => {
            res.end(`<h1>Authentication example</h1>`);
        });

        // <5> Start authentication flow
        this.app.get(
            "/auth/twitter",
            passport.authenticate("twitter", {
                // <6> Scopes
                scope: [
                    "tweet.read",
                    "users.read",
                    "offline.access",
                    "tweet.write",
                ],
            })
        );

        // <7> Callback handler
        this.app.get(
            "/auth/twitter/callback",
            passport.authenticate("twitter"),
            function (req, res) {
                const userData = JSON.stringify(req.user, undefined, 2);
                res.end(
                    `<h1>Authentication succeeded</h1> User data: <pre>${userData}</pre>`
                );
            }
        );
    };

    init = () => {
        this.app.listen(3030, "127.0.0.1", () => {
            console.log(`Listening on ${process.env.BASE_URL}`);
        });

        sendMsgInChannel(
            `${process.env.BASE_URL}/auth/twitter` || "",
            test_id,
            this.discordClient
        );
    };

    tweet = async (tweetMsg: string) => {
        await this.client.v2.tweet(tweetMsg);
    };
}

export default TwitterHandler;
