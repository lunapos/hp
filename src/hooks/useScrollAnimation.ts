"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // IntersectionObserver は observe した直後に必ず一度コールバックを呼ぶ。
    // その初回通知でマウント時点の可視状態が分かるので、
    // getBoundingClientRect による同期的な setState は行わない。
    let isFirstCallback = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 初回通知で既に表示領域内にある要素は、アニメーションなしで即表示する
        if (isFirstCallback && entry.isIntersecting) {
          setShouldAnimate(false);
        }
        isFirstCallback = false;

        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible, shouldAnimate };
}
