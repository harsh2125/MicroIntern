import { Link } from 'react-router-dom';
import {
  HiArrowRight, HiSearch, HiBriefcase, HiUsers,
  HiChartBar, HiCheckCircle,
} from 'react-icons/hi';
import Layout from '../components/layout/Layout';
import InternshipCard from '../components/internship/InternshipCard';
import Button from '../components/common/Button';
import {
  STATS, FEATURED_INTERNSHIPS, HOW_IT_WORKS,
  TESTIMONIALS, CATEGORIES_SHOWCASE,
} from '../data/mockData';
import { ROUTES } from '../utils/constants';

const StatIcon = ({ name }) => {
  const icons = {
    briefcase: <HiBriefcase className="h-5 w-5" />,
    building:  <HiChartBar  className="h-5 w-5" />,
    users:     <HiUsers     className="h-5 w-5" />,
    chart:     <HiCheckCircle className="h-5 w-5" />,
  };
  return icons[name] || null;
};

function Home() {
  return (
    <Layout>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900 py-20 sm:py-28">
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hero-blob w-80 h-80 bg-primary-300 dark:bg-primary-800
                          top-0 -right-20 animation-delay-2" />
          <div className="hero-blob w-72 h-72 bg-teal-200 dark:bg-teal-900
                          -bottom-20 -left-16" />
          <div className="hero-blob w-64 h-64 bg-blue-200 dark:bg-blue-900
                          top-1/2 left-1/2 animation-delay-4" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Floating circles decoration */}
          <div className="absolute top-24 left-12 w-3 h-3 bg-primary-400 rounded-full animate-float opacity-60" />
          <div className="absolute top-40 right-24 w-2 h-2 bg-teal-400 rounded-full animate-float animation-delay-2 opacity-60" />
          <div className="absolute bottom-32 left-1/3 w-4 h-4 bg-blue-400 rounded-full animate-float animation-delay-4 opacity-40" />
          <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-primary-300 rounded-full animate-float opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30
                            text-primary-700 dark:text-primary-400 text-sm font-medium
                            px-4 py-2 rounded-full mb-8 border border-primary-200
                            dark:border-primary-800 animate-fade-up">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              1–4 week sprints · Real projects · Real pay
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900
                           dark:text-white leading-tight tracking-tight mb-6 animate-fade-up">
              Launch your career with{' '}
              <span className="gradient-text italic">
                micro&#8209;internships
              </span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-10
                          max-w-2xl mx-auto animate-fade-up">
              Short-term, project-based internships that fit your schedule.
              Build a real portfolio, earn while you learn, and land the role you actually want.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 animate-fade-up">
              <Link to={ROUTES.INTERNSHIPS}>
                <Button size="lg" className="shimmer-btn border-0 shadow-lg shadow-primary-200 dark:shadow-none gap-2">
                  Browse Open Roles
                  <HiArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button size="lg" variant="outline" className="backdrop-blur-sm">
                  Post an Internship
                </Button>
              </Link>
            </div>

            {/* Search bar */}
            <div className="max-w-xl mx-auto glass-card p-1.5 shadow-xl animate-fade-up">
              <div className="flex items-center gap-2 px-3 py-2">
                <HiSearch className="h-5 w-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by role, skill, or company..."
                  className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300
                             placeholder-gray-400 outline-none"
                  onKeyDown={e => e.key === 'Enter' && (window.location.href = ROUTES.INTERNSHIPS)}
                />
                <Link to={ROUTES.INTERNSHIPS}>
                  <Button size="sm" className="shrink-0">Search</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ═════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-primary-600 dark:bg-primary-800 py-10">
        {/* Subtle animated bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full animate-blob" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full animate-blob animation-delay-4" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-3 text-white group">
                <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center
                                shrink-0 group-hover:bg-white/25 transition-colors duration-200">
                  <StatIcon name={icon} />
                </div>
                <div>
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-sm text-primary-200">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORIES ════════════════════════════════════════ */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse by category</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Find the perfect sprint for your skillset</p>
          </div>
          <Link to={ROUTES.INTERNSHIPS} className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline hidden sm:block">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES_SHOWCASE.map(({ name, icon, count, color }) => (
            <Link
              key={name}
              to={`${ROUTES.INTERNSHIPS}?category=${name}`}
              className={`${color} rounded-2xl p-4 text-center
                          hover:scale-105 active:scale-95 transition-all duration-200
                          cursor-pointer border border-transparent hover:border-current
                          hover:shadow-lg`}
            >
              <div className="text-2xl mb-2">{icon}</div>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs opacity-70 mt-0.5">{count} roles</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ FEATURED INTERNSHIPS ══════════════════════════════ */}
      <section className="py-8 pb-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured internships</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Hand-picked, high-quality sprints posted this week</p>
            </div>
            <Link to={ROUTES.INTERNSHIPS} className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline hidden sm:block">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_INTERNSHIPS.map(internship => (
              <InternshipCard key={internship.id} internship={internship} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to={ROUTES.INTERNSHIPS}>
              <Button size="lg" variant="outline">
                View all internships <HiArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-96 h-96 rounded-full border border-gray-100 dark:border-gray-800 animate-spin-slow opacity-30" />
          <div className="absolute inset-4 rounded-full border border-gray-100 dark:border-gray-800 animate-spin-slow opacity-20" style={{ animationDirection: 'reverse' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">How it works</h2>
            <p className="text-gray-500 dark:text-gray-400">Three steps to your next big opportunity</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-14 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-700 to-transparent" />

            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div key={step} className="relative text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100
                                dark:from-primary-900/30 dark:to-primary-800/20
                                rounded-2xl flex items-center justify-center mx-auto mb-5
                                group-hover:scale-110 transition-transform duration-300
                                border border-primary-200 dark:border-primary-800">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-mono">{step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" className="shimmer-btn border-0">Create Your Profile Free →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Student success stories</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Real results from real students</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ id, name, role, avatar, avatarColor, text }) => (
              <div key={id} className="card card-hover group">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 group-hover:scale-110 transition-transform"
                          style={{ transitionDelay: `${i * 30}ms` }}>★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor}`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 bg-primary-600 dark:bg-primary-800">
        {/* Animated bg blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full animate-blob" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full animate-blob animation-delay-4" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full animate-blob animation-delay-2" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to launch your career?
          </h2>
          <p className="text-primary-100 mb-10 text-lg">
            Join 12,000+ students who found real-world experience through MicroIntern.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={ROUTES.REGISTER}>
              <button className="px-6 py-3 bg-white text-primary-700 font-bold text-sm rounded-xl
                                 hover:bg-primary-50 active:scale-95 transition-all duration-200
                                 shadow-lg shadow-primary-900/20">
                Start as a Student
              </button>
            </Link>
            <Link to={`${ROUTES.REGISTER}?role=company`}>
              <button className="px-6 py-3 bg-white/15 text-white font-bold text-sm rounded-xl
                                 border border-white/30 hover:bg-white/25 active:scale-95
                                 transition-all duration-200 backdrop-blur-sm">
                Post Internships
              </button>
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
}

export default Home;