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
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
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
  
  // Comment operations
  getCommentsByPost(postId: number): Promise<(Comment & { author: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, updates: Partial<Comment>): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
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
  
  // Analytics
  getTrendingTags(): Promise<{ tag: string; count: number }[]>;
  getSuggestedUsers(userId: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private activities: Map<number, Activity> = new Map();
  private posts: Map<number, Post> = new Map();
  private comments: Map<number, Comment> = new Map();
  private likes: Map<number, { userId: number; postId?: number; commentId?: number }> = new Map();
  private follows: Map<number, { followerId: number; followingId: number }> = new Map();
  private events: Map<number, Event> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private activityProgress: Map<string, ActivityProgress> = new Map();
  
  private currentUserId = 1;
  private currentActivityId = 1;
  private currentPostId = 1;
  private currentCommentId = 1;
  private currentLikeId = 1;
  private currentFollowId = 1;
  private currentEventId = 1;
  private currentNotificationId = 1;
  private currentActivityProgressId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.emailVerificationToken === token);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      status: 'unverified',
      firstName: null,
      lastName: null,
      location: null,
      emailVerificationToken: null,
      isEmailVerified: false,
      role: 'user',
      subscriptionTier: 'free',
      activitiesCreated: 0,
      postsCreated: 0,
      likesReceived: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserSubscription(id: number, customerId: string, subscriptionId: string): Promise<User> {
    return this.updateUser(id, { 
      stripeCustomerId: customerId, 
      stripeSubscriptionId: subscriptionId,
      subscriptionTier: 'premium'
    });
  }

  async getActivities(limit = 20, offset = 0): Promise<(Activity & { author: User })[]> {
    const allActivities = Array.from(this.activities.values())
      .sort((a, b) => (b.createdAt || new Date()).getTime() - (a.createdAt || new Date()).getTime())
      .map(activity => {
        const author = this.users.get(activity.authorId as any) || {
          id: 0,
          username: 'Unknown',
          email: '',
          password: '',
          displayName: 'Unbekannter Benutzer',
          bio: null,
          avatarUrl: null,
          role: 'user',
          subscriptionTier: 'free',
          activitiesCreated: 0,
          postsCreated: 0,
          likesReceived: 0,
          isEmailVerified: false,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return { ...activity, author };
      });
    return allActivities.slice(offset, offset + limit);
  }

  async getActivity(id: number): Promise<(Activity & { author: User }) | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;
    
    const author = activity.authorId ? await this.getUser(activity.authorId) : null;
    const defaultAuthor = {
      id: 0,
      username: 'Unknown',
      email: '',
      password: '',
      displayName: 'Unbekannter Autor',
      bio: null,
      avatarUrl: null,
      role: 'user',
      subscriptionTier: 'free',
      activitiesCreated: 0,
      postsCreated: 0,
      likesReceived: 0,
      isEmailVerified: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return { ...activity, author: author || defaultAuthor };
  }

  async getActivitiesByAuthor(authorId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(activity => 
      typeof activity.authorId === 'string' ? parseInt(activity.authorId) === authorId : activity.authorId === authorId
    );
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      likes: 0,
      completions: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.activities.set(id, activity);
    
    // Update user's activity count
    if (insertActivity.authorId) {
      const user = await this.getUser(insertActivity.authorId);
      if (user) {
        await this.updateUser(insertActivity.authorId, { 
          activitiesCreated: user.activitiesCreated + 1 
        });
      }
    }
    
    return activity;
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity> {
    const activity = this.activities.get(id);
    if (!activity) throw new Error('Activity not found');
    
    const updatedActivity = { ...activity, ...updates, updatedAt: new Date() };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteActivity(id: number): Promise<void> {
    this.activities.delete(id);
  }

  async approveActivity(id: number): Promise<Activity> {
    return this.updateActivity(id, { isApproved: true });
  }

  async getPosts(limit = 20, offset = 0): Promise<(Post & { author: User, linkedActivity?: Activity })[]> {
    const allPosts = Array.from(this.posts.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(offset, offset + limit);
    
    const postsWithAuthors = await Promise.all(
      allPosts.map(async (post) => {
        const author = post.authorId ? await this.getUser(post.authorId) : null;
        const linkedActivity = post.linkedActivityId ? await this.getActivity(post.linkedActivityId) : undefined;
        const defaultAuthor = {
          id: 0,
          username: 'Unknown',
          email: '',
          password: '',
          displayName: 'Unbekannter Benutzer',
          bio: null,
          avatarUrl: null,
          role: 'user',
          subscriptionTier: 'free',
          activitiesCreated: 0,
          postsCreated: 0,
          likesReceived: 0,
          isEmailVerified: false,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return { ...post, author: author || defaultAuthor, linkedActivity };
      })
    );
    
    return postsWithAuthors;
  }

  async getPost(id: number): Promise<(Post & { author: User, linkedActivity?: Activity }) | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const author = await this.getUser(post.authorId);
    const linkedActivity = post.linkedActivityId ? await this.getActivity(post.linkedActivityId) : undefined;
    
    return { ...post, author: author!, linkedActivity };
  }

  async getPostsByAuthor(authorId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.authorId === authorId);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = {
      ...insertPost,
      id,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(id, post);
    
    // Update user's post count
    const user = await this.getUser(insertPost.authorId);
    if (user) {
      await this.updateUser(insertPost.authorId, { 
        postsCreated: user.postsCreated + 1 
      });
    }
    
    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post> {
    const post = this.posts.get(id);
    if (!post) throw new Error('Post not found');
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    this.posts.delete(id);
  }

  async likePost(userId: number, postId: number): Promise<void> {
    const likeId = this.currentLikeId++;
    this.likes.set(likeId, { userId, postId });
    
    const post = this.posts.get(postId);
    if (post) {
      await this.updatePost(postId, { likes: post.likes + 1 });
    }
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    const likeEntry = Array.from(this.likes.entries()).find(
      ([_, like]) => like.userId === userId && like.postId === postId
    );
    
    if (likeEntry) {
      this.likes.delete(likeEntry[0]);
      const post = this.posts.get(postId);
      if (post) {
        await this.updatePost(postId, { likes: Math.max(0, post.likes - 1) });
      }
    }
  }

  async isPostLikedByUser(userId: number, postId: number): Promise<boolean> {
    const likeEntry = Array.from(this.likes.values()).find(
      like => like.userId === userId && like.postId === postId
    );
    return !!likeEntry;
  }

  async getCommentsByPost(postId: number): Promise<(Comment & { author: User })[]> {
    const postComments = Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
    
    const commentsWithAuthors = await Promise.all(
      postComments.map(async (comment) => {
        const author = await this.getUser(comment.authorId);
        return { ...comment, author: author! };
      })
    );
    
    return commentsWithAuthors;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = {
      ...insertComment,
      id,
      likes: 0,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    
    // Update post comment count
    if (insertComment.postId) {
      const post = this.posts.get(insertComment.postId);
      if (post) {
        await this.updatePost(insertComment.postId, { comments: post.comments + 1 });
      }
    }
    
    return comment;
  }

  async updateComment(id: number, updates: Partial<Comment>): Promise<Comment> {
    const comment = this.comments.get(id);
    if (!comment) throw new Error('Comment not found');
    
    const updatedComment = { ...comment, ...updates };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: number): Promise<void> {
    this.comments.delete(id);
  }

  async likeComment(userId: number, commentId: number): Promise<void> {
    const likeId = this.currentLikeId++;
    this.likes.set(likeId, { userId, commentId });
    
    const comment = this.comments.get(commentId);
    if (comment) {
      await this.updateComment(commentId, { likes: comment.likes + 1 });
    }
  }

  async followUser(followerId: number, followingId: number): Promise<void> {
    const followId = this.currentFollowId++;
    this.follows.set(followId, { followerId, followingId });
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    const followEntry = Array.from(this.follows.entries()).find(
      ([_, follow]) => follow.followerId === followerId && follow.followingId === followingId
    );
    
    if (followEntry) {
      this.follows.delete(followEntry[0]);
    }
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter(follow => follow.followingId === userId)
      .map(follow => follow.followerId);
    
    const followers = await Promise.all(
      followerIds.map(id => this.getUser(id))
    );
    
    return followers.filter(Boolean) as User[];
  }

  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter(follow => follow.followerId === userId)
      .map(follow => follow.followingId);
    
    const following = await Promise.all(
      followingIds.map(id => this.getUser(id))
    );
    
    return following.filter(Boolean) as User[];
  }

  async getEvents(limit = 10): Promise<Event[]> {
    return Array.from(this.events.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limit);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = {
      ...insertEvent,
      id,
      attendees: 0,
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async joinEvent(userId: number, eventId: number): Promise<void> {
    const event = this.events.get(eventId);
    if (event) {
      const updatedEvent = { ...event, attendees: event.attendees + 1 };
      this.events.set(eventId, updatedEvent);
    }
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const id = this.currentNotificationId++;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, { ...notification, isRead: true });
    }
  }

  async getTrendingTags(): Promise<{ tag: string; count: number }[]> {
    const tagCounts = new Map<string, number>();
    
    // Count tags from posts
    Array.from(this.posts.values()).forEach(post => {
      post.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    // Count tags from activities
    Array.from(this.activities.values()).forEach(activity => {
      activity.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  async getSuggestedUsers(userId: number): Promise<User[]> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) return [];
    
    // Get users that the current user is not following
    const following = await this.getFollowing(userId);
    const followingIds = new Set(following.map(u => u.id));
    
    return Array.from(this.users.values())
      .filter(user => user.id !== userId && !followingIds.has(user.id))
      .sort((a, b) => b.likesReceived - a.likesReceived)
      .slice(0, 5);
  }

  // Activity Progress operations
  async getActivityProgress(userId: number, activityId: number): Promise<ActivityProgress | undefined> {
    const key = `${userId}-${activityId}`;
    return this.activityProgress.get(key);
  }

  async updateActivityProgress(userId: number, activityId: number, progress: Partial<ActivityProgress>): Promise<ActivityProgress> {
    const key = `${userId}-${activityId}`;
    const existing = this.activityProgress.get(key);
    
    const updatedProgress: ActivityProgress = {
      id: existing?.id || this.currentActivityProgressId++,
      userId,
      activityId,
      tried: false,
      mastered: false,
      favorite: false,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
      ...existing,
      ...progress,
    };
    
    this.activityProgress.set(key, updatedProgress);
    return updatedProgress;
  }
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

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user || undefined;
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

  async updateUserSubscription(id: number, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getActivities(limit = 20, offset = 0): Promise<(Activity & { author: User })[]> {
    return await db
      .select()
      .from(activities)
      .leftJoin(users, eq(activities.authorId, users.id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(activities.createdAt))
      .then(results => 
        results.map(result => ({
          ...result.activities,
          author: result.users || {
            id: 0,
            username: 'Unknown',
            displayName: 'Unbekannter Benutzer',
            email: '',
            password: '',
            bio: null,
            avatarUrl: null,
            role: 'user',
            subscriptionTier: 'free',
            activitiesCreated: 0,
            postsCreated: 0,
            likesReceived: 0,
            isEmailVerified: false,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }))
      );
  }

  async getActivity(id: number): Promise<(Activity & { author: User }) | undefined> {
    const [result] = await db
      .select()
      .from(activities)
      .leftJoin(users, eq(activities.authorId, users.id))
      .where(eq(activities.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.activities,
      author: result.users || {
        id: 0,
        username: 'Unknown',
        displayName: 'Unbekannter Autor',
        email: '',
        password: '',
        bio: null,
        avatarUrl: null,
        role: 'user',
        subscriptionTier: 'free',
        activitiesCreated: 0,
        postsCreated: 0,
        likesReceived: 0,
        isEmailVerified: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        firstName: null,
        lastName: null,
        location: null,
        status: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
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

  async getPosts(limit = 20, offset = 0): Promise<(Post & { author: User, linkedActivity?: Activity })[]> {
    const results = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(activities, eq(posts.linkedActivityId, activities.id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(posts.createdAt));
    
    // Get comment counts for all posts
    const postIds = results.map(result => result.posts.id);
    let commentCounts: Array<{ postId: number | null; count: number }> = [];
    
    if (postIds.length > 0) {
      commentCounts = await db
        .select({
          postId: comments.postId,
          count: sql<number>`count(*)`.as('count')
        })
        .from(comments)
        .where(inArray(comments.postId, postIds))
        .groupBy(comments.postId);
    }
    
    const commentCountMap = new Map(
      commentCounts
        .filter(cc => cc.postId !== null)
        .map(cc => [cc.postId!, Number(cc.count)])
    );
    
    return results.map(result => ({
      ...result.posts,
      comments: commentCountMap.get(result.posts.id) || 0,
      author: result.users || {
        id: 0,
        username: "unknown",
        email: "",
        password: "",
        displayName: "Unbekannter Benutzer",
        firstName: null,
        lastName: null,
        bio: null,
        avatarUrl: null,
        location: null,
        isEmailVerified: false,
        emailVerificationToken: null,
        role: "user",
        subscriptionTier: "free",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        activitiesCreated: 0,
        postsCreated: 0,
        likesReceived: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
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
    
    if (!result) return undefined;
    
    return {
      ...result.posts,
      author: result.users || {
        id: 0,
        username: "unknown",
        email: "",
        password: "",
        displayName: "Unbekannter Benutzer",
        firstName: null,
        lastName: null,
        bio: null,
        avatarUrl: null,
        location: null,
        isEmailVerified: false,
        emailVerificationToken: null,
        role: "user",
        subscriptionTier: "free",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        activitiesCreated: 0,
        postsCreated: 0,
        likesReceived: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
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
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  }

  async isPostLikedByUser(userId: number, postId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .limit(1);
    return result.length > 0;
  }

  async getCommentsByPost(postId: number): Promise<(Comment & { author: User })[]> {
    const results = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
    
    return results.map(result => ({
      ...result.comments,
      author: result.users || {
        id: 0,
        username: "unknown",
        email: "",
        password: "",
        displayName: "Unbekannter Benutzer",
        firstName: null,
        lastName: null,
        bio: null,
        avatarUrl: null,
        location: null,
        isEmailVerified: false,
        emailVerificationToken: null,
        role: "user",
        subscriptionTier: "free",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        activitiesCreated: 0,
        postsCreated: 0,
        likesReceived: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async updateComment(id: number, updates: Partial<Comment>): Promise<Comment> {
    const [comment] = await db
      .update(comments)
      .set(updates)
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async likeComment(userId: number, commentId: number): Promise<void> {
    await db.insert(likes).values({ userId, commentId });
  }

  async followUser(followerId: number, followingId: number): Promise<void> {
    await db.insert(follows).values({ followerId, followingId });
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async getFollowers(userId: number): Promise<User[]> {
    return await db
      .select()
      .from(follows)
      .leftJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
  }

  async getFollowing(userId: number): Promise<User[]> {
    return await db
      .select()
      .from(follows)
      .leftJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
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
    
    if (existing) {
      const [updated] = await db
        .update(activityProgress)
        .set({ ...progress, updatedAt: new Date() })
        .where(and(eq(activityProgress.userId, userId), eq(activityProgress.activityId, activityId)))
        .returning();
      return updated;
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
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
