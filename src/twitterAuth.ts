import { Strategy } from "@superfaceai/passport-twitter-oauth2";
import { TwitterApiAutoTokenRefresher } from "@twitter-api-v2/plugin-token-refresher";
import { Client } from "discord.js";
import express from "express";
import session from "express-session";
import passport from "passport";
import {
    IClientTokenOauth,
    TwitterApi,
    TwitterApiTokens,
} from "twitter-api-v2";
import { sendMsgInChannel } from "./helpers";
import { test_id } from "./constants";
require("dotenv").config();

class TwitterHandler {
    app: express.Application;
    client: TwitterApi | undefined;
    accessToken: string;
    refreshToken: string;
    discordClient: Client<boolean>;
    apiAccess: boolean;
    v1Client: TwitterApi;
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
                    callbackURL: `${process.env.EXTERNAL_URL}/auth/twitter/callback`,
                },
                // <3> Verify callback
                (accessToken, refreshToken, profile, done) => {
                    console.log("Success!", { accessToken, refreshToken });

                    this.accessToken = accessToken;
                    this.refreshToken = refreshToken;

                    sendMsgInChannel(
                        "Twitter authentication successful!",
                        test_id,
                        discordClient
                    );

                    const tmpToken = {
                        accessToken: "",
                        refreshToken: "",
                    };
                    const credentials = {
                        clientId: process.env.CLIENT_ID || "",
                        clientSecret: process.env.CLIENT_SECRET || "",
                    };
                    const autoRefresherPlugin =
                        new TwitterApiAutoTokenRefresher({
                            refreshToken: this.refreshToken,
                            refreshCredentials: credentials,
                            onTokenUpdate(token: any) {
                                tmpToken.accessToken = token.accessToken;
                                tmpToken.refreshToken = token.refreshToken!;
                                // store in DB/Redis/...
                            },
                            onTokenRefreshError(error: Error) {
                                console.error("Refresh error", error);
                            },
                        });

                    this.accessToken = tmpToken.accessToken;
                    this.refreshToken = tmpToken.refreshToken;
                    this.apiAccess = true;

                    //for the refesh token and tweeting and replying
                    this.client = new TwitterApi(this.accessToken, {
                        plugins: [autoRefresherPlugin],
                    });

                    // console.log(this.fetchTweet("1643344456031059968"));

                    return done(null, profile);
                }
            )
        );

        this.app = express();
        this.accessToken = "";
        this.refreshToken = "";
        this.discordClient = discordClient;
        this.v1Client = new TwitterApi({
            appKey: process.env.APP_KEY || "",
            appSecret: process.env.APP_KEY_SECRET || "",
            accessToken: process.env.ACCESS_TOKEN || "",
            accessSecret: process.env.ACCESS_TOKEN_SECRET || "",
        });
        this.client = undefined;
        this.apiAccess = false;

        // <4> Passport and session middleware initialization
        this.setupRoutes();
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
            res.end(`<h1>Twitter Auth API Home</h1>`);
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

    private getMimeType = (url: string) => {
        const extension = url.slice(url.lastIndexOf(".") + 1);
        switch (extension) {
            case "png":
                return "image/png";
            case "jpg":
                return "image/jpeg";
            case "gif":
                return "image/gif";
            default:
                return "image/webp";
        }
    };

    private getBufferFromURL = async (url: string) => {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        return Buffer.from(buffer);
    };

    init = () => {
        this.app.listen(3030, process.env.BASE_URL || "", () => {
            console.log(`Listening on ${process.env.EXTERNAL_URL}`);
        });

        sendMsgInChannel(
            `${process.env.EXTERNAL_URL}/auth/twitter` || "",
            test_id,
            this.discordClient
        );
    };

    fetchTweet = async (tweetId: string) => {
        const tweet = await this.client?.v2.singleTweet(tweetId, {
            expansions: ["entities.mentions.username", "in_reply_to_user_id"],
        });

        // Access the text property of the tweet to get the text of the tweet
        return tweet?.data.text || "";
    };

    postTweet = async (tweetMsg: string) => {
        if (!this.apiAccess) {
            sendMsgInChannel(
                "Twitter authentication failed!",
                test_id,
                this.discordClient
            );
            return;
        }

        try {
            console.log(await this.client?.v2.tweet(tweetMsg));
        } catch (error) {
            console.log(error, tweetMsg);
        }
    };

    postTweetWithMedia = async (tweetMsg: string, mediaURL: string) => {
        if (!this.apiAccess) {
            sendMsgInChannel(
                "Twitter authentication failed!",
                test_id,
                this.discordClient
            );
            return;
        }

        try {
            const uploadedMediaId = await this.v1Client?.v1.uploadMedia(
                await this.getBufferFromURL(mediaURL),
                {
                    target: "tweet",
                    mimeType: this.getMimeType(mediaURL),
                }
            );
            console.log(
                await this.client?.v2.tweet(tweetMsg, {
                    media: {
                        media_ids: [uploadedMediaId || ""],
                    },
                })
            );
        } catch (error) {
            console.log(error, tweetMsg);
        }
    };

    replyToTweet = async (tweetId: string, replyMsg: string) => {
        if (!this.apiAccess) {
            sendMsgInChannel(
                "Twitter authentication failed!",
                test_id,
                this.discordClient
            );
            return;
        }

        try {
            await this.client?.v2.reply(replyMsg, tweetId);
        } catch (error) {
            console.log(error, tweetId, replyMsg);
        }
    };

    isThread = async (tweetId: string) => {
        let tweet = await this.client?.v1.get(`statuses/show/${tweetId}`, {
            tweet_mode: "extended",
        });

        while (tweet.in_reply_to_status_id) {
            tweet = await this.client?.v1.get(
                `statuses/show/${tweet.in_reply_to_status_id}`,
                {
                    tweet_mode: "extended",
                }
            );
        }

        return tweet.in_reply_to_status_id === null;
    };

    fetchThread = async (tweetId: string) => {
        const tweets = [];
        let cursor;
        try {
            do {
                const response: any = await this.client?.v1.get(
                    "statuses/show",
                    {
                        id: tweetId,
                        tweet_mode: "extended",
                        trim_user: true,
                        include_ext_alt_text: true,
                        ...(cursor ? { max_id: cursor } : {}),
                    }
                );

                tweets.push(response);

                cursor = response.in_reply_to_status_id_str;
            } while (cursor);

            console.log(tweets);
        } catch (err) {
            console.error(err);
        }

        return tweets;
    };
}

export default TwitterHandler;
