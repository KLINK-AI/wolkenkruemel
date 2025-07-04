import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  insertActivitySchema, insertPostSchema, insertCommentSchema, 
  insertEventSchema 
} from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
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
      const post = await storage.createPost(validatedData);
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

  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
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
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
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

  // Subscription routes
  app.post("/api/get-or-create-subscription", async (req, res) => {
    try {
      const { userId, priceId } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        res.json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });
        return;
      }

      if (!user.email) {
        return res.status(400).json({ message: "User email required" });
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName || user.username,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserSubscription(userId, customer.id, subscription.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
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
        new Date(a.createdAt) >= startOfMonth
      ).length;
      
      const postsToday = posts.filter(p => 
        new Date(p.createdAt) >= startOfDay
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
