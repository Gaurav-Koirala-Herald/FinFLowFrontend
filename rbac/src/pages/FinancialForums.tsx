import { useEffect, useState } from 'react';
import { MessageSquare, Users, ThumbsUp, Heart, MessageCircle, Bookmark, Share2, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { postsService, type PostsDTO } from '../services/postsService';
import { interactionService } from '../services/interaction';
import { useAuth } from '../contexts/AuthContext';
import type { CommentDTO } from '../services/commentService';
import { commentService } from '../services/commentService';
export default function FinancialForum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostsDTO[]>([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [sharedPosts, setSharedPosts] = useState<Set<number>>(new Set());
  const [comments,setComments] = useState<CommentDTO[]>([]);
  const [commentCount , setCommentCount] = useState<number>(0);
  const [likeCount , setLikeCount] = useState<number>(0); 
  const [shareCount , setShareCount] = useState<number>(0);
  
  const stats = [
    { icon: MessageSquare, label: 'All Members', count: posts.length.toString(), bg: 'bg-blue-500' },
    { icon: Users, label: 'Chats', count: posts.reduce((acc, post) => acc + (post.commentCount || 0), 0).toString(), bg: 'bg-purple-500' },
    { icon: ThumbsUp, label: 'Likes', count: posts.reduce((acc, post) => acc + (post.likeCount || 0), 0).toString(), bg: 'bg-green-500' }
  ];

  useEffect(() => {
    loadPostData();
  }, []);

  const loadPostData = async () => {
    try {
      setLoading(true);
      const data = await postsService.getAllPosts();
      
      
      setPosts(data);
      setCommentCount(data.reduce((acc, post) => acc + (post.commentCount || 0), 0));
      setLikeCount(data.reduce((acc, post) => acc + (post.likeCount || 0), 0));
      setShareCount(data.reduce((acc, post) => acc + (post.shareCount || 0), 0));
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (postId: number) => {
    try {
      const data = await commentService.getCommentsByPostId(postId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments. Please try again.');
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.warning('Please enter both title and content');
      return;
    }

    if (!user?.userId) {
      toast.error('You must be logged in to create a post');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        userId: user.userId.toString(),
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        createdAt: new Date()
      };

      const createdPost = await postsService.createPost(requestData);
      setPosts(prevPosts => [createdPost, ...prevPosts]);

      setNewPost({ title: '', content: '', tags: '' });
      setShowNewPostModal(false);

      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!user?.userId) {
      toast.error('You must be logged in to like posts');
      return;
    }

    try {
      await interactionService.toggleLike(postId, user.userId.toString());
      
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
          toast.info('Like removed');
        } else {
          newSet.add(postId);
          toast.success('Post liked!');
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like. Please try again.');
    }
  };

  const handleShare = async (postId: number) => {
    if (!user?.userId) {
      toast.error('You must be logged in to share posts');
      return;
    }

    try {
      await interactionService.toggleShare(postId, user.userId.toString());
      
      setSharedPosts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
          toast.info('Post unshared');
        } else {
          newSet.add(postId);
          toast.success('Post shared successfully!');
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error toggling share:', error);
      toast.error('Failed to update share. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getInitials = (userId: number) => {
    return `U${userId}`;
  };

  const popularTopics = [
    '#investing', '#budgeting', '#stocks', '#sidehustles',
    '#crypto', '#personalfinance', '#retirement', '#taxes',
    '#retirement2'
  ];

  const guidelines = [
    'Be respectful and constructive',
    'Share ideas, personal financial attacks',
    'No financial advice without disclosures',
    'No promotional content without approval',
    'Cite sources when sharing information'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-600 mb-3">Financial Forum</h1>
          <p className="text-gray-600 mb-6">
            Connect with our community to discuss financial strategies, share insights, and get advice from peers.
          </p>
          <div className="flex gap-3 text-sm">
            <button className="px-4 py-2 bg-white rounded-md text-gray-700 hover:bg-gray-50">#investing</button>
            <button className="px-4 py-2 bg-white rounded-md text-gray-700 hover:bg-gray-50">#budgeting</button>
            <button className="px-4 py-2 bg-white rounded-md text-gray-700 hover:bg-gray-50">#stocks</button>
            <button className="px-4 py-2 bg-white rounded-md text-gray-700 hover:bg-gray-50">#sidehustles</button>
            <button className="px-4 py-2 bg-white rounded-md text-gray-700 hover:bg-gray-50">#crypto</button>
            <button className="px-4 py-2 bg-white rounded-md text-gray-700 hover:bg-gray-50">#photography</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`${stat.bg} w-10 h-10 rounded-lg flex items-center justify-center`}>
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
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Discussions</h2>
              <button 
                onClick={() => setShowNewPostModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Post
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 text-center">
                <div className="text-gray-500">Loading posts...</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <div className="text-gray-500 mb-2">No posts yet</div>
                <div className="text-sm text-gray-400">Be the first to start a discussion!</div>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-700 flex-shrink-0">
                        {getInitials(post.userId)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">User {post.userId}</div>
                            <div className="text-xs text-gray-500">{formatDate(post.createdAt.toString())}</div>
                          </div>
                          <div className="flex items-center gap-4 text-gray-500 text-sm">
                            <button 
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                                likedPosts.has(post.id) ? 'text-red-500' : ''
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                              <span>0</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-blue-500">
                              <MessageCircle className="w-4 h-4" />
                              <span>0</span>
                            </button>
                            <button className="hover:text-blue-500">
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              #discussion
                            </span>
                          </div>
                          <button 
                            onClick={() => handleShare(post.id)}
                            className={`hover:text-gray-600 transition-colors ${
                              sharedPosts.has(post.id) ? 'text-blue-600' : 'text-gray-400'
                            }`}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Popular Topics</h3>
              <p className="text-xs text-gray-500 mb-4">Trending discussions in finance</p>
              <div className="flex flex-wrap gap-2">
                {popularTopics.map((topic, idx) => (
                  <button key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200">
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Community Guidelines</h3>
              <ul className="space-y-2">
                {guidelines.map((guideline, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">›</span>
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="font-semibold text-gray-900">FinFlow</span>
            </div>
            <div className="flex gap-6 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700">Terms of Service</a>
              <a href="#" className="hover:text-gray-700">Contact</a>
              <a href="#" className="hover:text-gray-700">About</a>
            </div>
          </div>
          <div className="text-center text-xs text-gray-400 mt-6">
            2025 FinFlow. All rights reserved.
          </div>
        </div>
      </footer>
    
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
              <button 
                onClick={() => setShowNewPostModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
               <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Give your post a catchy title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts, questions, or insights with the community..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={6}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder="e.g., investing, budgeting, stocks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}