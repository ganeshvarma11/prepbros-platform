import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type SwipeAxis = "x" | "y";

type SwipeableOptions = {
  axis?: SwipeAxis;
  enabled?: boolean;
  minDistance?: number;
  mouse?: boolean;
  resistance?: number;
  ignoreInteractive?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
};

const INTERACTIVE_SELECTOR =
  "button,a,input,textarea,select,label,[role='button'],[data-no-swipe='true']";

export function useSwipeable({
  axis = "x",
  enabled = true,
  minDistance = 72,
  mouse = false,
  resistance = 0.45,
  ignoreInteractive = true,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}: SwipeableOptions) {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const activePointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const hostRef = useRef<HTMLElement | null>(null);

  const reset = () => {
    activePointerIdRef.current = null;
    setIsDragging(false);
    setOffsetX(0);
    setOffsetY(0);
  };

  const bind = useMemo(
    () => ({
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        if (!enabled || !event.isPrimary) return;
        if (event.pointerType === "mouse" && (!mouse || event.button !== 0)) {
          return;
        }

        const target = event.target as HTMLElement | null;
        if (ignoreInteractive && target?.closest(INTERACTIVE_SELECTOR)) {
          return;
        }

        activePointerIdRef.current = event.pointerId;
        startXRef.current = event.clientX;
        startYRef.current = event.clientY;
        hostRef.current = event.currentTarget;
        setIsDragging(true);
        event.currentTarget.setPointerCapture?.(event.pointerId);
      },
      onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
        if (activePointerIdRef.current !== event.pointerId) return;

        const deltaX = event.clientX - startXRef.current;
        const deltaY = event.clientY - startYRef.current;

        if (axis === "x") {
          setOffsetX(deltaX * resistance);
        } else {
          setOffsetY(deltaY * resistance);
        }
      },
      onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
        if (activePointerIdRef.current !== event.pointerId) return;

        const deltaX = event.clientX - startXRef.current;
        const deltaY = event.clientY - startYRef.current;
        const horizontalIntent = Math.abs(deltaX) > Math.abs(deltaY) * 1.1;
        const verticalIntent = Math.abs(deltaY) > Math.abs(deltaX) * 1.1;

        if (axis === "x" && horizontalIntent && Math.abs(deltaX) >= minDistance) {
          if (deltaX < 0) {
            onSwipeLeft?.();
          } else {
            onSwipeRight?.();
          }
        }

        if (axis === "y" && verticalIntent && Math.abs(deltaY) >= minDistance) {
          if (deltaY < 0) {
            onSwipeUp?.();
          } else {
            onSwipeDown?.();
          }
        }

        hostRef.current?.releasePointerCapture?.(event.pointerId);
        reset();
      },
      onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => {
        if (activePointerIdRef.current !== event.pointerId) return;
        hostRef.current?.releasePointerCapture?.(event.pointerId);
        reset();
      },
      onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => {
        if (activePointerIdRef.current !== event.pointerId) return;
        if (event.pointerType !== "mouse") return;
        hostRef.current?.releasePointerCapture?.(event.pointerId);
        reset();
      },
    }),
    [
      axis,
      enabled,
      ignoreInteractive,
      minDistance,
      mouse,
      onSwipeDown,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      resistance,
    ]
  );

  return {
    bind,
    isDragging,
    offsetX,
    offsetY,
    touchAction: axis === "x" ? "pan-y" : "pan-x",
    reset,
  };
}
