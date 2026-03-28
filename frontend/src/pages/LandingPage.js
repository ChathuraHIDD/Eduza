import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

const services = [
  {
    title: 'Course Tracking',
    text: 'Track your enrolled courses and keep your academic journey organized.',
    icon: '📚',
    color: '#facc15',
  },
  {
    title: 'Smart Planning',
    text: 'Manage class schedules, deadlines, and study routines with ease.',
    icon: '🟢',
    color: '#22c55e',
  },
  {
    title: 'Progress View',
    text: 'See your course performance and completion progress clearly.',
    icon: '🟣',
    color: '#8b5cf6',
  },
  {
    title: 'More Tools',
    text: 'Access helpful academic features from one elegant dashboard.',
    icon: '🟠',
    color: '#f97316',
  },
]

const processSteps = [
  'Log in to your dashboard',
  'Check classes and assignments',
  'Track your study progress',
  'Improve performance step by step',
]

const courseCards = [
  {
    id: 1,
    title: 'Advanced Web Development',
    lecturer: 'Dr. Sarah Chen',
    progress: 72,
    color: '#f97316',
  },
  {
    id: 2,
    title: 'Data Structures & Algorithms',
    lecturer: 'Prof. Mark Williams',
    progress: 45,
    color: '#3b82f6',
  },
  {
    id: 3,
    title: 'UI/UX Design Principles',
    lecturer: 'Ms. Anya Patel',
    progress: 91,
    color: '#22c55e',
  },
]

const testimonials = [
  {
    name: 'Ayesha N',
    role: 'Student',
    text: 'This platform makes it so easy to stay on top of classes and deadlines every week.',
  },
  {
    name: 'Hasith J',
    role: 'Student',
    text: 'Clean design, simple dashboard, and really helpful for managing my academic work.',
  },
  {
    name: 'Yasir H',
    role: 'Lecturer',
    text: 'The interface feels modern and organized. It gives students a much better experience.',
  },
]

function Navbar() {
  return (
    <header
      style={{
        width: '100%',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid #f2ebe5',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1440,
          margin: '0 auto',
          padding: '1rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
          <BrandLogo
            width={188}
            height={62}
            rounded={14}
            scale={1.1}
            bg='transparent'
            padding={0}
            imageStyle={{ objectFit: 'contain' }}
          />
        </div>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.7rem',
            flexWrap: 'wrap',
            color: '#374151',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <span style={{ color: '#f97316' }}>Home</span>
          <span>About us</span>
          <span>Services</span>
          <span>Contact us</span>
          <span>Blog</span>
        </nav>

        <Link
          to="/login"
          style={{
            textDecoration: 'none',
            background: '#f97316',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 8px 18px rgba(249,115,22,0.22)',
          }}
        >
          Sign Up
        </Link>
      </div>
    </header>
  )
}

function ServiceCard({ item }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #f0ebe7',
        borderRadius: 16,
        padding: '1rem',
        boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
        minHeight: 150,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: item.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          marginBottom: 12,
        }}
      >
        {item.icon}
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 6 }}>
        {item.title}
      </div>

      <div style={{ fontSize: 12, lineHeight: 1.7, color: '#6b7280' }}>{item.text}</div>
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #eee8e3',
        borderRadius: 16,
        padding: '1rem',
        boxShadow: '0 8px 20px rgba(15,23,42,0.05)',
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: `${course.color}15`,
          border: `1px solid ${course.color}25`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <svg width="18" height="18" fill="none" stroke={course.color} strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
        {course.title}
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>{course.lecturer}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Progress</span>
        <span style={{ fontSize: 12, color: course.color, fontWeight: 700 }}>{course.progress}%</span>
      </div>

      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
        <div
          style={{
            width: `${course.progress}%`,
            height: '100%',
            background: course.color,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  )
}

function TestimonialCard({ item }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #f0ebe7',
        borderRadius: 16,
        padding: '1rem',
        boxShadow: '0 8px 20px rgba(15,23,42,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#ffedd5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          👤
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{item.name}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.role}</div>
        </div>
      </div>

      <div style={{ fontSize: 12, lineHeight: 1.7, color: '#6b7280' }}>{item.text}</div>

      <div style={{ marginTop: 10, color: '#f59e0b', fontSize: 13 }}>★★★★★</div>
    </div>
  )
}

