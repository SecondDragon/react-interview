import { useRef, useState, useEffect, type ReactNode } from 'react';

interface LazyMountProps {
  children: ReactNode;
  placeholder?: ReactNode;
  rootMargin?: number;
}

function isInViewport(el: HTMLElement, margin: number): boolean {
  const rect = el.getBoundingClientRect();
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  return (
    rect.bottom >= -margin &&
    rect.right >= -margin &&
    rect.top <= wh + margin &&
    rect.left <= ww + margin
  );
}

export default function LazyMount({
  children,
  placeholder,
  rootMargin = 100,
}: LazyMountProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isInViewport(el, rootMargin)) {
      setHasMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: `${rootMargin}px` },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{hasMounted ? children : placeholder}</div>;
}
