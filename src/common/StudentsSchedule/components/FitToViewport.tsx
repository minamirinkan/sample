// src/components/FitToViewport.tsx
import React, { useLayoutEffect, useRef, useState } from "react";

type Props = {
  /** ビューポートの四辺に確保する余白(px) */
  padding?: number;
  /** 等倍以上に拡大してよいか（既定: false = 拡大しない） */
  allowUpscale?: boolean;
  /** 子要素（自然サイズでレイアウトされたコンテンツ） */
  children: React.ReactNode;
};

/**
 * 子要素の「自然サイズ」を基準に、ウィンドウ内に自動スケールで収めるラッパー。
 * - ResizeObserver + rAF で安全に再計算
 * - transform-origin: top left でぼやけを最小化
 */
export default function FitToViewport({
  padding = 12,
  allowUpscale = false,
  children,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const computeNow = () => {
      // 子の“自然サイズ”（transform の影響を受けない）
      const naturalW = el.scrollWidth || 1; // divide by zero 回避
      const naturalH = el.scrollHeight || 1;

      // 利用可能領域
      const availW = Math.max(1, window.innerWidth - padding * 2);
      const availH = Math.max(1, window.innerHeight - padding * 2);

      let s = Math.min(availW / naturalW, availH / naturalH);
      if (!allowUpscale) s = Math.min(s, 1); // 拡大しない
      if (!Number.isFinite(s) || s <= 0) s = 1;

      setScale(s);
    };

    // ResizeObserver のコールバック内で直接 setState しない（rAF に投げる）
    const scheduleCompute = () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        computeNow();
      });
    };

    // 初回計算（フォントレイアウトの揺れ対策で二度実行）
    scheduleCompute();
    // 微遅延でもう一度（画像/フォント遅延でサイズが変わる場合がある）
    const t = setTimeout(scheduleCompute, 0);

    // 子要素のサイズ変化を監視
    const ro = new ResizeObserver(scheduleCompute);
    ro.observe(el);

    // ウィンドウリサイズ/向き変更でも再計算
    window.addEventListener("resize", scheduleCompute);
    window.addEventListener("orientationchange", scheduleCompute);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", scheduleCompute);
      window.removeEventListener("orientationchange", scheduleCompute);
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [padding, allowUpscale]);

  return (
    <div
      className="w-screen h-screen overflow-auto flex items-start justify-center"
      style={{ padding }}
    >
      <div
        ref={contentRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* 自然サイズを安定させるため inline-block 推奨 */}
        <div className="inline-block">{children}</div>
      </div>
    </div>
  );
}
