"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl bg-[#242424] animate-pulse", className)} />
  );
}

export function QuoteCardSkeleton() {
  return (
    <div className="bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-1 w-8" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </div>
  );
}

export function LessonCardSkeleton() {
  return (
    <div className="bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-7 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-44 w-full rounded-2xl mb-3" />
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-[#1A1A1A] rounded-2xl p-5 space-y-3"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
          <div
            className="flex justify-between pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex gap-3">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LessonDetailSkeleton() {
  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-1 w-10" />
        <Skeleton className="h-5 w-full" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
