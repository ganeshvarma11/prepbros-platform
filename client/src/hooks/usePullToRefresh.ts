import { useMemo, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";

type PullToRefreshOptions = {
  enabled?: boolean;
  threshold?: number;
  onRefresh: () => Promise<void> | void;
};

export function usePullToRefresh({
  enabled = true,
  threshold = 72,
  onRefresh,
}: PullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const activeRef = useRef(false);

  const reset = () => {
    startYRef.current = null;
    activeRef.current = false;
    setPullDistance(0);
  };

  const bind = useMemo(
    () => ({
      onTouchStart: (event: ReactTouchEvent<HTMLElement>) => {
        if (!enabled || isRefreshing) return;
        if (typeof window !== "undefined" && window.scrollY > 4) return;

        startYRef.current = event.touches[0]?.clientY ?? null;
        activeRef.current = true;
      },
      onTouchMove: (event: ReactTouchEvent<HTMLElement>) => {
        if (!activeRef.current || startYRef.current === null) return;
        if (typeof window !== "undefined" && window.scrollY > 4) {
          reset();
          return;
        }

        const deltaY = (event.touches[0]?.clientY ?? 0) - startYRef.current;
        if (deltaY <= 0) {
          setPullDistance(0);
          return;
        }

        const nextDistance = Math.min(120, deltaY * 0.5);
        setPullDistance(nextDistance);

        if (nextDistance > 4) {
          event.preventDefault();
        }
      },
      onTouchEnd: async () => {
        if (!activeRef.current) return;

        const shouldRefresh = pullDistance >= threshold;
        activeRef.current = false;
        startYRef.current = null;

        if (!shouldRefresh) {
          setPullDistance(0);
          return;
        }

        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      },
      onTouchCancel: () => {
        reset();
      },
    }),
    [enabled, isRefreshing, onRefresh, pullDistance, threshold]
  );

  return {
    bind,
    isRefreshing,
    pullDistance,
    readyToRefresh: pullDistance >= threshold,
  };
}