function Home() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const firstName = user?.name ? user.name.split(' ')[0] : 'User'

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          @media (max-width: 1100px) {
            .home-hero,
            .home-process,
            .home-agency {
              grid-template-columns: 1fr !important;
            }

            .home-testimonials {
              grid-template-columns: 1fr 1fr !important;
            }
          }

          @media (max-width: 820px) {
            .home-services,
            .home-courses,
            .home-testimonials,
            .home-footer-grid {
              grid-template-columns: 1fr !important;
            }

            .home-section {
              padding-left: 1.2rem !important;
              padding-right: 1.2rem !important;
            }

            .home-hero-people {
              minHeight: 260px !important;
            }

            .hero-person-left,
            .hero-person-right {
              font-size: 90px !important;
            }

            .hero-seat-left,
            .hero-seat-right {
              width: 130px !important;
              height: 70px !important;
            }
          }
        `}
      </style>

      <Navbar />

      <section
        className="home-section home-hero"
        style={{
          width: '100%',
          maxWidth: 1440,
          margin: '0 auto',
          padding: '4rem 2.5rem 3rem',
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 18,
              opacity: 0.85,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f4c7a1' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e8d6c8' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f0c39f' }} />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(2.6rem, 5vw, 5.4rem)',
              lineHeight: 1.05,
              fontWeight: 800,
              color: '#1f2937',
              maxWidth: 700,
              letterSpacing: '-2px',
            }}
          >
            We create
            <span style={{ color: '#f97316' }}> solutions </span>
            for your academic success
          </h1>

          <p
            style={{
              margin: '18px 0 0',
              fontSize: 16,
              lineHeight: 1.9,
              color: '#6b7280',
              maxWidth: 520,
            }}
          >
            Welcome back, {firstName}. Our learning platform helps you manage classes, schedules,
            assignments, and course progress in one elegant place.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 28 }}>
            <Link
              to="/smart-schedule"
              style={{
                textDecoration: 'none',
                background: '#f97316',
                color: '#fff',
                padding: '14px 24px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                boxShadow: '0 10px 22px rgba(249,115,22,0.24)',
              }}
            >
              Get Started
            </Link>

            <Link
              to="/profile"
              style={{
                textDecoration: 'none',
                color: '#4b5563',
                fontSize: 14,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 8px',
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ▾
              </span>
              Explore more
            </Link>
          </div>
        </div>

        <div
          className="home-hero-people"
          style={{
            minHeight: 380,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="hero-seat-left"
            style={{
              position: 'absolute',
              left: 60,
              bottom: 75,
              width: 185,
              height: 95,
              borderRadius: '90px 90px 36px 36px',
              background: '#d9a162',
            }}
          />
          <div
            className="hero-seat-right"
            style={{
              position: 'absolute',
              right: 60,
              bottom: 95,
              width: 195,
              height: 105,
              borderRadius: '90px 90px 36px 36px',
              background: '#eba05b',
            }}
          />
          <div
            className="hero-person-left"
            style={{
              position: 'absolute',
              left: 90,
              top: 55,
              fontSize: 130,
            }}
          >
            🧑‍💻
          </div>
          <div
            className="hero-person-right"
            style={{
              position: 'absolute',
              right: 75,
              top: 35,
              fontSize: 135,
            }}
          >
            👩‍💻
          </div>
        </div>
      </section>

      <section
        className="home-section"
        style={{
          width: '100%',
          maxWidth: 1440,
          margin: '0 auto',
          padding: '1rem 2.5rem 4rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.7rem' }}>
          <h2 style={{ margin: 0, fontSize: 44, fontWeight: 800, color: '#1f2937', letterSpacing: '-1px' }}>
            We Provide The Best Services
          </h2>
          <p style={{ margin: '10px 0 0', fontSize: 14, color: '#9ca3af' }}>
            Let us unlock the full potential of your student experience
          </p>
        </div>

        <div
          className="home-services"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '1rem',
          }}
        >
          {services.map((item) => (
            <ServiceCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section
        className="home-section home-process"
        style={{
          width: '100%',
          background: '#fff3ec',
          padding: '4rem 2.5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            minHeight: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 180,
          }}
        >
          🧑‍🎓
        </div>

        <div>
          <h2 style={{ margin: 0, fontSize: 48, fontWeight: 800, color: '#1f2937', lineHeight: 1.1, letterSpacing: '-1px' }}>
            Simple <span style={{ color: '#f97316' }}>Solutions!</span>
          </h2>

          <p
            style={{
              margin: '16px 0 0',
              fontSize: 16,
              lineHeight: 1.9,
              color: '#6b7280',
              maxWidth: 520,
            }}
          >
            We understand that no two students are alike. That’s why we make your learning
            process simpler, faster, and easier to manage.
          </p>

          <div style={{ display: 'grid', gap: 14, marginTop: 26 }}>
            {processSteps.map((step, index) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: '#f97316',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>{step}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            <Link
              to="/smart-schedule"
              style={{
                textDecoration: 'none',
                background: '#f97316',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Get Started
            </Link>

            <Link
              to="/profile"
              style={{
                textDecoration: 'none',
                background: '#fff',
                color: '#6b7280',
                padding: '12px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                border: '1px solid #eadcd1',
              }}
            >
              Read more
            </Link>
          </div>
        </div>
      </section>

      <section
        className="home-section home-agency"
        style={{
          width: '100%',
          maxWidth: 1440,
          margin: '0 auto',
          padding: '4rem 2.5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 48, fontWeight: 800, color: '#1f2937', lineHeight: 1.1, letterSpacing: '-1px' }}>
            Our <span style={{ color: '#f97316' }}>Agency</span>
          </h2>

          <p
            style={{
              margin: '16px 0 0',
              fontSize: 16,
              lineHeight: 1.9,
              color: '#6b7280',
              maxWidth: 520,
            }}
          >
            We believe in the power of data and smart organization. Our platform-driven approach
            helps students make better academic decisions and optimize their daily workflow.
          </p>

          <Link
            to="/smart-schedule"
            style={{
              display: 'inline-block',
              marginTop: 20,
              textDecoration: 'none',
              background: '#f97316',
              color: '#fff',
              padding: '12px 18px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Read more
          </Link>
        </div>

        <div
          style={{
            minHeight: 330,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 180,
          }}
        >
          👨‍💼
        </div>
      </section>

      <section
        className="home-section"
        style={{
          width: '100%',
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 2.5rem 4rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: 44, fontWeight: 800, color: '#1f2937', letterSpacing: '-1px' }}>
            What Clients Say!
          </h2>
          <p style={{ margin: '10px 0 0', fontSize: 14, color: '#9ca3af' }}>
            See how our digital learning agency helped students achieve more
          </p>
        </div>

        <div
          className="home-testimonials"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '1rem',
          }}
        >
          {testimonials.map((item) => (
            <TestimonialCard key={item.name} item={item} />
          ))}
        </div>
      </section>

      <section
        className="home-section"
        style={{
          width: '100%',
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 2.5rem 3rem',
        }}
      >
        <div
          style={{
            background: '#f97316',
            borderRadius: 16,
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>Ready to get started?</div>

          <Link
            to="/contact"
            style={{
              textDecoration: 'none',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.75)',
              padding: '11px 18px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Contact Us
          </Link>
        </div>
      </section>

      <footer
        style={{
          width: '100%',
          background: '#faeee7',
          padding: '2.5rem 2.5rem 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="home-footer-grid"
          style={{
            width: '100%',
            maxWidth: 1440,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <BrandLogo
                width={166}
                height={56}
                rounded={12}
                scale={1.06}
                bg='transparent'
                padding={0}
                imageStyle={{ objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, fontSize: 18 }}>
              <span>📘</span>
              <span>📸</span>
              <span>🐦</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Company</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>About</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>Contact</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>Career</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>Team</div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Designs</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>Design criteria</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>Student projects</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>Academic visuals</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>Drawing</div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Resources</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>Become a designer</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>Blog</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>Design without borders</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>Advocates</div>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: 1440,
            margin: '24px auto 0',
            textAlign: 'center',
            fontSize: 12,
            color: '#9ca3af',
            position: 'relative',
            zIndex: 2,
          }}
        >
          All rights reserved 2027
        </div>

        <div
          style={{
            position: 'absolute',
            left: -30,
            right: -30,
            bottom: -38,
            height: 86,
            background: '#f97316',
            borderTopLeftRadius: '55% 100%',
            borderTopRightRadius: '45% 100%',
          }}
        />
      </footer>
    </div>
  )
}

export default Home