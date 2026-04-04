import { useEffect, useState } from 'react';
import { MessageSquare, Users, ThumbsUp, Heart, MessageCircle, Share2, Plus, X, Send, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { postsService, type PostsDTO, type CreatePostsDTO } from '../services/postsService';
import { interactionService } from '../services/interaction';
import { commentService, type CommentDTO } from '../services/commentService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from "sonner";

const POST_TITLE_MAX = 150
const POST_CONTENT_MAX = 2000
const COMMENT_MAX = 500

const validatePost = (title: string, content: string) => {
  const errors: { title?: string; content?: string } = {}
  if (!title.trim()) errors.title = "Title is required."
  else if (title.trim().length < 5) errors.title = "Title must be at least 5 characters."
  else if (title.trim().length > POST_TITLE_MAX) errors.title = `Title must be under ${POST_TITLE_MAX} characters.`

  if (!content.trim()) errors.content = "Content is required."
  else if (content.trim().length < 10) errors.content = "Content must be at least 10 characters."
  else if (content.trim().length > POST_CONTENT_MAX) errors.content = `Content must be under ${POST_CONTENT_MAX} characters.`

  return errors
}

const validateComment = (comment: string) => {
  if (!comment.trim()) return "Comment cannot be empty."
  if (comment.trim().length < 2) return "Comment must be at least 2 characters."
  if (comment.trim().length > COMMENT_MAX) return `Comment must be under ${COMMENT_MAX} characters.`
  return null
}

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
      <AlertCircle size={12} />
      {message}
    </p>
  ) : null

