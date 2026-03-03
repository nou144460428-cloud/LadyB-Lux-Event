import type { ReactNode } from 'react';

type DashboardSkeletonProps = {
  rows?: number;
};

export function DashboardSkeleton({ rows = 3 }: DashboardSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-[#302515] bg-[#151008] p-5"
        >
          <div className="h-4 w-32 rounded bg-[#2c2215]" />
          <div className="mt-3 h-3 w-48 rounded bg-[#241b10]" />
          <div className="mt-5 h-9 w-full rounded bg-[#1f170d]" />
        </div>
      ))}
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] py-12 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#6d5430] bg-[#1c140b] text-[#d6b57c]">
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 7h16M6 7l1 11h10l1-11M9 7V5a3 3 0 0 1 6 0v2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-base font-semibold text-[#f4eadf]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#cdbca3]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
