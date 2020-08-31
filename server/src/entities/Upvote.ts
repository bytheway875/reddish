import { ObjectType, Field } from "type-graphql";
import { Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

// many to many.
// user <--> post

@ObjectType()
@Entity()
export class Upvote extends BaseEntity {
  @Column({ type: "int" })
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.upvotes)
  user: User;

  // @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.upvotes, {
    onDelete: "CASCADE",
  })
  post: Post;
}
