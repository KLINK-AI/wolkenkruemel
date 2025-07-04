import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Flag, 
  MessageSquare, 
  Activity,
  User,
  AlertTriangle
} from "lucide-react";

interface ModerationItem {
  id: number;
  type: 'post' | 'comment' | 'activity' | 'user';
  content: string;
  author: {
    id: number;
    displayName: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  reportCount?: number;
  createdAt: string;
}

export default function CommunityModeration() {
  const [selectedTab, setSelectedTab] = useState("pending");
  const [reviewingItem, setReviewingItem] = useState<ModerationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingItems, isLoading: loadingPending } = useQuery({
    queryKey: ["/api/admin/moderation/pending"],
    queryFn: async () => {
      const response = await fetch("/api/admin/moderation/pending");
      if (!response.ok) throw new Error("Failed to fetch pending items");
      return response.json();
    },
  });

  const { data: reportedItems, isLoading: loadingReported } = useQuery({
    queryKey: ["/api/admin/moderation/reported"],
    queryFn: async () => {
      const response = await fetch("/api/admin/moderation/reported");
      if (!response.ok) throw new Error("Failed to fetch reported items");
      return response.json();
    },
  });

  const { data: moderationStats } = useQuery({
    queryKey: ["/api/admin/moderation/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/moderation/stats");
      if (!response.ok) throw new Error("Failed to fetch moderation stats");
      return response.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: number; itemType: string }) => {
      await apiRequest("POST", `/api/admin/moderation/${itemType}/${itemId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Item Approved",
        description: "The content has been approved and is now visible to the community.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation"] });
      setReviewingItem(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ 
      itemId, 
      itemType, 
      reason 
    }: { 
      itemId: number; 
      itemType: string; 
      reason: string;
    }) => {
      await apiRequest("POST", `/api/admin/moderation/${itemType}/${itemId}/reject`, {
        reason,
      });
    },
    onSuccess: () => {
      toast({
        title: "Item Rejected",
        description: "The content has been rejected and removed from the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation"] });
      setReviewingItem(null);
      setRejectionReason("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (item: ModerationItem) => {
    approveMutation.mutate({
      itemId: item.id,
      itemType: item.type,
    });
  };

  const handleReject = (item: ModerationItem) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this content.",
        variant: "destructive",
      });
      return;
    }

    rejectMutation.mutate({
      itemId: item.id,
      itemType: item.type,
      reason: rejectionReason,
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'post':
        return MessageSquare;
      case 'comment':
        return MessageSquare;
      case 'activity':
        return Activity;
      case 'user':
        return User;
      default:
        return MessageSquare;
    }
  };

  const renderModerationItem = (item: ModerationItem) => {
    const Icon = getItemIcon(item.type);
    
    return (
      <Card key={item.id} className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Badge>
                  {item.reportCount && item.reportCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <Flag className="w-3 h-3 mr-1" />
                      {item.reportCount} reports
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">{formatTimeAgo(item.createdAt)}</span>
                </div>
                <p className="text-sm font-medium text-neutral mb-1">
                  By: {item.author.displayName} ({item.author.email})
                </p>
                <p className="text-sm text-gray-700 line-clamp-3">{item.content}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewingItem(item)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Review
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApprove(item)}
                disabled={approveMutation.isPending}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewingItem(item)}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Pending Review</p>
                <p className="text-2xl font-bold text-orange-500">
                  {moderationStats?.pending || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flag className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Reported Items</p>
                <p className="text-2xl font-bold text-red-500">
                  {moderationStats?.reported || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Approved Today</p>
                <p className="text-2xl font-bold text-green-500">
                  {moderationStats?.approvedToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Rejected Today</p>
                <p className="text-2xl font-bold text-red-500">
                  {moderationStats?.rejectedToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="reported">Reported Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-6">
              {loadingPending ? (
                <div className="text-center py-8">
                  <p>Loading pending items...</p>
                </div>
              ) : pendingItems && pendingItems.length > 0 ? (
                <div>
                  {pendingItems.map((item: ModerationItem) => renderModerationItem(item))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending items for review.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reported" className="mt-6">
              {loadingReported ? (
                <div className="text-center py-8">
                  <p>Loading reported items...</p>
                </div>
              ) : reportedItems && reportedItems.length > 0 ? (
                <div>
                  {reportedItems.map((item: ModerationItem) => renderModerationItem(item))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reported items.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Review Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Content Type:</p>
                <Badge variant="outline">{reviewingItem.type}</Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Author:</p>
                <p className="text-sm">{reviewingItem.author.displayName} ({reviewingItem.author.email})</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Content:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm">{reviewingItem.content}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Rejection Reason (if rejecting):</p>
                <Textarea
                  placeholder="Provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReviewingItem(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApprove(reviewingItem)}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(reviewingItem)}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
