import {
  Resolver,
  Query,
  Field,
  Arg,
  Ctx,
  Mutation,
  ObjectType,
  FieldResolver,
  Root,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import argon2 from "argon2";
import { SESSION_COOKIE, FORGET_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordInput } from "../gqlTypes/UsernamePasswordInput";
import { FieldError } from "../gqlTypes/FieldError";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  // only allow users to see their own email -- not other peoples'.
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) {
      return user.email;
    }

    return "";
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return await User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors.length) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    let user = 5 as any;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: options.email,
          username: options.username,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      console.log(err);
      // duplicate username error code.
      if (err.code == "23505") {
        console.log(err);
        if (err.detail.includes("email")) {
          return {
            errors: [
              {
                field: "email",
                message: "Email is already taken",
              },
            ],
          };
        } else {
          return {
            errors: [
              {
                field: "username",
                message: "Username is already taken.",
              },
            ],
          };
        }
      } else {
        return {
          errors: [
            {
              field: "",
              message: "Unknown error. Try again or contact support.",
            },
          ],
        };
      }
    }
    req.session.userId = user.id;
    return { user };
  }
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,

    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    });
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Incorrect username / email. Try again.",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password. Try again.",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((error) => {
        res.clearCookie(SESSION_COOKIE);
        if (error) {
          console.log(error);
          resolve(false);
        }
        resolve(true);
      })
    );
  }
  @Mutation(() => Boolean)
  async forgotPassword(
    @Ctx() { redis }: MyContext,
    @Arg("email") email: string
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    } else {
      const token = v4();
      redis.set(
        FORGET_PASSWORD_PREFIX + token,
        user.id,
        "ex",
        1000 * 60 * 60 * 24 * 3
      ); // 3 days
      const html = `<div><a href="http://localhost:3000/change-password/${token}">Reset Password</a></div>`;
      sendEmail({ to: user.email, subject: "RestPassword", html });
      return true;
    }
  }
  @Mutation(() => UserResponse)
  async changePassword(
    @Ctx() { redis, req }: MyContext,
    @Arg("newPassword") newPassword: string,
    @Arg("token") token: string
  ): Promise<UserResponse> {
    if (newPassword.length < 8) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password must be at least 8 characters.",
          },
        ],
      };
    }
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Your reset token is expired!",
          },
        ],
      };
    }
    const user = await User.findOne(parseInt(userId));
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }
    const password = await argon2.hash(newPassword);
    await User.update({ id: parseInt(userId) }, { password });
    redis.del(key);
    // log in user after changing password
    req.session.userId = user.id;

    return { user };
  }
}
