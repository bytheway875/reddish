import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Field,
  InputType,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 100);
  }

  @FieldResolver(() => User)
  creator(
    @Root() post: Post,
    @Ctx() { userLoader }: MyContext
  ) {
    return userLoader.load(post.creatorId)
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { upvoteLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null
    }
    const upvote = await upvoteLoader.load({postId: post.id, userId: req.session.userId})
    return upvote ? upvote.value : null;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .orderBy('p."createdAt"', "DESC")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //   .take(realLimitPlusOne);

    // if (cursor) {
    //   qb.where('"createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }
    const replacements: any[] = [realLimitPlusOne];
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    // const posts = await getConnection().query(
    //   `
    //   select p.*, 
    //   ${
    //     req.session.userId
    //       ? '(select value from upvote where "userId" = $2 and "postId" = p.id) "voteStatus"'
    //       : 'null as "voteStatus"'
    //   }
    //   from post p
    //   ${cursor ? `where p."createdAt" < $${replacements.length}` : ""}
    //   order by p."createdAt" DESC
    //   limit $1
    // `,
    //   replacements
    // );

    const posts = await getConnection().query(
      `
      select p.* 
      from post p
      ${cursor ? `where p."createdAt" < $${replacements.length}` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length == realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const response = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set( { title, text })
      .where('id = :id AND "creatorId" = :creatorId', { id, creatorId: req.session.userId })
      .returning("*")
      .execute();
    
    return response.raw[0] as any;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpvote = value !== -1;
    const realValue = isUpvote ? 1 : -1;
    const { userId } = req.session;
    const existingVote = await Upvote.findOne({ userId, postId });
    if (existingVote && existingVote?.value !== realValue) {
      console.log("first", realValue, postId, userId);
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          update upvote
          set value = $1
          where "postId" = $2 and "userId" = $3;
          `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
          update post p
          set points = points + $1
          where p.id = $2;
          `,
          [realValue * 2, postId]
        );
      });
    } else if (existingVote) {
      // noop -- existing vote in same direction.
    } else if (!existingVote) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          insert into upvote("userId", "postId", "value")
          values ($1, $2, $3);`,
          [userId, postId, realValue]
        );

        await tm.query(
          `
          update post p
          set points = points + $1
          where p.id = $2;
          `,
          [realValue, postId]
        );
      });
    }
    return true;
  }
}
