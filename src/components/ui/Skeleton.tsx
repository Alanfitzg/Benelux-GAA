"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  animate?: boolean
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-gray-200 rounded-md",
        animate && "animate-pulse",
        className
      )}
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 rounded-xl border bg-white", className)}>
      <div className="flex items-start space-x-3">
        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function MapSkeleton() {
  return (
    <div className="w-full h-full bg-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center"
          >
            <span className="text-2xl">🗺️</span>
          </motion.div>
          <p className="text-gray-500 text-sm">Loading map...</p>
        </div>
      </div>
      
      {/* Fake map markers */}
      <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-primary/30 rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-secondary/30 rounded-full animate-pulse" />
      <div className="absolute top-2/3 right-1/3 w-8 h-8 bg-primary/30 rounded-full animate-pulse" />
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="w-96 bg-white shadow-professional-lg border-r border-gray-200/50 overflow-hidden">
      {/* Header skeleton */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/50">
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
      
      {/* Search and filters skeleton */}
      <div className="p-6 space-y-6 border-b border-gray-200/50">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      
      {/* Results header skeleton */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {/* Cards skeleton */}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-professional p-6 min-w-48">
      <Skeleton className="h-6 w-28 mb-3" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      {/* Table header */}
      <div className="grid gap-4 p-4 border-b border-gray-200" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
      
      {/* Table rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 p-4 border-b border-gray-100" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-lg" />
      </div>
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-5 w-1/2 mb-6" />
        <div className="flex gap-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      
      {/* Content grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-4/6" />
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}