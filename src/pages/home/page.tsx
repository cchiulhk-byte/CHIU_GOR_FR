import { useDarkMode } from '@/hooks/useDarkMode';
import FallingLeaves from '@/components/feature/FallingLeaves';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturedBlogCarousel from './components/FeaturedBlogCarousel';
import AboutSection from './components/AboutSection';
import ExperienceSection from './components/ExperienceSection';
import CoursesSection from './components/CoursesSection';
import ContactSection from './components/ContactSection';
import WhyChooseMeSection from './components/WhyChooseMeSection';
import TestimonialsSection from './components/TestimonialsSection';
import WhatsAppButton from '@/components/feature/WhatsAppButton';
import Footer from './components/Footer';

export default function Home() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-ink-900 transition-colors duration-500">
      <FallingLeaves />
      <Navbar isDark={isDark} onToggleDark={toggle} />
      <main>
        <HeroSection />
        <WhyChooseMeSection />
        <AboutSection />
        <FeaturedBlogCarousel />
        <ExperienceSection />
        <CoursesSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}