import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  insertActivitySchema, insertPostSchema, insertCommentSchema, 
  insertEventSchema, activityProgress, insertUserSchema 
} from "@shared/schema";
import { getUserPermissions, canUserCreateActivity } from "../shared/permissions";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { sendEmail, generateEmailVerificationTemplate } from "./sendgrid";
import crypto from "crypto";
import session from "express-session";
import { Pool } from "@neondatabase/serverless";
import connectPgSimple from "connect-pg-simple";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Configure sessions
  const PgSession = connectPgSimple(session);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'user_sessions'
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));
  
  // Community Posts
  app.get("/api/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPosts(limit, offset);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      
      // Get user to check permissions
      const user = await storage.getUser(validatedData.authorId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user can create posts
      const permissions = getUserPermissions(user);
      if (!permissions.canCreatePosts) {
        return res.status(403).json({ 
          message: "Du musst dich registrieren und deine E-Mail bestätigen, um Posts zu erstellen.",
          code: "EMAIL_NOT_VERIFIED"
        });
      }
      
      const post = await storage.createPost(validatedData);
      
      // Update user's post count
      await storage.updateUser(user.id, { 
        postsCreated: (user.postsCreated || 0) + 1 
      });
      
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const post = await storage.updatePost(id, updates);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePost(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/posts/:id/like", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { userId } = req.body;
      await storage.likePost(userId, postId);
      res.status(200).json({ message: "Post liked" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/posts/:id/like", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { userId } = req.body;
      await storage.unlikePost(userId, postId);
      res.status(200).json({ message: "Post unliked" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update post
  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { content } = req.body;
      const updatedPost = await storage.updatePost(postId, { content });
      res.json(updatedPost);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete post
  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.deletePost(postId);
      res.status(200).json({ message: "Post deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Check if user has liked a post
  app.get("/api/posts/:id/like/:userId", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      const isLiked = await storage.isPostLikedByUser(userId, postId);
      res.json({ isLiked });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Unlike post
  app.post("/api/posts/:id/unlike", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { userId } = req.body;
      await storage.unlikePost(userId, postId);
      res.json({ message: "Post unliked" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete post
  app.post("/api/posts/:id/delete", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { userId } = req.body;
      
      // Check if user is the author
      const post = await storage.getPost(postId);
      if (!post || post.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      await storage.deletePost(postId);
      res.json({ message: "Post deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Activity likes
  app.post("/api/activities/:id/like", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const { userId } = req.body;
      await storage.likeActivity(userId, activityId);
      res.status(200).json({ message: "Activity liked" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/activities/:id/unlike", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const { userId } = req.body;
      await storage.unlikeActivity(userId, activityId);
      res.status(200).json({ message: "Activity unliked" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/activities/:id/like/:userId", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      const isLiked = await storage.isActivityLikedByUser(userId, activityId);
      res.json({ isLiked });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Comments
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { content, authorId } = req.body;
      
      const commentData = {
        content,
        authorId,
        postId,
      };
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      
      // Get user to check permissions
      const user = await storage.getUser(validatedData.authorId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user can comment
      const permissions = getUserPermissions(user);
      if (!permissions.canComment) {
        return res.status(403).json({ 
          message: "Du musst dich registrieren und deine E-Mail bestätigen, um Kommentare zu schreiben.",
          code: "EMAIL_NOT_VERIFIED"
        });
      }
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/comments/:id/like", async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const { userId } = req.body;
      await storage.likeComment(userId, commentId);
      res.status(200).json({ message: "Comment liked" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const activities = await storage.getActivities(limit, offset);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      
      // Get user to check permissions
      const user = await storage.getUser(validatedData.authorId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user can create activities
      const permissions = getUserPermissions(user);
      if (!permissions.canCreateActivities) {
        return res.status(403).json({ 
          message: "Premium-Mitgliedschaft erforderlich um Aktivitäten zu erstellen.",
          code: "PREMIUM_REQUIRED"
        });
      }
      
      const activity = await storage.createActivity(validatedData);
      
      // Update user's activity count
      await storage.updateUser(user.id, { 
        activitiesCreated: (user.activitiesCreated || 0) + 1 
      });
      
      res.status(201).json(activity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/activities/:id", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }

      // Check if activity exists
      const existingActivity = await storage.getActivity(activityId);
      if (!existingActivity) {
        return res.status(404).json({ message: "Activity not found" });
      }

      // TODO: Check if user is the author
      // if (existingActivity.authorId !== authenticatedUserId) {
      //   return res.status(403).json({ message: "You can only edit your own activities" });
      // }

      const updateSchema = insertActivitySchema.partial();
      const result = updateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.issues });
      }

      const updatedActivity = await storage.updateActivity(activityId, result.data);
      res.json(updatedActivity);
    } catch (error: any) {
      console.error("Error updating activity:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }

      // Check if activity exists
      const existingActivity = await storage.getActivity(activityId);
      if (!existingActivity) {
        return res.status(404).json({ message: "Activity not found" });
      }

      // TODO: Check if user is the author or admin
      // if (existingActivity.authorId !== authenticatedUserId && !isAdmin) {
      //   return res.status(403).json({ message: "You can only delete your own activities" });
      // }

      await storage.deleteActivity(activityId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/activities/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.approveActivity(id);
      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User Following
  app.post("/api/users/:id/follow", async (req, res) => {
    try {
      const followingId = parseInt(req.params.id);
      const { followerId } = req.body;
      await storage.followUser(followerId, followingId);
      res.status(200).json({ message: "User followed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/users/:id/follow", async (req, res) => {
    try {
      const followingId = parseInt(req.params.id);
      const { followerId } = req.body;
      await storage.unfollowUser(followerId, followingId);
      res.status(200).json({ message: "User unfollowed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/following", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Activity Progress
  app.get("/api/activity-progress/:userId/:activityId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const activityId = parseInt(req.params.activityId);
      const progress = await storage.getActivityProgress(userId, activityId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/activity-progress/:userId/:activityId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const activityId = parseInt(req.params.activityId);
      const progress = await storage.updateActivityProgress(userId, activityId, req.body);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user-progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Get all activity progress for this user from database
      const progressData = await db
        .select()
        .from(activityProgress)
        .where(eq(activityProgress.userId, userId));
      
      res.json(progressData);
    } catch (error: any) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getEvents(limit);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/events/:id/join", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { userId } = req.body;
      await storage.joinEvent(userId, eventId);
      res.status(200).json({ message: "Joined event" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id);
      res.status(200).json({ message: "Notification marked as read" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analytics
  app.get("/api/trending-tags", async (req, res) => {
    try {
      const tags = await storage.getTrendingTags();
      res.json(tags);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/suggested-users", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const users = await storage.getSuggestedUsers(userId);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User management
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove sensitive data
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get current user endpoint
  app.get("/api/me", async (req, res) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.session.user;
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User Registration with Double Opt-In
  app.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, displayName } = req.body;
      
      // Check if user already exists by email
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ 
          message: "E-Mail bereits registriert",
          field: "email"
        });
      }

      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ 
          message: "Benutzername bereits vergeben",
          field: "username"
        });
      }

      // Check if display name already exists (displayName should be unique like username)
      const existingUserByDisplayName = await storage.getUserByDisplayName(displayName);
      if (existingUserByDisplayName) {
        return res.status(400).json({ 
          message: "Dieser Anzeigename ist bereits vergeben",
          field: "displayName"
        });
      }

      // Create user with email verification pending
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const userData = {
        username,
        email,
        password, // In production, this should be hashed
        displayName,
        isEmailVerified: false,
        emailVerificationToken,
        role: 'user',
        subscriptionTier: 'free'
      };
      
      const user = await storage.createUser(userData);
      
      // Send verification email
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/verify-email/${emailVerificationToken}`;
      const { text, html } = generateEmailVerificationTemplate(displayName || username, verificationUrl);
      
      const emailSent = await sendEmail({
        to: email,
        from: 'stefan@gen-ai.consulting',
        subject: 'E-Mail bestätigen - Wolkenkrümel',
        text,
        html
      });

      if (!emailSent) {
        console.error('Failed to send verification email');
      }

      res.status(201).json({ 
        message: "Registrierung erfolgreich. Bitte bestätigen Sie Ihre E-Mail-Adresse.",
        userId: user.id 
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Email Verification
  app.get("/api/verify-email/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Ungültiger oder abgelaufener Bestätigungslink" });
      }

      // Verify email
      await storage.updateUser(user.id, { 
        isEmailVerified: true, 
        emailVerificationToken: null 
      });

      // Redirect to success page
      res.redirect(`${req.protocol}://${req.get('host')}/email-verified?success=true`);
    } catch (error: any) {
      console.error('Email verification error:', error);
      res.redirect(`${req.protocol}://${req.get('host')}/email-verified?error=true`);
    }
  });

  // User Login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Ungültige E-Mail oder Passwort" });
      }

      if (!user.isEmailVerified) {
        return res.status(401).json({ message: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse" });
      }

      // Store user in session
      req.session.user = user;
      
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User Logout
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Check activity creation limit
  app.get("/api/users/:id/activity-limit", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const activitiesCreated = user.activitiesCreated || 0;
      const maxActivities = user.subscriptionTier === 'free' ? 5 : Infinity;
      
      res.json({
        activitiesCreated,
        maxActivities,
        canCreateMore: activitiesCreated < maxActivities
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Subscription routes
  app.post("/api/create-subscription", async (req, res) => {
    try {
      const { userId, priceId } = req.body;
      
      if (!userId || !priceId) {
        return res.status(400).json({ message: "userId and priceId are required" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Demo mode for development - simulate subscription creation
      if (priceId === 'price_premium_monthly' || priceId === 'price_premium_yearly') {
        console.log(`Demo subscription created for user ${userId} with plan ${priceId}`);
        
        // Update user to premium status  
        const updatedUser = await storage.updateUser(userId, { 
          subscriptionTier: 'premium'
        });
        
        console.log('User updated to premium:', updatedUser.subscriptionTier);
        
        // Return demo success response
        return res.json({
          subscriptionId: 'demo_sub_' + Date.now(),
          clientSecret: 'demo_client_secret_' + Date.now(),
          status: 'demo_success'
        });
      }

      // Check if user already has an active subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        // If subscription is active, return existing client secret
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          return res.json({
            subscriptionId: subscription.id,
            clientSecret: typeof subscription.latest_invoice === 'object' && subscription.latest_invoice?.payment_intent ? 
              (typeof subscription.latest_invoice.payment_intent === 'object' ? 
                subscription.latest_invoice.payment_intent.client_secret : null) : null,
            status: 'existing'
          });
        }
      }

      if (!user.email) {
        return res.status(400).json({ message: "User email required for subscription" });
      }

      // Create or find customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.displayName || user.username,
        });
        customerId = customer.id;
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserSubscription(userId, customerId, subscription.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        status: 'created'
      });
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe webhook handler
  app.post('/api/stripe-webhook', async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      
      // For now, we'll handle basic webhook events
      const event = req.body;
      
      console.log('Stripe webhook received:', event.type);
      
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;
          
          // Find user by subscription ID and update tier
          const users = await storage.getPosts(); // Temporary way to get all data
          // In production, you'd have a proper method to find by subscription ID
          
          console.log('Payment succeeded for subscription:', subscriptionId);
          break;
          
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          console.log('Subscription updated:', subscription.id, subscription.status);
          break;
          
        default:
          console.log('Unhandled webhook event:', event.type);
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/subscription", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return subscription status based on user's tier
      const subscriptionStatus = {
        tier: user.subscriptionTier || 'free',
        isActive: true,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        features: getFeaturesByTier(user.subscriptionTier || 'free'),
        limits: getLimitsByTier(user.subscriptionTier || 'free'),
      };

      res.json(subscriptionStatus);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/usage", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Get user's current usage stats
      const posts = await storage.getPostsByAuthor(userId);
      const activities = await storage.getActivitiesByAuthor(userId);
      
      // Calculate usage for current period (simplified)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const activitiesThisMonth = activities.filter(a => 
        a.createdAt && new Date(a.createdAt) >= startOfMonth
      ).length;
      
      const postsToday = posts.filter(p => 
        p.createdAt && new Date(p.createdAt) >= startOfDay
      ).length;

      res.json({
        activitiesPerMonth: activitiesThisMonth,
        postsPerDay: postsToday,
        commentsPerDay: 0, // Would need to implement comment tracking
        followersLimit: 0, // Would need to implement follower counting
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin moderation routes
  app.get("/api/admin/moderation/pending", async (req, res) => {
    try {
      // Return items pending approval
      const pendingActivities = await storage.getActivities(50, 0);
      const pendingPosts = await storage.getPosts(50, 0);
      
      const pendingItems = [
        ...pendingActivities.filter(a => !a.isApproved).map(a => ({
          id: a.id,
          type: 'activity',
          content: a.description,
          author: { id: a.authorId, displayName: 'User', email: 'user@example.com' },
          status: 'pending',
          createdAt: a.createdAt,
        })),
        ...pendingPosts.filter(p => !p.isApproved).map(p => ({
          id: p.id,
          type: 'post',
          content: p.content,
          author: p.author,
          status: 'pending',
          createdAt: p.createdAt,
        })),
      ];

      res.json(pendingItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/moderation/reported", async (req, res) => {
    try {
      // Mock reported items - in real app would track reports
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin User Management Routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const { displayName, email, firstName, lastName, location, bio, role, subscriptionTier, isEmailVerified } = req.body;
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "E-Mail bereits registriert" });
      }

      const existingUserByUsername = await storage.getUserByUsername(displayName);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Anzeigename bereits vergeben" });
      }

      const userData = {
        username: displayName, // Use displayName as username for compatibility
        email,
        displayName,
        firstName,
        lastName,
        location,
        bio,
        password: "defaultPassword123", // In production, generate a secure password
        role: role || 'user',
        subscriptionTier: subscriptionTier || 'free',
        isEmailVerified: isEmailVerified || false,
        emailVerificationToken: null
      };
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      const user = await storage.updateUser(userId, updates);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.json({ message: "Benutzer erfolgreich gelöscht" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/moderation/stats", async (req, res) => {
    try {
      // Mock moderation stats
      res.json({
        pending: 5,
        reported: 2,
        approvedToday: 12,
        rejectedToday: 3,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/moderation/:type/:id/approve", async (req, res) => {
    try {
      const { type, id } = req.params;
      const itemId = parseInt(id);

      if (type === 'activity') {
        await storage.approveActivity(itemId);
      } else if (type === 'post') {
        await storage.updatePost(itemId, { isApproved: true });
      }

      res.json({ message: "Item approved" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/moderation/:type/:id/reject", async (req, res) => {
    try {
      const { type, id } = req.params;
      const { reason } = req.body;
      const itemId = parseInt(id);

      if (type === 'activity') {
        await storage.deleteActivity(itemId);
      } else if (type === 'post') {
        await storage.deletePost(itemId);
      }

      // In real app, would also notify user of rejection with reason
      res.json({ message: "Item rejected" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User stats endpoint
  app.get("/api/user-stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get activity progress count
      const progressData = await storage.getUserProgress(userId);
      const activitiesCompleted = progressData.filter(p => p.mastered).length;

      // Calculate actual likes received from posts
      const userPosts = await storage.getPostsByAuthor(userId);
      const likesReceived = userPosts.reduce((total, post) => total + (post.likes || 0), 0);
      
      console.log(`User ${userId} posts and likes:`, userPosts.map(p => ({id: p.id, likes: p.likes})));
      console.log(`Total likes received: ${likesReceived}`);

      res.json({
        activitiesCreated: user.activitiesCreated || 0,
        activitiesCompleted,
        postsCreated: user.postsCreated || 0,
        likesReceived,
        tier: user.subscriptionTier || 'free'
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment routes for subscription management
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "eur",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Create subscription for Premium upgrade
  app.post('/api/create-subscription', async (req, res) => {
    if (!req.session?.user) {
      return res.sendStatus(401);
    }

    try {
      const user = req.user;
      const { priceId } = req.body; // monthly or yearly price ID
      
      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      // Check if user already has a Stripe customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.displayName || user.username,
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with subscription info
      await storage.updateUser(user.id, { 
        stripeSubscriptionId: subscription.id,
        tier: 'premium'
      });

      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice?.payment_intent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret,
      });
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Webhook endpoint for Stripe events
  app.post('/api/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.log('No webhook secret configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          
          if (customer && !customer.deleted) {
            const user = await storage.getUserByStripeCustomerId(customer.id);
            if (user) {
              const isActive = subscription.status === 'active' || subscription.status === 'trialing';
              await storage.updateUser(user.id, {
                tier: isActive ? 'premium' : 'free',
                stripeSubscriptionId: subscription.id
              });
            }
          }
          break;
          
        case 'customer.subscription.deleted':
          const deletedSub = event.data.object;
          const deletedCustomer = await stripe.customers.retrieve(deletedSub.customer as string);
          
          if (deletedCustomer && !deletedCustomer.deleted) {
            const user = await storage.getUserByStripeCustomerId(deletedCustomer.id);
            if (user) {
              await storage.updateUser(user.id, {
                tier: 'free',
                stripeSubscriptionId: null
              });
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).send('Webhook processing failed');
    }

    res.json({ received: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for subscription features
function getFeaturesByTier(tier: string): string[] {
  const features: Record<string, string[]> = {
    free: [
      'Access to community feed',
      'Basic Q&A participation',
      'View official activities',
      'Basic profile features'
    ],
    premium: [
      'Everything in Community',
      'Unlimited activity creation',
      'Priority community support',
      'Access to premium activities',
      'Advanced analytics',
      'Custom profile branding',
      'Event hosting privileges'
    ],
    professional: [
      'Everything in Pro Trainer',
      'Verified trainer badge',
      'Direct messaging with users',
      'Advanced moderation tools',
      'API access for integrations',
      'Priority feature requests',
      'Revenue sharing program'
    ]
  };
  
  return features[tier] || features.free;
}

function getLimitsByTier(tier: string) {
  const limits: Record<string, any> = {
    free: {
      activitiesPerMonth: 1,
      postsPerDay: 5,
      commentsPerDay: 20,
      followersLimit: 50,
    },
    premium: {
      activitiesPerMonth: -1,
      postsPerDay: 50,
      commentsPerDay: 200,
      followersLimit: 1000,
    },
    professional: {
      activitiesPerMonth: -1,
      postsPerDay: -1,
      commentsPerDay: -1,
      followersLimit: -1,
    }
  };
  
  return limits[tier] || limits.free;
}
