"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv-safe/config");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const cors_1 = __importDefault(require("cors"));
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const constants_1 = require("./constants");
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const path_1 = __importDefault(require("path"));
const Upvote_1 = require("./entities/Upvote");
const createUserLoader_1 = require("./utils/createUserLoader");
const createUpvoteLoader_1 = require("./utils/createUpvoteLoader");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield typeorm_1.createConnection({
        type: "postgres",
        url: process.env.DATABASE_URL,
        logging: true,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        entities: [Post_1.Post, User_1.User, Upvote_1.Upvote],
    });
    conn.runMigrations();
    const app = express_1.default();
    app.use(cors_1.default({
        origin: process.env.CLIENT_ORIGIN,
        credentials: true,
    }));
    const redisStore = connect_redis_1.default(express_session_1.default);
    const redis = new ioredis_1.default(process.env.REDIS_URL);
    app.set("proxy", 1);
    app.use(express_session_1.default({
        name: constants_1.SESSION_COOKIE,
        store: new redisStore({
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: "lax",
            secure: constants_1.__prod__,
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [user_1.UserResolver, post_1.PostResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: createUserLoader_1.createUserLoader(),
            upvoteLoader: createUpvoteLoader_1.createUpvoteLoader(),
        }),
    });
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.listen(parseInt(process.env.PORT), () => {
        console.log(`server started on port ${process.env.PORT}`);
    });
});
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map