import React from 'react'

export default function ProductCardSkeleton() {
  return (
    <div className="card flex flex-col overflow-hidden" aria-hidden="true">
      {/* Image placeholder */}
      <div className="skeleton" style={{ aspectRatio: '1/1', width: '100%' }} />
      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div className="skeleton h-4 rounded w-3/4" />
          <div className="skeleton h-4 rounded w-8" />
        </div>
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-4/5" />
        <div className="skeleton h-8 rounded w-full mt-1" />
      </div>
    </div>
  )
}
