import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Phone
} from 'lucide-react';
import SIGA_LOGO from '../../../public/siga-logo.jpg';
import MS_LOGO from '../../../public/download.png';
import GOOGLE_LOGO from '../../../public/download.jpg';
import ENTITY_LOGO from '../../../public/entity.ico';

interface HeroSectionProps {
  posts: any[];
}

export default function HeroSection({ posts }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigationItems = [
    { icon: SIGA_LOGO, label: 'SIGA WEB', href: 'https://www.siga.gov.gh' },
    { icon: MS_LOGO, label: 'SWP', href: 'https://sigaghana.sharepoint.com/sites/swpsiga/SitePages/Index.aspx' },
    { icon: GOOGLE_LOGO, label: 'GOOGLE SEARCH', href: ' https://www.google.com/' },
    { icon: ENTITY_LOGO, label: 'ENTITY PORTAL', href: 'https://entities.siga.gov.gh/' },
    // { icon: Mail, label: 'Contact', href: '/contact' },
    { icon: Phone, label: 'HELP DESK', href: 'https://apps.powerapps.com/play/e/default-645d9c1e-d1b8-4c11-b103-1999d38ec449/a/4fc8f48f-d3d2-4705-bdd0-823307df68c3?tenantId=645d9c1e-d1b8-4c11-b103-1999d38ec449&hidenavbar=true' }
  ];

  if (!posts || posts.length === 0) {
    return null;
  }

  const nextSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrent((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [isTransitioning, posts.length]);

  const prevSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrent((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [isTransitioning, posts.length]);

  const goToSlide = useCallback((index: number) => {
    if (!isTransitioning && index !== current) {
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [isTransitioning, current]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20">
      </nav>

      {/* Main Carousel Section */}
      <div className="relative w-full h-screen">
        {/* Slides */}
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out
              ${index === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={post.featured_image}
                alt={post.description}
                className="object-cover w-full h-full"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Slide Content */}
            <div className="relative z-10 flex flex-col justify-center items-center h-full text-white">
              <div className="text-center space-y-6 px-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-wider">
                  {post?.announcement_header}
                </h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto">
                  {post.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Dots */}
        <div className="absolute bottom-32 left-0 right-0 z-10 flex justify-center gap-4">
          {posts.map((post, index) => (
            <Button
              key={post.id}
              onClick={() => goToSlide(index)}
              variant="ghost"
              size="icon"
              className={`w-3 h-3 p-0 rounded-full transition-all duration-300 
                ${index === current
                  ? 'bg-white hover:bg-white scale-125'
                  : 'bg-gray-400 hover:bg-white'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Arrow Navigation */}
        <Button
          onClick={prevSlide}
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          onClick={nextSlide}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Hashtag */}
        {/* <div className="absolute bottom-24 right-[50%] text-white z-10">
          <p className="text-sm md:text-base">#DISCOVER</p>
        </div> */}

        {/* Fixed Bottom Navigation with Glassmorphism */}
        <div className="fixed bottom-8 w-[80%] left-[16%] z-50 h-20 h-[120px]">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-teal-500/30 animate-gradient-x"></div>
            <div className="absolute inset-0 backdrop-blur-md bg-white/30"></div> */}
          </div>

          {/* Navigation Content */}
          <div className="relative rounded-md z-10 max-w-6xl mx-auto h-full">
            <div className="grid grid-cols-6 h-full">
              {navigationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="group flex flex-col bg-white mx-2 items-center justify-center p-2 transition-all duration-300 rounded-lg hover:shadow-lg hover:scale-105"
                >
                  <div className="relative">
                    {typeof item.icon === 'string' ? (
                      // Render an img tag if the icon is a string path
                      <img src={item.icon} alt={item.label} className="w-10 h-10 mb-1 text-gray-800 group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      // Otherwise, render it as a component
                      <item.icon className="w-10 h-10 mb-1 text-gray-800 group-hover:scale-110 transition-transform duration-300" />
                    )}
                    <div className="absolute inset-0 bg-white/40 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-md font-medium text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                    {item.label}
                  </span>
                </a>
              ))}

            </div>
          </div>

          {/* Top Border Light Effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
