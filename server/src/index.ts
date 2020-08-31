import "reflect-metadata";
// import { MikroORM } from "@mikro-orm/core";
// import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import cors from "cors";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { __prod__, SESSION_COOKIE } from "./constants";
// import { sendEmail } from "./utils/sendEmail";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path";
import { Upvote } from "./entities/Upvote";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "lireddit2",
    username: "shannonbyrne",
    password: "",
    logging: true,
    synchronize: !__prod__,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Upvote],
  });

  conn.runMigrations();

  // sendEmail({
  //   to: "fakeemail@gmail.com",
  //   subject: "Hello the re",
  //   html: "test email",
  // });
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  const redisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    session({
      name: SESSION_COOKIE,
      store: new redisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "asdfsadfsdfjjkdsjkfdsjfsdjkfsjkhfsd",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      upvoteLoader: createUpvoteLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
