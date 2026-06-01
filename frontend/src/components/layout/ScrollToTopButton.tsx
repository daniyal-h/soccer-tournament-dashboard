import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 400);
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      size="icon"
      className="fixed bottom-6 right-6 rounded-full shadow-lg"
      aria-label="Scroll to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    >
      <ArrowUp className="size-5" />
    </Button>
  );
}
