import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Post {
  id: string;
  announcement_header: string;
  featured_image: string;
  description: string;
  created: string;
}

export default function HeroSection({ posts }: { posts: Post[] }) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // If no posts, return null or a loading state
  if (!posts || posts.length === 0) {
    return null;
  }

  console.log(posts);

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
      <nav className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20">
      </nav>

      {/* Carousel */}
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
                alt={post.title}
                className="object-cover w-full h-full"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Slide Content */}
            <div className="relative z-10 flex flex-col justify-center items-center h-full text-white">
              <div className="text-center space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-wider">
                    {post?.announcement_header}
                </h1>
                <p className="text-lg md:text-xl">{post.description}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <div className="absolute bottom-20 left-0 right-0 z-10 flex justify-center gap-4">
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

        {/* Navigation Arrows */}
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

        {/* Bottom Text */}
        {/* <div className="absolute bottom-8 left-8 text-white z-10">
          <p className="text-sm md:text-base">
            A modern, co-educational institution
            <br />
            for like-minded teens
          </p>
        </div> */}

        {/* Hashtag */}
        <div className="absolute bottom-8 right-[50%] text-white z-10">
          <p className="text-sm md:text-base">#DISCOVER</p>
        </div>
      </div>
    </div>
  );
}