import { 
  users, activities, posts, comments, likes, follows, events, notifications, activityProgress,
  type User, type InsertUser, type Activity, type InsertActivity, 
  type Post, type InsertPost, type Comment, type InsertComment,
  type Event, type InsertEvent, type Notification, type ActivityProgress, type InsertActivityProgress
} from "@shared/schema";
import { getUserPermissions, canUserCreateActivity } from "@shared/permissions";
import { db } from "./db";
import { eq, desc, and, ne, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByDisplayName(displayName: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserPassword(id: number, newPassword: string): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  updateUserSubscription(id: number, customerId: string, subscriptionId: string): Promise<User>;
  
  // Activity operations
  getActivities(limit?: number, offset?: number): Promise<(Activity & { author: User })[]>;
  getActivity(id: number): Promise<(Activity & { author: User }) | undefined>;
  getActivitiesByAuthor(authorId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, updates: Partial<Activity>): Promise<Activity>;
  deleteActivity(id: number): Promise<void>;
  approveActivity(id: number): Promise<Activity>;
  
  // Post operations
  getPosts(limit?: number, offset?: number): Promise<(Post & { author: User, linkedActivity?: Activity })[]>;
  getPost(id: number): Promise<(Post & { author: User, linkedActivity?: Activity }) | undefined>;
  getPostsByAuthor(authorId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post>;
  deletePost(id: number): Promise<void>;
  likePost(userId: number, postId: number): Promise<void>;
  unlikePost(userId: number, postId: number): Promise<void>;
  isPostLikedByUser(userId: number, postId: number): Promise<boolean>;
  
  // Activity Like operations
  likeActivity(userId: number, activityId: number): Promise<void>;
  unlikeActivity(userId: number, activityId: number): Promise<void>;
  isActivityLikedByUser(userId: number, activityId: number): Promise<boolean>;
  incrementActivityViews(activityId: number): Promise<void>;
  
  // Comment operations
  getCommentsByPost(postId: number): Promise<(Comment & { author: User, replies?: (Comment & { author: User })[] })[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, updates: Partial<Comment>): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  getComment(id: number): Promise<Comment | undefined>;
  likeComment(userId: number, commentId: number): Promise<void>;
  
  // Follow operations
  followUser(followerId: number, followingId: number): Promise<void>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  
  // Event operations
  getEvents(limit?: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  joinEvent(userId: number, eventId: number): Promise<void>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  
  // Activity Progress operations
  getActivityProgress(userId: number, activityId: number): Promise<ActivityProgress | undefined>;
  updateActivityProgress(userId: number, activityId: number, progress: Partial<ActivityProgress>): Promise<ActivityProgress>;
  getUserProgress(userId: number): Promise<ActivityProgress[]>;
  
  // Analytics
  getTrendingTags(): Promise<{ tag: string; count: number }[]>;
  getSuggestedUsers(userId: number): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByDisplayName(displayName: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.displayName, displayName));
    return user || undefined;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user || undefined;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserPassword(id: number, newPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ password: newPassword, passwordResetToken: null, passwordResetExpires: null })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user || undefined;
  }

  async updateUserSubscription(id: number, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionTier: 'premium'
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getActivities(limit = 50, offset = 0): Promise<(Activity & { author: User })[]> {
    const results = await db
      .select()
      .from(activities)
      .leftJoin(users, eq(activities.authorId, users.id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(activities.createdAt));

    return results
      .filter(result => result.users)
      .map(result => ({
        ...result.activities,
        author: result.users!
      }));
  }

  async getActivity(id: number): Promise<(Activity & { author: User }) | undefined> {
    const [result] = await db
      .select()
      .from(activities)
      .leftJoin(users, eq(activities.authorId, users.id))
      .where(eq(activities.id, id));

    if (!result || !result.users) return undefined;

    return {
      ...result.activities,
      author: result.users
    };
  }

  async getActivitiesByAuthor(authorId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.authorId, authorId))
      .orderBy(desc(activities.createdAt));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();

    // Increment user's activities created count
    if (insertActivity.authorId) {
      await db
        .update(users)
        .set({ activitiesCreated: sql`${users.activitiesCreated} + 1` })
        .where(eq(users.id, insertActivity.authorId));
    }

    return activity;
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity> {
    const [activity] = await db
      .update(activities)
      .set(updates)
      .where(eq(activities.id, id))
      .returning();
    return activity;
  }

  async deleteActivity(id: number): Promise<void> {
    await db.delete(activities).where(eq(activities.id, id));
  }

  async approveActivity(id: number): Promise<Activity> {
    const [activity] = await db
      .update(activities)
      .set({ isApproved: true })
      .where(eq(activities.id, id))
      .returning();
    return activity;
  }

  async getPosts(limit = 50, offset = 0): Promise<(Post & { author: User, linkedActivity?: Activity })[]> {
    const results = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(activities, eq(posts.linkedActivityId, activities.id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(posts.createdAt));

    return results
      .filter(result => result.users)
      .map(result => ({
        ...result.posts,
        author: result.users!,
        linkedActivity: result.activities || undefined
      }));
  }

  async getPost(id: number): Promise<(Post & { author: User, linkedActivity?: Activity }) | undefined> {
    const [result] = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(activities, eq(posts.linkedActivityId, activities.id))
      .where(eq(posts.id, id));

    if (!result || !result.users) return undefined;

    return {
      ...result.posts,
      author: result.users,
      linkedActivity: result.activities || undefined
    };
  }

  async getPostsByAuthor(authorId: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();

    // Increment user's posts created count
    if (insertPost.authorId) {
      await db
        .update(users)
        .set({ postsCreated: sql`${users.postsCreated} + 1` })
        .where(eq(users.id, insertPost.authorId));
    }

    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async likePost(userId: number, postId: number): Promise<void> {
    await db.insert(likes).values({ userId, postId });
    await db
      .update(posts)
      .set({ likes: sql`${posts.likes} + 1` })
      .where(eq(posts.id, postId));
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    await db
      .update(posts)
      .set({ likes: sql`GREATEST(0, ${posts.likes} - 1)` })
      .where(eq(posts.id, postId));
  }

  async isPostLikedByUser(userId: number, postId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return !!like;
  }

  async likeActivity(userId: number, activityId: number): Promise<void> {
    await db.insert(likes).values({ userId, activityId });
    await db
      .update(activities)
      .set({ likes: sql`${activities.likes} + 1` })
      .where(eq(activities.id, activityId));
  }

  async unlikeActivity(userId: number, activityId: number): Promise<void> {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.activityId, activityId)));
    await db
      .update(activities)
      .set({ likes: sql`GREATEST(0, ${activities.likes} - 1)` })
      .where(eq(activities.id, activityId));
  }

  async isActivityLikedByUser(userId: number, activityId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.activityId, activityId)));
    return !!like;
  }

  async getCommentsByPost(postId: number): Promise<(Comment & { author: User, replies?: (Comment & { author: User })[] })[]> {
    const results = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);

    // Group comments by parent-child relationship
    const commentMap = new Map<number, Comment & { author: User, replies: (Comment & { author: User })[] }>();
    const topLevelComments: (Comment & { author: User, replies: (Comment & { author: User })[] })[] = [];

    for (const result of results) {
      if (!result.users) continue;

      const comment = {
        ...result.comments,
        author: result.users,
        replies: [] as (Comment & { author: User })[]
      };

      commentMap.set(comment.id, comment);

      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    }

    return topLevelComments;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();

    // Increment post's comment count
    if (insertComment.postId) {
      await db
        .update(posts)
        .set({ comments: sql`${posts.comments} + 1` })
        .where(eq(posts.id, insertComment.postId));
    }

    return comment;
  }

  async updateComment(id: number, updates: Partial<Comment>): Promise<Comment> {
    const [comment] = await db
      .update(comments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async likeComment(userId: number, commentId: number): Promise<void> {
    await db.insert(likes).values({ userId, commentId });
    await db
      .update(comments)
      .set({ likes: sql`${comments.likes} + 1` })
      .where(eq(comments.id, commentId));
  }

  async followUser(followerId: number, followingId: number): Promise<void> {
    await db.insert(follows).values({ followerId, followingId });
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async getFollowers(userId: number): Promise<User[]> {
    const results = await db
      .select()
      .from(follows)
      .leftJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));

    return results
      .filter(result => result.users)
      .map(result => result.users!);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const results = await db
      .select()
      .from(follows)
      .leftJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));

    return results
      .filter(result => result.users)
      .map(result => result.users!);
  }

  async getEvents(limit = 10): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .limit(limit)
      .orderBy(desc(events.date));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async joinEvent(userId: number, eventId: number): Promise<void> {
    // This would typically be a separate table, but for simplicity we'll increment the attendees count
    await db
      .update(events)
      .set({ attendees: sql`${events.attendees} + 1` })
      .where(eq(events.id, eventId));
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async getTrendingTags(): Promise<{ tag: string; count: number }[]> {
    // This would require a more complex query to extract tags from posts
    return [];
  }

  async getSuggestedUsers(userId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(ne(users.id, userId))
      .limit(5);
  }

  // Activity Progress operations
  async getActivityProgress(userId: number, activityId: number): Promise<ActivityProgress | undefined> {
    const [progress] = await db
      .select()
      .from(activityProgress)
      .where(and(eq(activityProgress.userId, userId), eq(activityProgress.activityId, activityId)));
    return progress || undefined;
  }

  async updateActivityProgress(userId: number, activityId: number, progress: Partial<ActivityProgress>): Promise<ActivityProgress> {
    const existing = await this.getActivityProgress(userId, activityId);
    let wasAlreadyMastered = existing?.mastered || false;
    
    let result;
    if (existing) {
      const [updated] = await db
        .update(activityProgress)
        .set({ ...progress, updatedAt: new Date() })
        .where(and(eq(activityProgress.userId, userId), eq(activityProgress.activityId, activityId)))
        .returning();
      result = updated;
    } else {
      const [created] = await db
        .insert(activityProgress)
        .values({
          userId,
          activityId,
          tried: false,
          mastered: false,
          favorite: false,
          ...progress,
        })
        .returning();
      result = created;
    }

    // Update activity completion count when mastered status changes
    if (progress.mastered !== undefined) {
      if (progress.mastered && !wasAlreadyMastered) {
        // User just marked as mastered - increment completion count
        await db
          .update(activities)
          .set({ completions: sql`completions + 1` })
          .where(eq(activities.id, activityId));
        console.log(`Incremented completion count for activity ${activityId}`);
      } else if (!progress.mastered && wasAlreadyMastered) {
        // User unmarked as mastered - decrement completion count
        await db
          .update(activities)
          .set({ completions: sql`GREATEST(0, completions - 1)` })
          .where(eq(activities.id, activityId));
        console.log(`Decremented completion count for activity ${activityId}`);
      }
    }

    return result;
  }

  async getUserProgress(userId: number): Promise<ActivityProgress[]> {
    return await db
      .select()
      .from(activityProgress)
      .where(eq(activityProgress.userId, userId))
      .orderBy(desc(activityProgress.updatedAt));
  }

  async incrementActivityViews(activityId: number): Promise<void> {
    await db
      .update(activities)
      .set({ views: sql`views + 1` })
      .where(eq(activities.id, activityId));
  }
}

export const storage = new DatabaseStorage();