import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Users, ThumbsUp, Heart, MessageCircle, Bookmark, Share2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
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
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [sharedPosts, setSharedPosts] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [shareCount, setShareCount] = useState<number>(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const stats = [
    { icon: MessageSquare, label: 'All Members', count: posts.length.toString(), bg: 'bg-blue-500' },
    { icon: Users, label: 'Chats', count: commentCount.toString(), bg: 'bg-purple-500' },
    { icon: ThumbsUp, label: 'Likes', count: likeCount.toString(), bg: 'bg-green-500' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadPostData();
  }, []);

  const loadPostData = async () => {
    try {
      setLoading(true);
      setLoaded(false);
      const data = await postsService.getAllPosts();
      
      setPosts(data);
      setCommentCount(data.reduce((acc, post) => acc + (post.commentCount || 0), 0));
      setLikeCount(data.reduce((acc, post) => acc + (post.likeCount || 0), 0));
      setShareCount(data.reduce((acc, post) => acc + (post.shareCount || 0), 0));

      setTimeout(() => {
        setLoading(false);
        setTimeout(() => {
          setLoaded(true);
        }, 10);
      }, 10);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts. Please try again.');
      setLoading(false);
      setTimeout(() => {
        setLoaded(true);
      }, 100);
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
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold text-lg">Loading Forum...</p>
        </div>
      </div>
    );
  }

  const heroParallax = scrollY * 0.5;
  const statsParallax = scrollY * 0.3;
  const postsParallax = scrollY * 0.2;
  const sidebarParallax = scrollY * 0.15;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div 
        className={`fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pointer-events-none transition-opacity duration-1000 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      />
      
      <div 
        className={`fixed inset-0 bg-gradient-to-tr from-transparent via-blue-100/30 to-transparent pointer-events-none transition-opacity duration-1000 delay-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transform: `translateY(${scrollY * -0.3}px)` }}
      />

      <div className="relative z-10">
        {/* Hero Section */}
        <div 
          ref={heroRef}
          className={`bg-white/80 backdrop-blur-sm px-6 py-12 shadow-lg transition-all duration-700 ${
            loaded ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
          }`}
          style={{ transform: `translateY(${loaded ? -heroParallax * 0.1 : -48}px)` }}
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Financial Forum
            </h1>
            <p className="text-gray-600 mb-6">
              Connect with our community to discuss financial strategies, share insights, and get advice from peers.
            </p>
            <div className="flex gap-3 text-sm flex-wrap">
              {['#investing', '#budgeting', '#stocks', '#sidehustles', '#crypto', '#photography'].map((tag, idx) => (
                <button 
                  key={tag}
                  className={`px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 animate-in fade-in ${
                    loaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div 
            ref={statsRef}
            className="grid grid-cols-3 gap-4 mb-8"
            style={{ transform: `translateY(${loaded ? -statsParallax * 0.15 : 0}px)` }}
          >
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1 ${
                  loaded ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
                }`}
                style={{ transitionDelay: `${100 + index * 100}ms` }}
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
            <div 
              ref={postsRef}
              className={`col-span-2 transition-all duration-700 delay-500 ${
                loaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
              style={{ transform: `translateY(${loaded ? -postsParallax * 0.2 : 48}px)` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Discussions</h2>
                <button
                  onClick={() => setShowNewPostModal(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  New Post
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-12 shadow-lg border border-gray-200 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <div className="text-gray-500 mb-2">No posts yet</div>
                  <div className="text-sm text-gray-400">Be the first to start a discussion!</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post, idx) => (
                    <div 
                      key={post.id} 
                      className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
                        loaded ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
                      }`}
                      style={{ transitionDelay: `${600 + idx * 100}ms` }}
                    >
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 shadow-md">
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
                                className={`flex items-center gap-1 transition-all duration-300 hover:scale-110 ${
                                  likedPosts.has(post.id) ? 'text-red-500' : 'hover:text-red-500'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                <span>0</span>
                              </button>
                              <button className="flex items-center gap-1 hover:text-blue-500 transition-all duration-300 hover:scale-110">
                                <MessageCircle className="w-4 h-4" />
                                <span>0</span>
                              </button>
                              <button className="hover:text-blue-500 transition-all duration-300 hover:scale-110">
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
                              <span className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 px-3 py-1 rounded-full border border-blue-200">
                                #discussion
                              </span>
                            </div>
                            <button
                              onClick={() => handleShare(post.id)}
                              className={`transition-all duration-300 hover:scale-110 ${
                                sharedPosts.has(post.id) ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
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

            {/* Sidebar */}
            <div 
              ref={sidebarRef}
              className={`space-y-6 transition-all duration-700 delay-700 ${
                loaded ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
              }`}
              style={{ transform: `translateY(${loaded ? -sidebarParallax * 0.25 : 0}px)` }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-500">
                <h3 className="font-bold text-gray-900 mb-3">Popular Topics</h3>
                <p className="text-xs text-gray-500 mb-4">Trending discussions in finance</p>
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map((topic, idx) => (
                    <button 
                      key={idx} 
                      className="text-xs bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105 shadow-sm"
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

        {/* Footer */}
        <footer className={`bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-12 shadow-lg transition-all duration-700 delay-[800ms] ${
          loaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FinFlow</span>
              </div>
              <div className="flex gap-6 text-xs text-gray-600">
                <a href="#" className="hover:text-blue-600 transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-purple-600 transition-colors duration-300">Terms of Service</a>
                <a href="#" className="hover:text-pink-600 transition-colors duration-300">Contact</a>
                <a href="#" className="hover:text-blue-600 transition-colors duration-300">About</a>
              </div>
            </div>
            <div className="text-center text-xs text-gray-500 mt-6">
              2025 FinFlow. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isSubmitting && setShowNewPostModal(false)}
          />
          
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
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
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}