import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Shield, Users, Smartphone, UserPlus, Building, Star, Quote, Sparkles, Heart, Mail, Phone, MapPin } from 'lucide-react';

const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Village Sarpanch",
      village: "Greenfield Village",
      content: "SmartPanchayat has transformed how we govern our village. Complete transparency in finances and easy communication with citizens has built unprecedented trust.",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Priya Sharma",
      role: "Teacher & Village Council Member",
      village: "Harmony Village",
      content: "The digital services are incredible! I can pay bills, track project progress, and participate in village decisions from my phone. It's truly empowering.",
      rating: 5,
      avatar: "👩‍🏫"
    },
    {
      name: "Mohan Patel",
      role: "Farmer & Community Leader",
      village: "Prosperity Village",
      content: "Never thought rural governance could be this efficient. Real-time updates on development projects and easy access to government services saves us so much time.",
      rating: 5,
      avatar: "👨‍🌾"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Transparent Governance",
      description: "Project tracking dashboard, financial transparency, and real-time updates on all government initiatives.",
      details: ["Budget tracking", "Project milestones", "Public expenditure reports"]
    },
    {
      icon: Users,
      title: "Community Engagement",
      description: "Discussion boards, polls, and notifications to keep every villager connected and informed.",
      details: ["Village forums", "Democratic polls", "Event notifications"]
    },
    {
      icon: Smartphone,
      title: "Digital Services",
      description: "Bill payments, approvals, and service request tracking - all from your smartphone.",
      details: ["Online payments", "Document approvals", "Service status tracking"]
    }
  ];

  const steps = [
    {
      icon: UserPlus,
      title: "Villagers Register Online",
      description: "Quick and easy registration process for all community members to join the digital platform.",
      step: "01"
    },
    {
      icon: Smartphone,
      title: "Access Services & Participate",
      description: "Use digital services, join discussions, vote on community issues, and track government projects.",
      step: "02"
    },
    {
      icon: Building,
      title: "Build Transparent Communities",
      description: "Create accountable governance with real-time tracking, transparent finances, and inclusive decision-making.",
      step: "03"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div style={styles.container}>
      <style>{`
        /* SmartPanchayat Design System - Village meets Technology */
        
        :root {
          /* Core Colors - Nature & Technology Harmony */
          --background: 248 250 252; /* Soft blue-white */
          --foreground: 215 28% 17%;
          --card: 255 255 255;
          --card-foreground: 215 28% 17%;
          --card-glass: 255 255 255 / 0.1;
          --popover: 255 255 255;
          --popover-foreground: 215 28% 17%;
          
          /* Primary - Village Green */
          --primary: 142 76% 36%;
          --primary-foreground: 355 100% 97%;
          --primary-light: 142 76% 56%;
          --primary-dark: 142 76% 26%;
          
          /* Secondary - Tech Blue */
          --secondary: 217 91% 60%;
          --secondary-foreground: 355 100% 97%;
          --secondary-light: 217 91% 70%;
          --secondary-dark: 217 91% 50%;
          
          /* Accent - Warm Orange */
          --accent: 43 96% 56%;
          --accent-foreground: 215 28% 17%;
          
          /* Surface Colors */
          --muted: 220 13% 91%;
          --muted-foreground: 215 16% 47%;
          --surface: 220 43% 98%;
          
          /* Semantic Colors */
          --success: 142 76% 36%;
          --warning: 43 96% 56%;
          --destructive: 0 84% 60%;
          --destructive-foreground: 355 100% 97%;
          
          --border: 220 13% 91%;
          --input: 220 13% 91%;
          --ring: 142 76% 36%;
          
          --radius: 0.75rem;
          
          /* Gradients */
          --gradient-primary: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
          --gradient-hero: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--accent)) 100%);
          --gradient-card: linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--surface)) 100%);
          --gradient-text: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
          
          /* Shadows */
          --shadow-soft: 0 4px 6px -1px hsl(var(--primary) / 0.1), 0 2px 4px -1px hsl(var(--primary) / 0.06);
          --shadow-medium: 0 10px 15px -3px hsl(var(--primary) / 0.1), 0 4px 6px -2px hsl(var(--primary) / 0.05);
          --shadow-large: 0 25px 50px -12px hsl(var(--primary) / 0.25);
          --shadow-glass: 0 8px 32px 0 hsl(var(--primary) / 0.15);
          
          /* Animation Timing */
          --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          --transition-bounce: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        body {
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          margin: 0;
          padding: 0;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
        }
        
        * {
          box-sizing: border-box;
        }
        
        /* Gradient Text Animation */
        .gradient-text {
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease-in-out infinite;
          background-size: 200% 200%;
        }
        
        /* Glass Effect */
        .glass {
          background: hsl(var(--card-glass));
          backdrop-filter: blur(20px);
          border: 1px solid hsl(var(--border) / 0.3);
        }
        
        /* Hero Gradient Background */
        .hero-gradient {
          background: var(--gradient-hero);
        }
        
        /* Floating Animation */
        .float {
          animation: float 6s ease-in-out infinite;
        }
        
        /* Scroll Animations */
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        
        /* Hover Animations */
        .hover-lift {
          transition: var(--transition-smooth);
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-large);
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition-smooth);
          cursor: pointer;
          border: none;
          text-decoration: none;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          height: auto;
        }
        
        .button-hero {
          background: hsl(var(--card-glass));
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .button-hero:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .button-glass {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(20px);
        }
        
        .button-glass:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .button-outline {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .button-outline:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .card {
          background: white;
          border-radius: 1rem;
          box-shadow: var(--shadow-soft);
          overflow: hidden;
        }
        
        .card-glass {
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4));
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        {/* Floating Decorative Elements */}
        <div style={styles.heroDecor}>
          <div style={{...styles.floatingElement, ...styles.float1}} className="float"></div>
          <div style={{...styles.floatingElement, ...styles.float2, animationDelay: '2s'}} className="float"></div>
          <div style={{...styles.floatingElement, ...styles.float3, animationDelay: '4s'}} className="float"></div>
        </div>

        <div className="container" style={styles.heroContainer}>
          <div style={styles.heroGrid}>
            {/* Left Content */}
            <div style={styles.heroContent} className="animate-fade-in-up">
              <h1 style={styles.heroTitle}>
                🌿 <span className="gradient-text">SmartPanchayat</span>
              </h1>
              <p style={styles.heroSubtitle}>
                Empowering villages with transparency & technology
              </p>
              <p style={styles.heroDescription}>
                Join the digital revolution transforming rural governance. 
                Connect, participate, and build transparent communities together.
              </p>
              
              <div style={styles.heroButtons}>
                <button className="button button-hero" style={styles.buttonLarge}>
                  Get Started
                  <ArrowRight size={20} />
                </button>
                <button className="button button-glass" style={styles.buttonLarge}>
                  <Play size={20} />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div style={styles.heroImageContainer} className="animate-fade-in">
              <div style={styles.heroImageWrapper}>
                <img 
                  src="/src/assets/hero-village.jpg" 
                  alt="Smart village with digital governance" 
                  style={styles.heroImage}
                  className="hover-lift"
                />
              </div>
              <div style={styles.heroImageGlow}></div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div style={styles.bottomWave}>
          <svg 
            viewBox="0 0 1440 120" 
            style={styles.waveSvg}
            preserveAspectRatio="none"
          >
            <path 
              fill="hsl(var(--background))" 
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,53.3C672,53,768,75,864,85.3C960,96,1056,96,1152,85.3C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <div className="container">
          <div style={styles.sectionHeader} className="animate-fade-in-up">
            <h2 style={styles.sectionTitle}>
              Transforming <span className="gradient-text">Village Life</span>
            </h2>
            <p style={styles.sectionDescription}>
              Discover how SmartPanchayat brings modern governance tools to rural communities, 
              fostering transparency, engagement, and digital empowerment.
            </p>
          </div>

          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="card card-glass hover-lift animate-fade-in-up"
                style={{...styles.featureCard, animationDelay: `${index * 0.2}s`}}
              >
                <div style={styles.featureHeader}>
                  <div style={styles.featureIcon}>
                    <feature.icon size={32} color="hsl(var(--primary))" />
                  </div>
                  <h3 style={styles.featureTitle}>{feature.title}</h3>
                  <p style={styles.featureDescription}>
                    {feature.description}
                  </p>
                </div>
                <div style={styles.featureContent}>
                  <ul style={styles.featureList}>
                    {feature.details.map((detail, idx) => (
                      <li key={idx} style={styles.featureListItem}>
                        <div style={styles.featureBullet}></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

           
        </div>
      </section>

      {/* How It Works Section */}
      <section style={styles.howItWorksSection}>
        <div style={styles.howItWorksBackground}>
          <div style={styles.bgPattern1}></div>
          <div style={styles.bgPattern2}></div>
          <div style={styles.bgPattern3}></div>
        </div>

        <div className="container" style={styles.relative}>
          <div style={styles.sectionHeader} className="animate-fade-in-up">
            <h2 style={styles.sectionTitle}>
              How <span className="gradient-text">SmartPanchayat</span> Works
            </h2>
            <p style={styles.sectionDescription}>
              Three simple steps to revolutionize your village's governance and community engagement.
            </p>
          </div>

          <div style={styles.stepsContainer}>
            <div style={styles.stepsGrid}>
              <div style={styles.connectionLine}></div>
              
              {steps.map((step, index) => (
                <div 
                  key={step.title}
                  style={styles.stepItem}
                  className="animate-fade-in-up"
                >
                  <div style={styles.stepNumber}>
                    {step.step}
                  </div>
                  
                  <div className="card hover-lift" style={styles.stepCard}>
                    <div style={styles.stepIcon}>
                      <step.icon size={48} color="hsl(var(--primary))" />
                    </div>
                    
                    <h3 style={styles.stepTitle}>
                      {step.title}
                    </h3>
                    <p style={styles.stepDescription}>
                      {step.description}
                    </p>
                    
                    <div style={styles.stepDecorative}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.ctaContainer} className="animate-fade-in-up">
            <div style={styles.ctaBadge}>
              🚀 Ready to get started?
            </div>
            <p style={styles.ctaText}>
              Join thousands of villages already transforming their communities.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={styles.testimonialsSection}>
        <div style={styles.testimonialsBackground}></div>
        
        <div className="container" style={styles.relative}>
          <div style={styles.sectionHeader} className="animate-fade-in-up">
            <h2 style={styles.sectionTitle}>
              Voices from <span className="gradient-text">Smart Villages</span>
            </h2>
            <p style={styles.sectionDescription}>
              Hear from village leaders and citizens who are already experiencing the transformation.
            </p>
          </div>

          {/* Main Testimonial */}
          <div style={styles.mainTestimonialContainer}>
            <div className="card card-glass" style={styles.mainTestimonialCard} >
              <Quote size={48} style={styles.quoteIcon} />
              
              <blockquote style={styles.testimonialQuote}>
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              
              <div style={styles.testimonialAuthor}>
                <div style={styles.testimonialAvatar}>{testimonials[currentTestimonial].avatar}</div>
                <div style={styles.testimonialInfo}>
                  <div style={styles.testimonialName}>{testimonials[currentTestimonial].name}</div>
                  <div style={styles.testimonialRole}>{testimonials[currentTestimonial].role}</div>
                  <div style={styles.testimonialVillage}>{testimonials[currentTestimonial].village}</div>
                </div>
              </div>
              
              <div style={styles.starRating}>
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} size={20} fill="#093e57ff" color="#24b7fbff" />
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial Navigation */}
          <div style={styles.testimonialNav}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                style={{
                  ...styles.navDot,
                  backgroundColor: index === currentTestimonial 
                    ? 'hsl(var(--primary))' 
                    : 'hsl(var(--primary) / 0.3)',
                  transform: index === currentTestimonial ? 'scale(1.25)' : 'scale(1)'
                }}
              />
            ))}
          </div>

          {/* All Testimonials Grid */}
          <div style={styles.allTestimonialsGrid} className="animate-fade-in-up">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.name}
                className={`card hover-lift ${index === currentTestimonial ? 'active' : ''}`}
                style={{
                  ...styles.testimonialSmallCard,
                  ...(index === currentTestimonial ? styles.testimonialActiveCard : {})
                }}
                onClick={() => setCurrentTestimonial(index)}
              >
                <div style={styles.testimonialSmallHeader}>
                  <div style={styles.testimonialSmallAvatar}>{testimonial.avatar}</div>
                  <div>
                    <div style={styles.testimonialSmallName}>{testimonial.name}</div>
                    <div style={styles.testimonialSmallVillage}>{testimonial.village}</div>
                  </div>
                </div>
                <p style={styles.testimonialSmallContent}>
                  {testimonial.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaSectionBackground}>
          <div style={{...styles.floatingElement, ...styles.ctaFloat1}} className="float"></div>
          <div style={{...styles.floatingElement, ...styles.ctaFloat2, animationDelay: '3s'}} className="float"></div>
          <div style={{...styles.floatingElement, ...styles.ctaFloat3, animationDelay: '1.5s'}} className="float"></div>
          <div style={{...styles.floatingElement, ...styles.ctaFloat4, animationDelay: '4s'}} className="float"></div>
        </div>

        <div className="container" style={styles.relative}>
          <div style={styles.ctaContent} className="animate-fade-in-up">
            <div style={styles.ctaBadgeContainer}>
              <Sparkles size={20} color="white" />
              <span style={styles.ctaBadgeText}>Join the Digital Revolution</span>
            </div>

            <h2 style={styles.ctaTitle}>
              Transform Your Village
              <br />
              <span style={styles.ctaTitleGradient}>
                Starting Today
              </span>
            </h2>

            <p style={styles.ctaDescription}>
              Join thousands of villages already experiencing transparent governance, 
              digital empowerment, and stronger communities through SmartPanchayat.
            </p>

            <div style={styles.ctaButtons}>
              <button className="button button-glass" style={styles.ctaButtonPrimary}>
                <Users size={20} />
                Register Your Village
                <ArrowRight size={20} />
              </button>
              <button className="button button-outline" style={styles.ctaButtonSecondary}>
                Citizen Login
              </button>
            </div>

            <div style={styles.trustIndicators} className="animate-fade-in-up">
              <div style={styles.trustItem}>
                <div style={styles.trustNumber}>500+</div>
                <div style={styles.trustLabel}>Villages Connected</div>
              </div>
              <div style={styles.trustItem}>
                <div style={styles.trustNumber}>50K+</div>
                <div style={styles.trustLabel}>Active Citizens</div>
              </div>
              <div style={styles.trustItem}>
                <div style={styles.trustNumber}>98%</div>
                <div style={styles.trustLabel}>Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.bottomWave}>
          <svg 
            viewBox="0 0 1440 120" 
            style={styles.waveSvg}
            preserveAspectRatio="none"
          >
            <path 
              fill="hsl(var(--foreground))" 
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,53.3C672,53,768,75,864,85.3C960,96,1056,96,1152,85.3C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerBackground}>
          <div style={styles.footerPattern1}></div>
          <div style={styles.footerPattern2}></div>
          <div style={styles.footerPattern3}></div>
        </div>

        <div className="container" style={styles.footerContainer}>
          <div style={styles.footerGrid}>
            {/* Logo & Tagline */}
            <div style={styles.footerLogo}>
              <h3 style={styles.footerLogoTitle}>
                🌿 <span className="gradient-text" style={styles.footerLogoText}>SmartPanchayat</span>
              </h3>
              <p style={styles.footerTagline}>
                Empowering villages with transparency & technology. 
                Building stronger, more connected rural communities through digital governance.
              </p>
              <div style={styles.footerLove}>
                <Heart size={16} color="#ef4444" />
                Made with love for rural India
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={styles.footerSectionTitle}>Quick Links</h4>
              <ul style={styles.footerLinksList}>
                {['About Us', 'How It Works', 'Features', 'Success Stories', 'Help Center'].map((link) => (
                  <li key={link}>
                    <a href="#" style={styles.footerLink}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 style={styles.footerSectionTitle}>Contact</h4>
              <ul style={styles.footerContactList}>
                <li style={styles.footerContactItem}>
                  <Mail size={16} color="hsl(var(--primary-light))" style={styles.footerContactIcon} />
                  <div>
                    <div style={styles.footerContactLabel}>Email</div>
                    <div style={styles.footerContactValue}>hello@smartpanchayat.in</div>
                  </div>
                </li>
                <li style={styles.footerContactItem}>
                  <Phone size={16} color="hsl(var(--primary-light))" style={styles.footerContactIcon} />
                  <div>
                    <div style={styles.footerContactLabel}>Phone</div>
                    <div style={styles.footerContactValue}>+91 1800-SMART-01</div>
                  </div>
                </li>
                <li style={styles.footerContactItem}>
                  <MapPin size={16} color="hsl(var(--primary-light))" style={styles.footerContactIcon} />
                  <div>
                    <div style={styles.footerContactLabel}>Address</div>
                    <div style={styles.footerContactValue}>Digital India Initiative<br />New Delhi, India</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div style={styles.footerBottom}>
            <div style={styles.footerBottomContent}>
              <div style={styles.footerCopyright}>
                © {currentYear} SmartPanchayat. All rights reserved.
              </div>

              <div style={styles.footerLegalLinks}>
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                  <a 
                    key={link}
                    href="#" 
                    style={styles.footerLegalLink}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh'
  },
  
  // Hero Section Styles
  heroSection: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'var(--gradient-hero)'
  },
  heroDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(40px)'
  },
  float1: {
    top: '80px',
    left: '40px',
    width: '80px',
    height: '80px',
    background: 'rgba(255, 255, 255, 0.1)'
  },
  float2: {
    top: '160px',
    right: '80px',
    width: '128px',
    height: '128px',
    background: 'rgba(255, 255, 255, 0.05)',
    filter: 'blur(80px)'
  },
  float3: {
    bottom: '160px',
    left: '25%',
    width: '64px',
    height: '64px',
    background: 'rgba(255, 255, 255, 0.15)',
    filter: 'blur(32px)'
  },
  heroContainer: {
    position: 'relative',
    zIndex: 10,
    paddingTop: '80px',
    paddingBottom: '80px'
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    alignItems: 'center',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
      gap: '32px'
    }
  },
  heroContent: {
    textAlign: 'left',
    '@media (max-width: 1024px)': {
      textAlign: 'center'
    }
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: 'bold',
    marginBottom: '24px',
    lineHeight: 1.1,
    color: 'white',
    '@media (max-width: 1024px)': {
      fontSize: '3.5rem'
    }
  },
  heroSubtitle: {
    fontSize: '1.5rem',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '32px',
    lineHeight: 1.4,
    '@media (max-width: 1024px)': {
      fontSize: '1.25rem'
    }
  },
  heroDescription: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: '40px',
    maxWidth: '512px',
    lineHeight: 1.6
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    '@media (max-width: 640px)': {
      flexDirection: 'column'
    }
  },
  buttonLarge: {
    fontSize: '1.125rem',
    padding: '16px 32px',
    height: 'auto'
  },
  heroImageContainer: {
    position: 'relative'
  },
  heroImageWrapper: {
    position: 'relative',
    zIndex: 10
  },
  heroImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-large)'
  },
  heroImageGlow: {
    position: 'absolute',
    top: '-16px',
    left: '-16px',
    right: '-16px',
    bottom: '-16px',
    background: 'linear-gradient(to right, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2))',
    borderRadius: '24px',
    filter: 'blur(40px)',
    zIndex: -1
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  waveSvg: {
    width: '100%',
    height: '80px',
    color: 'hsl(var(--background))'
  },
  
  // Features Section Styles
  featuresSection: {
    padding: '80px 0',
    background: 'hsl(var(--background))',
    position: 'relative'
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '64px'
  },
  sectionTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: 'hsl(var(--foreground))',
    '@media (max-width: 1024px)': {
      fontSize: '2.5rem'
    }
  },
  sectionDescription: {
    fontSize: '1.25rem',
    color: 'hsl(var(--muted-foreground))',
    maxWidth: '768px',
    margin: '0 auto',
    lineHeight: 1.6
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px'
  },
  featureCard: {
    padding: '32px',
    position: 'relative',
    border: '1px solid transparent',
    borderRadius: '1rem'
  },
  featureHeader: {
    textAlign: 'center',
    paddingBottom: '16px'
  },
  featureIcon: {
    margin: '0 auto 24px',
    padding: '16px',
    borderRadius: '1rem',
    background: 'linear-gradient(to bottom right, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.1))',
    width: 'fit-content'
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: 'hsl(var(--foreground))'
  },
  featureDescription: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: 'hsl(var(--muted-foreground))'
  },
  featureContent: {
    paddingTop: 0
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  featureListItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))'
  },
  featureBullet: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'hsl(var(--primary))',
    marginRight: '12px',
    flexShrink: 0
  },
  
  // How It Works Section Styles
  howItWorksSection: {
    padding: '80px 0',
    background: 'hsl(var(--surface))',
    position: 'relative',
    overflow: 'hidden'
  },
  howItWorksBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05
  },
  bgPattern1: {
    position: 'absolute',
    top: '80px',
    left: '80px',
    width: '128px',
    height: '128px',
    border: '1px solid hsl(var(--primary))',
    borderRadius: '50%'
  },
  bgPattern2: {
    position: 'absolute',
    bottom: '80px',
    right: '80px',
    width: '96px',
    height: '96px',
    border: '1px solid hsl(var(--secondary))',
    borderRadius: '50%'
  },
  bgPattern3: {
    position: 'absolute',
    top: '50%',
    left: '33%',
    width: '64px',
    height: '64px',
    border: '1px solid hsl(var(--accent))',
    borderRadius: '50%'
  },
  relative: {
    position: 'relative'
  },
  stepsContainer: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '48px',
    position: 'relative'
  },
  connectionLine: {
    display: 'none',
    '@media (min-width: 1024px)': {
      display: 'block',
      position: 'absolute',
      top: '33%',
      left: '33%',
      right: '33%',
      height: '2px',
      background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))',
      opacity: 0.3
    }
  },
  stepItem: {
    position: 'relative',
    textAlign: 'center'
  },
  stepNumber: {
    position: 'absolute',
    top: '-16px',
    left: '-16px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))',
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  stepCard: {
    padding: '32px',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-soft)',
    height: '100%',
    position: 'relative'
  },
  stepIcon: {
    margin: '0 auto 24px',
    padding: '24px',
    borderRadius: '24px',
    background: 'linear-gradient(to bottom right, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.1))',
    width: 'fit-content'
  },
  stepTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: 'hsl(var(--foreground))'
  },
  stepDescription: {
    color: 'hsl(var(--muted-foreground))',
    lineHeight: 1.6
  },
  stepDecorative: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))',
    borderRadius: '0 0 24px 24px'
  },
  ctaContainer: {
    textAlign: 'center',
    marginTop: '64px'
  },
  ctaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '50px',
    background: 'linear-gradient(to right, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.1))',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'hsl(var(--primary))',
    marginBottom: '16px'
  },
  ctaText: {
    fontSize: '1.125rem',
    color: 'hsl(var(--muted-foreground))'
  },
  
  // Testimonials Section Styles
  testimonialsSection: {
    padding: '80px 0',
    background: 'hsl(var(--background))',
    position: 'relative',
    overflow: 'hidden'
  },
  testimonialsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom right, hsl(var(--primary) / 0.05), transparent, hsl(var(--secondary) / 0.05))'
  },
  mainTestimonialContainer: {
    maxWidth: '1024px',
    margin: '0 auto 48px'
  },
  mainTestimonialCard: {
    padding: '48px',
    textAlign: 'center',
    borderRadius: '1rem',
    position: 'relative'
  },
  quoteIcon: {
    color: 'hsl(var(--primary) / 0.3)',
    margin: '0 auto 24px'
  },
  testimonialQuote: {
    fontSize: '1.5rem',
    lineHeight: 1.6,
    color: 'hsl(var(--foreground))',
    fontWeight: '500',
    marginBottom: '32px',
    '@media (max-width: 1024px)': {
      fontSize: '1.25rem'
    }
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px'
  },
  testimonialAvatar: {
    fontSize: '2.5rem'
  },
  testimonialInfo: {
    textAlign: 'left'
  },
  testimonialName: {
    fontWeight: 'bold',
    color: 'hsl(var(--foreground))'
  },
  testimonialRole: {
    color: 'hsl(var(--muted-foreground))'
  },
  testimonialVillage: {
    fontSize: '0.875rem',
    color: 'hsl(var(--primary))',
    fontWeight: '500'
  },
  starRating: {
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
    marginTop: '16px'
  },
  testimonialNav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px'
  },
  navDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  allTestimonialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '64px'
  },
  testimonialSmallCard: {
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderRadius: '1rem'
  },
  testimonialActiveCard: {
    boxShadow: '0 0 0 2px hsl(var(--primary))',
    transform: 'scale(1.05)'
  },
  testimonialSmallHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  testimonialSmallAvatar: {
    fontSize: '1.5rem',
    marginRight: '12px'
  },
  testimonialSmallName: {
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  testimonialSmallVillage: {
    fontSize: '0.75rem',
    color: 'hsl(var(--muted-foreground))'
  },
  testimonialSmallContent: {
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  
  // CTA Section Styles
  ctaSection: {
    padding: '80px 0',
    position: 'relative',
    overflow: 'hidden'
  },
  ctaSectionBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--gradient-hero)'
  },
  ctaFloat1: {
    top: '80px',
    left: '80px',
    width: '96px',
    height: '96px',
    background: 'rgba(255, 255, 255, 0.1)',
    filter: 'blur(40px)'
  },
  ctaFloat2: {
    bottom: '80px',
    right: '80px',
    width: '128px',
    height: '128px',
    background: 'rgba(255, 255, 255, 0.05)',
    filter: 'blur(80px)'
  },
  ctaFloat3: {
    top: '50%',
    left: '25%',
    width: '64px',
    height: '64px',
    background: 'rgba(255, 255, 255, 0.15)',
    filter: 'blur(32px)'
  },
  ctaFloat4: {
    top: '33%',
    right: '33%',
    width: '80px',
    height: '80px',
    background: 'rgba(255, 255, 255, 0.08)',
    filter: 'blur(40px)'
  },
  ctaContent: {
    maxWidth: '1024px',
    margin: '0 auto',
    textAlign: 'center'
  },
  ctaBadgeContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '50px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    marginBottom: '32px',
    gap: '8px'
  },
  ctaBadgeText: {
    fontWeight: '600'
  },
  ctaTitle: {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '24px',
    lineHeight: 1.1,
    '@media (max-width: 1024px)': {
      fontSize: '3rem'
    }
  },
  ctaTitleGradient: {
    background: 'linear-gradient(to right, white, rgba(255, 255, 255, 0.8))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  ctaDescription: {
    fontSize: '1.5rem',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '48px',
    lineHeight: 1.6,
    maxWidth: '768px',
    margin: '0 auto 48px',
    '@media (max-width: 1024px)': {
      fontSize: '1.25rem'
    }
  },
  ctaButtons: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    marginBottom: '64px',
    '@media (max-width: 640px)': {
      flexDirection: 'column'
    }
  },
  ctaButtonPrimary: {
    fontSize: '1.125rem',
    padding: '16px 40px',
    height: 'auto',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  ctaButtonSecondary: {
    fontSize: '1.125rem',
    padding: '16px 40px',
    height: 'auto',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white'
  },
  trustIndicators: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '32px',
    color: 'rgba(255, 255, 255, 0.8)'
  },
  trustItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  trustNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px'
  },
  trustLabel: {
    fontSize: '0.875rem'
  },
  
  // Footer Styles
  footer: {
    background: 'hsl(var(--foreground))',
    color: 'hsl(var(--background))',
    position: 'relative',
    overflow: 'hidden'
  },
  footerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05
  },
  footerPattern1: {
    position: 'absolute',
    top: '40px',
    left: '40px',
    width: '80px',
    height: '80px',
    border: '1px solid currentColor',
    borderRadius: '50%'
  },
  footerPattern2: {
    position: 'absolute',
    bottom: '40px',
    right: '40px',
    width: '64px',
    height: '64px',
    border: '1px solid currentColor',
    borderRadius: '50%'
  },
  footerPattern3: {
    position: 'absolute',
    top: '50%',
    left: '33%',
    width: '48px',
    height: '48px',
    border: '1px solid currentColor',
    borderRadius: '50%'
  },
  footerContainer: {
    padding: '64px 0',
    position: 'relative'
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: '32px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '32px'
    }
  },
  footerLogo: {
    '@media (max-width: 768px)': {
      gridColumn: 'span 2'
    }
  },
  footerLogoTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center'
  },
  footerLogoText: {
    marginLeft: '8px',
    background: 'linear-gradient(to right, hsl(var(--primary-light)), hsl(var(--secondary-light)))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  footerTagline: {
    color: 'rgba(248, 250, 252, 0.8)',
    lineHeight: 1.6,
    marginBottom: '24px',
    maxWidth: '384px'
  },
  footerLove: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: 'rgba(248, 250, 252, 0.7)',
    gap: '8px'
  },
  footerSectionTitle: {
    fontWeight: '600',
    marginBottom: '24px',
    color: 'hsl(var(--background))'
  },
  footerLinksList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  footerLink: {
    color: 'rgba(248, 250, 252, 0.7)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'color 0.3s ease'
  },
  footerContactList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  footerContactItem: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  footerContactIcon: {
    marginRight: '12px',
    marginTop: '2px'
  },
  footerContactLabel: {
    fontSize: '0.875rem',
    color: 'rgba(248, 250, 252, 0.7)'
  },
  footerContactValue: {
    fontSize: '0.875rem',
    color: 'hsl(var(--background))'
  },
  footerBottom: {
    borderTop: '1px solid rgba(248, 250, 252, 0.2)',
    marginTop: '48px',
    paddingTop: '32px'
  },
  footerBottomContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      gap: '16px'
    }
  },
  footerCopyright: {
    fontSize: '0.875rem',
    color: 'rgba(248, 250, 252, 0.7)'
  },
  footerLegalLinks: {
    display: 'flex',
    gap: '24px',
    fontSize: '0.875rem'
  },
  footerLegalLink: {
    color: 'rgba(248, 250, 252, 0.7)',
    textDecoration: 'none',
    transition: 'color 0.3s ease'
  }
};

export default Home;