import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .slide-in-left {
    animation: slideInLeft 0.8s ease-out forwards;
  }

  .slide-in-right {
    animation: slideInRight 0.8s ease-out forwards;
  }

  .float {
    animation: float 3s ease-in-out infinite;
  }

  .pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  .bounce {
    animation: bounce 2s ease-in-out infinite;
  }

  .feature-card:hover {
    transform: translateY(-10px) !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #ff6a00, #f25c05);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`

function LandingPage() {
  const [animateElements, setAnimateElements] = useState({})
  const [visibleElements, setVisibleElements] = useState({})

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = styles
    document.head.appendChild(style)

    setAnimateElements({
      hero: true,
      features: true,
      stats: true,
    })

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const elementId = entry.target.getAttribute('data-animate-id')
          setVisibleElements((prev) => ({
            ...prev,
            [elementId]: true,
          }))
          // Stop observing once animated
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    })

    // Observe all elements with data-animate-id
    setTimeout(() => {
      document.querySelectorAll('[data-animate-id]').forEach((el) => {
        observer.observe(el)
      })
    }, 100)

    return () => {
      document.head.removeChild(style)
      observer.disconnect()
    }
  }, [])

  const features = [
    {
      icon: '📅',
      title: 'Smart AI Schedule',
      description: 'Intelligent scheduling powered by AI that adapts to your learning pace and workload',
      color: '#ff6a00',
    },
    {
      icon: '🧠',
      title: 'Stress Hub & Wellness',
      description: 'Comprehensive mental health support with games, relaxation sessions, and stress tracking',
      color: '#ff8c00',
    },
    {
      icon: '📊',
      title: 'Academic Analytics',
      description: 'Real-time progress tracking, performance insights, and personalized learning recommendations',
      color: '#ff7a00',
    },
    {
      icon: '👥',
      title: 'Collaborative Learning',
      description: 'Study groups, Kuppi sessions, and peer-to-peer learning with classmates',
      color: '#ff6600',
    },
    {
      icon: '📚',
      title: 'Resource Library',
      description: 'Curated educational materials, software hub, and AI-powered note generation',
      color: '#ff5500',
    },
    {
      icon: '🎯',
      title: 'Goal Tracking',
      description: 'Set, monitor, and achieve your academic goals with milestone tracking',
      color: '#ff4500',
    },
  ]

  const stats = [
    { number: '10K+', label: 'Active Students' },
    { number: '500+', label: 'Courses' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'Support' },
  ]

  const testimonials = [
    {
      name: 'Aisha Kumar',
      role: 'Computer Science Student',
      text: 'Eduza transformed my study habits. The AI schedule has been a game-changer!',
      image: '👩‍🎓',
    },
    {
      name: 'Rajesh Silva',
      role: 'Engineering Major',
      text: 'The stress management features helped me through tough semesters.',
      image: '👨‍🎓',
    },
    {
      name: 'Emma Thompson',
      role: 'Business Student',
      text: 'Best investment in my academic journey. Highly recommended!',
      image: '👩‍🏫',
    },
  ]

  const heroImages = [
    '/images/stress-games/featured-underwater.jpg',
    '/images/stress-games/desert-sunrise.jpg',
    '/images/stress-games/firefly-forest.jpg',
  ]

  const campusGallery = [
    '/images/stress-green/learn-new.jpg',
    '/images/stress-green/set-goal.jpg',
    '/images/stress-green/create-something.jpg',
    '/images/stress-green/future-self.jpg',
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ff6a00 0%, #f25c05 55%, #d5541b 100%)', overflow: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        background: 'rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 100,
      }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🎓 <span>Eduza</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/login" style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.5)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(5px)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)'
            e.target.style.borderColor = 'white'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)'
            e.target.style.borderColor = 'rgba(255,255,255,0.5)'
          }}>
            Sign In
          </Link>
          <Link to="/register" style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#ff6a00',
            border: 'none',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)'
            e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Animated Background Elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          top: '-100px',
          right: '-100px',
          animation: 'float 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          bottom: '100px',
          left: '-50px',
          animation: 'float 5s ease-in-out infinite',
          animationDelay: '1s',
        }} />
      </div>

      {/* Hero Section */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem 3rem',
        textAlign: 'center',
        color: 'white',
        minHeight: 'calc(100vh - 80px)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div className="fade-in-up" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 4rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            lineHeight: '1.2',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            Transform Your <br />
            <span style={{ background: 'linear-gradient(120deg, #fff, #ffe6cc)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Academic Journey
            </span>
          </h1>
        </div>

        <div className="fade-in-up" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s forwards', opacity: 0 }}>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.3rem)',
            marginBottom: '1.5rem',
            maxWidth: '600px',
            opacity: 0.95,
            lineHeight: '1.8',
            textShadow: '0 1px 5px rgba(0,0,0,0.1)',
          }}>
            All-in-one platform for smart learning, stress management, and academic excellence
          </p>
        </div>

        <div className="fade-in-up" style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          animation: 'fadeInUp 0.8s ease-out 0.4s forwards',
          opacity: 0,
        }}>
          <Link to="/register" style={{
            padding: '1rem 2.5rem',
            background: 'white',
            color: '#ff6a00',
            border: 'none',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)'
            e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)'
          }}>
            Start Learning Today
          </Link>
          <Link to="/login" style={{
            padding: '1rem 2.5rem',
            background: 'rgba(255,255,255,0.25)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.5)',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.35)'
            e.target.style.borderColor = 'white'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.25)'
            e.target.style.borderColor = 'rgba(255,255,255,0.5)'
          }}>
            Sign In
          </Link>
        </div>

        <div
          data-animate-id="hero-images"
          style={{
            marginTop: '2.5rem',
            width: 'min(100%, 980px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            opacity: visibleElements['hero-images'] ? 1 : 0,
            transform: visibleElements['hero-images'] ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          {heroImages.map((src, idx) => (
            <div
              key={src}
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.35)',
                boxShadow: '0 12px 28px rgba(0,0,0,0.24)',
                animation: idx % 2 === 0 ? 'float 4s ease-in-out infinite' : 'float 5s ease-in-out infinite',
              }}
            >
              <img
                src={src}
                alt="Eduza learning atmosphere"
                style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          animation: 'bounce 2s ease-in-out infinite',
          opacity: 0.7,
        }}>
          <div style={{ fontSize: '1.5rem' }}>⬇</div>
        </div>
      </section>

      {/* Learning Gallery */}
      <section style={{
        padding: '4rem 2rem 5rem',
        background: '#fff8f3',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            data-animate-id="gallery-title"
            style={{
              textAlign: 'center',
              marginBottom: '2rem',
              opacity: visibleElements['gallery-title'] ? 1 : 0,
              transform: visibleElements['gallery-title'] ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <h2 style={{ fontSize: '2.2rem', color: '#1f2937', marginBottom: '0.5rem' }}>Campus Learning Moments</h2>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>A vibrant student experience built for growth, focus, and collaboration.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            {campusGallery.map((src, idx) => (
              <div
                key={src}
                data-animate-id={`gallery-${idx}`}
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: '#fff',
                  border: '1px solid #f3ded2',
                  boxShadow: '0 8px 22px rgba(60, 20, 0, 0.08)',
                  opacity: visibleElements[`gallery-${idx}`] ? 1 : 0,
                  transform: visibleElements[`gallery-${idx}`] ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.65s ease ${idx * 0.08}s, transform 0.65s ease ${idx * 0.08}s`,
                }}
              >
                <img
                  src={src}
                  alt="Student learning activity"
                  style={{ width: '100%', height: '210px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'white',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: '#1f2937',
            }}>
              Powerful Features for Modern Learners
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Everything you need to excel academically and maintain mental wellness
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem',
          }}>
            {features.map((feature, idx) => (
              <div key={idx} 
                data-animate-id={`feature-${idx}`}
                className="feature-card"
                style={{
                  padding: '2rem',
                  background: '#f9fafb',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: visibleElements[`feature-${idx}`] ? `fadeInUp 0.8s ease-out ${idx * 0.1}s forwards` : 'none',
                  opacity: visibleElements[`feature-${idx}`] ? 1 : 0,
                  transform: visibleElements[`feature-${idx}`] ? 'translateY(0)' : 'translateY(30px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = feature.color
                }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  display: 'inline-block',
                  animation: 'bounce 2s ease-in-out infinite',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: feature.color,
                  transform: 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scaleX(1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scaleX(0)'
                }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #ff6a00 0%, #f25c05 55%, #d5541b 100%)',
        color: 'white',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            textAlign: 'center',
          }}>
            {stats.map((stat, idx) => (
              <div key={idx} 
                data-animate-id={`stat-${idx}`}
                style={{
                  animation: visibleElements[`stat-${idx}`] ? `fadeInUp 0.8s ease-out ${idx * 0.1}s forwards` : 'none',
                  opacity: visibleElements[`stat-${idx}`] ? 1 : 0,
                  transform: visibleElements[`stat-${idx}`] ? 'translateY(0)' : 'translateY(30px)',
                }}>
                <div className="stat-number">{stat.number}</div>
                <p style={{ fontSize: '1.1rem', marginTop: '0.5rem', opacity: 0.9 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'white',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#1f2937',
          }}>
            What Students Say
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {testimonials.map((testimonial, idx) => (
              <div key={idx} 
                data-animate-id={`testimonial-${idx}`}
                style={{
                  padding: '2rem',
                  background: '#f9fafb',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  animation: visibleElements[`testimonial-${idx}`] ? `fadeInUp 0.8s ease-out ${idx * 0.1}s forwards` : 'none',
                  opacity: visibleElements[`testimonial-${idx}`] ? 1 : 0,
                  transform: visibleElements[`testimonial-${idx}`] ? 'translateY(0)' : 'translateY(30px)',
                }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ff6a00'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 106, 0, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = 'none'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{testimonial.image}</div>
                <p style={{ fontSize: '1rem', color: '#374151', marginBottom: '1.5rem', fontStyle: 'italic', lineHeight: '1.8' }}>
                  "{testimonial.text}"
                </p>
                <div>
                  <p style={{ fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>{testimonial.name}</p>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #ff6a00 0%, #f25c05 55%, #d5541b 100%)',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        zIndex: 10,
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Ready to Excel in Your Studies?
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
          Join thousands of students using Eduza to achieve their academic goals
        </p>
        <Link to="/register" style={{
          padding: '1rem 2.5rem',
          background: 'white',
          color: '#d5541b',
          border: 'none',
          borderRadius: '10px',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          display: 'inline-block',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-3px)'
          e.target.style.boxShadow = '0 6px 25px rgba(0,0,0,0.3)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          Start Your Journey
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '3rem 2rem',
        background: 'rgba(0,0,0,0.2)',
        color: 'white',
        textAlign: 'center',
        fontSize: '0.9rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
              About Us
            </a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
              Contact
            </a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
              Privacy Policy
            </a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
              Terms of Service
            </a>
          </div>
        </div>
        <p style={{ opacity: 0.8 }}>&copy; 2026 Eduza. Empowering Students Everywhere. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default LandingPage
