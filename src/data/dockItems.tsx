import React from 'react';
import { Home, Search, Bell, Settings, User, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

// Dummy data for dock items
const dockItems = [
  {
    title: "Home",
    icon: <Home className="w-6 h-6" />,
    href: "/home"
  },
  {
    title: "Search",
    icon: <Search className="w-6 h-6" />,
    href: "/search"
  },
  {
    title: "Notifications",
    icon: <Bell className="w-6 h-6" />,
    href: "/notifications"
  },
  {
    title: "Messages",
    icon: <Mail className="w-6 h-6" />,
    href: "/messages"
  },
  {
    title: "Profile",
    icon: <User className="w-6 h-6" />,
    href: "/profile"
  },
  {
    title: "Settings",
    icon: <Settings className="w-6 h-6" />,
    href: "/settings"
  }
];

// IconContainer Component
interface IconContainerProps {
  mouseX: number;
  title: string;
  icon: React.ReactNode;
  href: string;
}

const IconContainer: React.FC<IconContainerProps> = ({  title, icon, href }) => {
  return (
    <motion.a
      href={href}
      className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      <span className="absolute bottom-full mb-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
        {title}
      </span>
    </motion.a>
  );
};

// Floating Dock Component that combines both mobile and desktop
interface FloatingDockProps {
  items?: typeof dockItems;
  desktopClassName?: string;
  mobileClassName?: string;
}

const FloatingDock: React.FC<FloatingDockProps> = ({ items = dockItems, desktopClassName, mobileClassName }) => {
  // Desktop version
  const Desktop = () => (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:flex bg-gray-900/50 backdrop-blur-md px-6 py-4 rounded-full gap-4 ${desktopClassName}`}>
      {items.map((item, index) => (
        <IconContainer
          key={index}
          mouseX={0} // You would need to implement mouse tracking for the full effect
          {...item}
        />
      ))}
    </div>
  );

  // Mobile version
  const Mobile = () => (
    <div className={`fixed bottom-0 w-full flex lg:hidden bg-gray-900/50 backdrop-blur-md px-4 py-3 gap-2 justify-around ${mobileClassName}`}>
      {items.map((item, index) => (
        <IconContainer
          key={index}
          mouseX={0}
          {...item}
        />
      ))}
    </div>
  );

  return (
    <>
      <Desktop />
      <Mobile />
    </>
  );
};


export { dockItems, FloatingDock };