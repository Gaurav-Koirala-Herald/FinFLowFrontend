import { useEffect, useState } from 'react';
import { MessageSquare, Users, ThumbsUp, Heart, MessageCircle, Share2, Plus, X, Send, Copy, Check, Loader2 } from 'lucide-react';
import { postsService, type PostsDTO, type CreatePostsDTO } from '../services/postsService';
import { interactionService } from '../services/interaction';
import { commentService, type CommentDTO } from '../services/commentService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from "sonner";

export default function FinancialForum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostsDTO[]>([]);
  const [comments, setComments] = useState<{ [postId: number]: CommentDTO[] }>({});
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());

  const popularTopics = [
    '#investing', '#budgeting', '#stocks', '#sidehustles',
    '#crypto', '#personalfinance', '#retirement', '#taxes'
  ];

  const guidelines = [
    'Be respectful and constructive',
    'Share ideas, not personal financial attacks',
    'No financial advice without disclosures',
    'No promotional content without approval',
    'Cite sources when sharing information'
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (user?.userId) {
      checkUserLikes();
    }
  }, [posts, user]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postsService.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const checkUserLikes = async () => {
    if (!user?.userId) return;

    const likedSet = new Set<number>();
    for (const post of posts) {
      try {
        const hasLiked = await interactionService.hasUserLiked(post.id, user.userId.toString());
        if (hasLiked) {
          likedSet.add(post.id);
        }
      } catch (error) {
        console.error(`Error checking like status for post ${post.id}:`, error);
      }
    }
    setLikedPosts(likedSet);
  };

  const loadComments = async (postId: number) => {
    try {
      setLoadingComments(prev => new Set(prev).add(postId));
      const data = await commentService.getCommentsByPostId(postId);
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error("Failed to load comments. Please try again later.");
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Title and content cannot be empty.");
      return;
    }

    if (!user?.userId) {
      toast.error("You must be logged in to create a post");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: CreatePostsDTO = {
        userId: user.userId.toString(),
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        createdAt: new Date()
      };

      const createdPost = await postsService.createPost(requestData);
      setPosts(prevPosts => [createdPost, ...prevPosts]);

      setNewPost({ title: '', content: '', tags: '' });
      setShowNewPostModal(false);
      toast.success("Post created successfully!");
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!user?.userId) {
      toast.error("You must be logged in to like posts");
      return;
    }

    try {
      await interactionService.toggleLike(postId, user.userId.toString());

      const wasLiked = likedPosts.has(postId);
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likeCount: wasLiked ? post.likeCount - 1 : post.likeCount + 1
          };
        }
        return post;
      }));

      toast.success(wasLiked ? "Like removed" : "Post liked!");
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Failed to update like. Please try again.");
    }
  };

  const toggleComments = async (postId: number) => {
    const isExpanded = expandedComments.has(postId);

    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    if (!isExpanded && !comments[postId]) {
      await loadComments(postId);
    }
  };

  const handleAddComment = async (postId: number) => {
    const content = newComment[postId]?.trim();
    if (!content) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (!user?.userId) {
      toast.error("You must be logged in to comment");
      return;
    }

    try {
      const commentDTO: CommentDTO = {
        id: 0,
        postId,
        userId: user.userId.toString(),
        content,
        createdAt: new Date()
      };

      const createdComment = await commentService.createCommentAsync(commentDTO);

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), createdComment]
      }));

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        )
      );

      setNewComment({ ...newComment, [postId]: '' });
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to add comment. Please try again.");
    }
  };

  const handleCopyLink = (postId: number) => {
    const url = `${window.location.origin}/forum/post/${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2000);
      toast.success("Post link copied to clipboard!");
    });
  };

  const handleShare = async (postId: number) => {
    if (!user?.userId) {
      toast.error("You must be logged in to share posts");
      return;
    }

    try {
      await interactionService.toggleShare(postId, user.userId.toString());

      toast.success("Post shared successfully!");
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error("Failed to share post. Please try again.")
    }
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (userId: string) => {
    return `U${userId.slice(0, 2)}`;
  };

  const filteredPosts = selectedTopic
    ? posts.filter(post => post.title.toLowerCase().includes(selectedTopic.replace('#', '')) ||
      post.content.toLowerCase().includes(selectedTopic.replace('#', '')))
    : posts;

  const stats = [
    { icon: MessageSquare, label: 'Total Posts', count: posts.length.toString(), bg: 'bg-blue-500' },
    { icon: Users, label: 'Comments', count: posts.reduce((sum, post) => sum + post.commentCount, 0).toString(), bg: 'bg-purple-500' },
    { icon: ThumbsUp, label: 'Total Likes', count: posts.reduce((sum, post) => sum + post.likeCount, 0).toString(), bg: 'bg-green-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-blue-600 font-semibold text-lg">Loading Forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="bg-white/80 backdrop-blur-sm px-6 py-12 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Financial Forum
          </h1>
          <p className="text-gray-600 mb-6">
            Connect with our community to discuss financial strategies, share insights, and get advice from peers.
          </p>
          <div className="flex gap-3 text-sm flex-wrap">
            {popularTopics.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTopic(selectedTopic === tag ? null : tag)}
                className={`px-4 py-2 rounded-lg text-gray-700 border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 ${selectedTopic === tag
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500'
                    : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-gray-200 hover:border-blue-300'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className={`${stat.bg} w-10 h-10 rounded-lg flex items-center justify-center shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Posts Section */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Discussions</h2>
                {selectedTopic && (
                  <p className="text-sm text-gray-500 mt-1">
                    Filtered by {selectedTopic}
                    <button
                      onClick={() => setSelectedTopic(null)}
                      className="ml-2 text-blue-600 hover:text-blue-700 underline"
                    >
                      Clear filter
                    </button>
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowNewPostModal(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                New Post
              </button>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-12 shadow-lg border border-gray-200 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <div className="text-gray-500 mb-2">No posts yet</div>
                <div className="text-sm text-gray-400">Be the first to start a discussion!</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => {
                  const postComments = comments[post.id] || [];
                  const showComments = expandedComments.has(post.id);
                  const isLoadingComments = loadingComments.has(post.id);
                  const isLiked = likedPosts.has(post.id);

                  return (
                    <div
                      key={post.id}
                      className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 shadow-md">
                          {getInitials(post.userId.toString())}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold text-gray-900">User {post.userId}</div>
                              <div className="text-xs text-gray-500">{formatDate(post.createdAt)}</div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500 text-sm">
                              <button
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center gap-1 transition-all duration-300 hover:scale-110 ${isLiked ? 'text-red-500' : 'hover:text-red-500'
                                  }`}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span>{post.likeCount}</span>
                              </button>
                              <button
                                onClick={() => toggleComments(post.id)}
                                className="flex items-center gap-1 hover:text-blue-500 transition-all duration-300 hover:scale-110"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.commentCount}</span>
                              </button>
                              <button
                                onClick={() => handleCopyLink(post.id)}
                                className={`transition-all duration-300 hover:scale-110 ${copiedPostId === post.id ? 'text-green-500' : 'hover:text-blue-500'
                                  }`}
                                title="Copy link"
                              >
                                {copiedPostId === post.id ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleShare(post.id)}
                                className="transition-all duration-300 hover:scale-110 hover:text-blue-500"
                                title="Share"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                          <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                            {post.content}
                          </p>

                          {/* Comments Section */}
                          {showComments && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                              {isLoadingComments ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                  <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
                                </div>
                              ) : (
                                <>
                                  {postComments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center font-semibold text-white text-xs flex-shrink-0">
                                        {getInitials(comment.userId)}
                                      </div>
                                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-xs font-semibold text-gray-900">User {comment.userId}</span>
                                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-gray-700">{comment.content}</p>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Add Comment */}
                                  <div className="flex gap-2 mt-3">
                                    <input
                                      type="text"
                                      placeholder="Write a comment..."
                                      value={newComment[post.id] || ''}
                                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                    <button
                                      onClick={() => handleAddComment(post.id)}
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                                    >
                                      <Send className="w-4 h-4" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-500">
              <h3 className="font-bold text-gray-900 mb-3">Popular Topics</h3>
              <p className="text-xs text-gray-500 mb-4">Trending discussions in finance</p>
              <div className="flex flex-wrap gap-2">
                {popularTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-300 hover:scale-105 shadow-sm ${selectedTopic === topic
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-blue-50 hover:to-purple-50 border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-500">
              <h3 className="font-bold text-gray-900 mb-4">Community Guidelines</h3>
              <ul className="space-y-2">
                {guidelines.map((guideline, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5 font-bold">›</span>
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSubmitting && setShowNewPostModal(false)}
          />

          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200  via-purple-50 to-pink-50">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Post
                </h2>
                <p className="text-sm text-gray-600">
                  Share your thoughts with the community
                </p>
              </div>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-all duration-300 hover:rotate-90"
                disabled={isSubmitting}
              >
                <X />
              </button>
            </div>

            <div className="p-6 space-y-4 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30">
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 shadow-sm"
                placeholder="Give your post a catchy title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                disabled={isSubmitting}
              />

              <textarea
                className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent px-4 py-2 outline-none resize-none transition-all duration-300 shadow-sm"
                placeholder="Share your thoughts, questions, or insights with the community..."
                rows={6}
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                disabled={isSubmitting}
              />

              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 shadow-sm"
                placeholder="e.g., investing, budgeting, stocks"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white flex gap-3">
              <button
                onClick={() => setShowNewPostModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="flex-1 bg-primary hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md font-medium flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}