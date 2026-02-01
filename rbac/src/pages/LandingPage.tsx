import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { 
  TrendingUp, 
  Target, 
  PieChart, 
  Bell, 
  Shield, 
  Users, 
  FileText, 
  Sparkles,
  Wallet,
  BarChart3,
  DollarSign,
  ArrowRight,
  Currency
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Benefit {
  title: string;
  description: string;
}

interface VisibilityState {
  features: boolean;
  benefits: boolean;
  faq: boolean;
  cta: boolean;
}

interface SectionRefs {
  [key: string]: HTMLElement | null;
}

const LandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<VisibilityState>({
    features: true,
    benefits: false,
    faq: false,
    cta: false
  });
  const sectionRefs = useRef<SectionRefs>({});
    const navigate = useNavigate();
    const handleSignUpClick = () => {
    navigate("/login");
    };
  useEffect(() => {
    const handleScroll = (): void => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const features: Feature[] = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Income & Expense Tracking",
      description: "Record and categorize all your income sources and expenses with detailed transaction management."
    },
    {
      icon: <PieChart className="w-8 h-8" />,
      title: "Financial Dashboard",
      description: "Get comprehensive overview with visual charts, graphs, and cash flow analysis for better insights."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Goal Management",
      description: "Set and track multiple financial goals with progress visualization and milestone tracking."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "NEPSE Integration",
      description: "Real-time Nepal Stock Exchange data with comprehensive market analysis and tracking."
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Stock Recommendations",
      description: "Personalized stock recommendations powered by Gemini AI with risk assessment."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Reports & Analytics",
      description: "Generate monthly/yearly reports with expense breakdown and investment performance analysis."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Forums",
      description: "Connect with other investors, share strategies, and learn from the community."
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Smart Notifications",
      description: "Get timely alerts for bill payments, goals, stock prices, and market movements."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Data encryption and regular backups to protect your information."
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Detailed Reports",
      description: "Download comprehensive financial reports in PDF or Excel format anytime."
    },
    {
      icon: <Currency className="w-8 h-8" />,
      title: "NPR Currency Support",
      description: "Built specifically for Nepal with native Nepali Rupee support and local market integration."
    }
  ];

  const faqs: FAQ[] = [
    {
      question: "What is the Financial Tracker app?",
      answer: "Our Financial Tracker is a comprehensive web application designed for managing personal finances, tracking income and expenses, setting financial goals, and getting AI-powered stock recommendations from NEPSE (Nepal Stock Exchange)."
    },
    {
      question: "How does the NEPSE integration work?",
      answer: "We provide real-time data from Nepal Stock Exchange including stock prices, market trends, and historical performance. Our AI analyzes this data to provide personalized investment recommendations based on your financial profile."
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely! We use bank-level security with JWT authentication, data encryption, and regular backups. Your privacy is our top priority, and we never share your data with third parties."
    },
    {
      question: "Can I set multiple financial goals?",
      answer: "Yes! You can set unlimited financial goals for savings, investments, debt repayment, and more. Track progress with visual indicators and get notifications when you hit milestones."
    },
    {
      question: "How do AI-powered recommendations work?",
      answer: "Our system uses Gemini AI to analyze NEPSE stocks, your financial profile, risk tolerance, and market trends to provide personalized buy/sell recommendations with detailed risk assessments."
    },
    {
      question: "Can I export my financial data?",
      answer: "Yes! You can export all your financial data, reports, and analytics to Excel/CSV or download comprehensive PDF reports anytime."
    }
  ];

  const benefits: Benefit[] = [
    {
      title: "Made for Nepal",
      description: "Native NPR support, NEPSE integration, and features designed specifically for Nepali investors and savers."
    },
    {
      title: "AI-Powered Insights",
      description: "Get intelligent stock recommendations and financial insights powered by advanced AI technology."
    },
    {
      title: "Complete Financial Control",
      description: "Track every rupee, manage goals, invest wisely, and build wealth with comprehensive tools."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">FinFlow</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-blue-600 transition-colors">Benefits</a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</a>
              <Button onClick={handleSignUpClick} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Sign In</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fadeInUp">
              <div className="inline-block animate-slideInLeft">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  AI-Powered Financial Management
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight animate-slideInLeft animation-delay-200">
                Master Your Finances with{' '}
                <span className="text-blue-600">FinFlow</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed animate-slideInLeft animation-delay-400">
                Track expenses, achieve goals, and invest wisely with AI-powered recommendations from NEPSE. 
                Built specifically for Nepal's financial landscape.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-slideInLeft animation-delay-600">
                <Button onClick={handleSignUpClick}size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 group">
                  Sign Up
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6">
                    Learn More
                </Button>
              </div>
            </div>
            <div 
              className="relative animate-slideInRight"
              style={{
                transform: `translateY(${scrollY * 0.1}px)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent rounded-3xl blur-3xl animate-pulse-slow"></div>
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71" 
                alt="Financial Dashboard"
                className="relative rounded-2xl shadow-2xl w-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        ref={(el) => {
          if (el) sectionRefs.current['features'] = el;
        }}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="container mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Financial Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to take control of your finances and build wealth intelligently
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-500 group ${
                  isVisible['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section 
        id="benefits" 
        ref={(el) => {
          if (el) sectionRefs.current['benefits'] = el;
        }}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            transform: `translateY(${scrollY * 0.15}px)`
          }}
        ></div>
        <div className="container mx-auto relative z-10">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['benefits'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose FinTracker?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built specifically for Nepal with features that matter to you
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className={`bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ${
                  isVisible['benefits'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 text-lg">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          {/* NEPSE Integration Highlight */}
          <div className={`bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white transition-all duration-1000 ${
            isVisible['benefits'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 animate-fadeIn">
                  AI-Powered NEPSE Stock Recommendations
                </h3>
                <p className="text-lg text-blue-100 mb-6">
                  Get intelligent buy/sell signals powered by Gemini AI. Our system analyzes market trends, 
                  your financial profile, and risk tolerance to provide personalized recommendations.
                </p>
                <ul className="space-y-3">
                  {[
                    'Real-time NEPSE market data and analysis',
                    'Personalized risk assessment for each stock',
                    'Portfolio diversification suggestions',
                    'Instant alerts on market opportunities'
                  ].map((item, idx) => (
                    <li 
                      key={idx}
                      className={`flex items-center gap-3 transition-all duration-500 ${
                        isVisible['benefits'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                      }`}
                      style={{ transitionDelay: `${(idx + 3) * 150}ms` }}
                    >
                      <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div 
                className="flex justify-center items-center"
              >
                <img 
                  src="https://images.unsplash.com/photo-1748439435495-722cc1728b7e" 
                  alt="Stock Market Analysis"
                  className="rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        id="faq" 
        ref={(el) => {
          if (el) sectionRefs.current['faq'] = el;
        }}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="container mx-auto max-w-3xl">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about FinTracker
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className={`bg-white border border-gray-200 rounded-xl px-6 hover:border-blue-300 hover:shadow-md transition-all duration-500 ${
                  isVisible['faq'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-bold text-white">FinFlow</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for financial management and smart investing in Nepal.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FinTracker. All rights reserved. Made with care for Nepal.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;