const CharCount = ({ current, max }: { current: number; max: number }) => (
  <span className={`text-xs ${current > max * 0.9 ? current > max ? 'text-red-500' : 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
    {current}/{max}
  </span>
)

export default function FinancialForum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostsDTO[]>([]);
  const [comments, setComments] = useState<{ [postId: number]: CommentDTO[] }>({});
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [postErrors, setPostErrors] = useState<{ title?: string; content?: string }>({});
  const [postTouched, setPostTouched] = useState<{ title?: boolean; content?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [commentErrors, setCommentErrors] = useState<{ [postId: number]: string }>({});
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());

  const guidelines = [
    'Be respectful and constructive',
    'Share ideas, not personal financial attacks',
    'No financial advice without disclosures',
    'No promotional content without approval',
    'Cite sources when sharing information'
  ];

  useEffect(() => { loadPosts(); }, []);
  useEffect(() => { if (user?.userId) checkUserLikes(); }, [posts, user]);

  // Reset modal state when closed
  const closeModal = () => {
    if (isSubmitting) return
    setShowNewPostModal(false)
    setNewPost({ title: '', content: '', tags: '' })
    setPostErrors({})
    setPostTouched({})
  }

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postsService.getAllPosts();
      setPosts(data);
    } catch (error) {
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
        if (hasLiked) likedSet.add(post.id);
      } catch {}
    }
    setLikedPosts(likedSet);
  };

  const loadComments = async (postId: number) => {
    try {
      setLoadingComments(prev => new Set(prev).add(postId));
      const data = await commentService.getCommentsByPostId(postId);
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch {
      toast.error("Failed to load comments. Please try again later.");
    } finally {
      setLoadingComments(prev => { const s = new Set(prev); s.delete(postId); return s; });
    }
  };

  const handlePostBlur = (field: 'title' | 'content') => {
    setPostTouched(prev => ({ ...prev, [field]: true }))
    const errs = validatePost(newPost.title, newPost.content)
    setPostErrors(errs)
  }

  const handleCreatePost = async () => {
    if (!user?.userId) { toast.error("You must be logged in to create a post"); return; }

    // Mark all touched and validate
    setPostTouched({ title: true, content: true })
    const errs = validatePost(newPost.title, newPost.content)
    setPostErrors(errs)
    if (Object.keys(errs).length > 0) return

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
      setPostErrors({})
      setPostTouched({})
      setShowNewPostModal(false);
      toast.success("Post created successfully!");
    } catch {
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!user?.userId) { toast.error("You must be logged in to like posts"); return; }
    try {
      await interactionService.toggleLike(postId, user.userId.toString());
      const wasLiked = likedPosts.has(postId);
      setLikedPosts(prev => {
        const s = new Set(prev);
        wasLiked ? s.delete(postId) : s.add(postId);
        return s;
      });
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1 } : p
      ));
      toast.success(wasLiked ? "Like removed" : "Post liked!");
    } catch {
      toast.error("Failed to update like. Please try again.");
    }
  };

  const toggleComments = async (postId: number) => {
    const isExpanded = expandedComments.has(postId);
    setExpandedComments(prev => {
      const s = new Set(prev);
      isExpanded ? s.delete(postId) : s.add(postId);
      return s;
    });
    if (!isExpanded && !comments[postId]) await loadComments(postId);
  };

  const handleAddComment = async (postId: number) => {
    if (!user?.userId) { toast.error("You must be logged in to comment"); return; }

    const content = newComment[postId] ?? ''
    const error = validateComment(content)
    if (error) {
      setCommentErrors(prev => ({ ...prev, [postId]: error }))
      return
    }
    setCommentErrors(prev => { const s = { ...prev }; delete s[postId]; return s })

    try {
      const commentDTO: CommentDTO = {
        id: 0, postId,
        userId: user.userId.toString(),
        content: content.trim(),
        createdAt: new Date()
      };
      const createdComment = await commentService.createCommentAsync(commentDTO);
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), createdComment] }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      toast.success("Comment added successfully!");
    } catch {
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
    if (!user?.userId) { toast.error("You must be logged in to share posts"); return; }
    try {
      await interactionService.toggleShare(postId, user.userId.toString());
      toast.success("Post shared successfully!");
    } catch {
      toast.error("Failed to share post. Please try again.");
    }
  };

  const formatDate = (dateString: Date) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getInitials = (userId: string) => `U${userId.slice(0, 2)}`;

  const filteredPosts = selectedTopic
    ? posts.filter(p =>
        p.title.toLowerCase().includes(selectedTopic.replace('#', '')) ||
        p.content.toLowerCase().includes(selectedTopic.replace('#', ''))
      )
    : posts;

  const stats = [
    { icon: MessageSquare, label: 'Total Posts', count: posts.length.toString(), bg: 'bg-blue-500' },
    { icon: Users, label: 'Comments', count: posts.reduce((s, p) => s + p.commentCount, 0).toString(), bg: 'bg-purple-500' },
    { icon: ThumbsUp, label: 'Total Likes', count: posts.reduce((s, p) => s + p.likeCount, 0).toString(), bg: 'bg-green-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg">Loading Forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-white/80 dark:bg-gray-950 backdrop-blur-sm px-6 py-12 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Financial Forum
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect with our community to discuss financial strategies, share insights, and get advice from peers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/90 dark:bg-gray-900 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className={`${stat.bg} w-10 h-10 rounded-lg flex items-center justify-center shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.count}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Posts */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Discussions</h2>
                {selectedTopic && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Filtered by {selectedTopic}
                    <button onClick={() => setSelectedTopic(null)} className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 underline">
                      Clear filter
                    </button>
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowNewPostModal(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                New Post
              </button>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="bg-white/90 dark:bg-gray-900 backdrop-blur-sm rounded-lg p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <div className="text-gray-500 dark:text-gray-400 mb-2">No posts yet</div>
                <div className="text-sm text-gray-400 dark:text-gray-500">Be the first to start a discussion!</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => {
                  const postComments = comments[post.id] || [];
                  const showComments = expandedComments.has(post.id);
                  const isLoadingComments = loadingComments.has(post.id);
                  const isLiked = likedPosts.has(post.id);
                  const commentVal = newComment[post.id] ?? ''
                  const commentErr = commentErrors[post.id]

                  return (
                    <div key={post.id} className="bg-white/90 dark:bg-gray-900 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 shadow-md">
                          {getInitials(post.userId.toString())}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">User {post.userId}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                              <button
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center gap-1 transition-all duration-300 hover:scale-110 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span>{post.likeCount}</span>
                              </button>
                              <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.commentCount}</span>
                              </button>
                              <button
                                onClick={() => handleCopyLink(post.id)}
                                className={`transition-all duration-300 hover:scale-110 ${copiedPostId === post.id ? 'text-green-500' : 'hover:text-blue-500 dark:hover:text-blue-400'}`}
                                title="Copy link"
                              >
                                {copiedPostId === post.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                              <button onClick={() => handleShare(post.id)} className="transition-all duration-300 hover:scale-110 hover:text-blue-500 dark:hover:text-blue-400" title="Share">
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{post.title}</h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">{post.content}</p>

                          {/* Comments */}
                          {showComments && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                              {isLoadingComments ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading comments...</span>
                                </div>
                              ) : (
                                <>
                                  {postComments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center font-semibold text-white text-xs flex-shrink-0">
                                        {getInitials(comment.userId)}
                                      </div>
                                      <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">User {comment.userId}</span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Add comment with validation */}
                                  <div className="mt-3 space-y-1">
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={commentVal}
                                        onChange={(e) => {
                                          setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))
                                          // Clear error as user types
                                          if (commentErrors[post.id]) {
                                            setCommentErrors(prev => { const s = { ...prev }; delete s[post.id]; return s })
                                          }
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                        maxLength={COMMENT_MAX + 10}
                                        className={`flex-1 rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                          commentErr ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                      />
                                      <button
                                        onClick={() => handleAddComment(post.id)}
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                                      >
                                        <Send className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                      <FieldError message={commentErr} />
                                      <CharCount current={commentVal.length} max={COMMENT_MAX} />
                                    </div>
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
            <div className="bg-white/90 dark:bg-gray-900 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-500">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Community Guidelines</h3>
              <ul className="space-y-2">
                {guidelines.map((guideline, idx) => (
                  <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5 font-bold">›</span>
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/40 dark:to-gray-900">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Post
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Share your thoughts with the community</p>
              </div>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all duration-300 hover:rotate-90"
              >
                <X />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
              {/* Title field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full rounded-lg border px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 shadow-sm ${
                    postTouched.title && postErrors.title
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Give your post a catchy title"
                  value={newPost.title}
                  onChange={(e) => {
                    setNewPost(prev => ({ ...prev, title: e.target.value }))
                    if (postTouched.title) {
                      const errs = validatePost(e.target.value, newPost.content)
                      setPostErrors(errs)
                    }
                  }}
                  onBlur={() => handlePostBlur('title')}
                  disabled={isSubmitting}
                  maxLength={POST_TITLE_MAX + 10}
                />
                <div className="flex justify-between items-center mt-1">
                  <FieldError message={postTouched.title ? postErrors.title : undefined} />
                  <CharCount current={newPost.title.length} max={POST_TITLE_MAX} />
                </div>
              </div>

              {/* Content field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full rounded-lg border px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all duration-300 shadow-sm ${
                    postTouched.content && postErrors.content
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Share your thoughts, questions, or insights with the community..."
                  rows={6}
                  value={newPost.content}
                  onChange={(e) => {
                    setNewPost(prev => ({ ...prev, content: e.target.value }))
                    if (postTouched.content) {
                      const errs = validatePost(newPost.title, e.target.value)
                      setPostErrors(errs)
                    }
                  }}
                  onBlur={() => handlePostBlur('content')}
                  disabled={isSubmitting}
                  maxLength={POST_CONTENT_MAX + 10}
                />
                <div className="flex justify-between items-center mt-1">
                  <FieldError message={postTouched.content ? postErrors.content : undefined} />
                  <CharCount current={newPost.content.length} max={POST_CONTENT_MAX} />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 flex gap-3">
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isSubmitting}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md font-medium flex items-center justify-center gap-2"
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