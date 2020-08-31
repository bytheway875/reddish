import DataLoader from "dataloader";
import { Upvote } from "../entities/Upvote";

export const createUpvoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Upvote | null>(
    async (keys) => {
      const upvotes = await Upvote.findByIds(keys as any);
      const upvoteIdsToUpvote: Record<string, Upvote> = {};
      upvotes.forEach((u) => {
        upvoteIdsToUpvote[`${u.userId}|${u.postId}`] = u;
      });
      return keys.map(
        (key) => upvoteIdsToUpvote[`${key.userId}|${key.postId}`]
      );
    }
  );
