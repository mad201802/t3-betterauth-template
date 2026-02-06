import React from "react";
import {
  IconHammer,
  IconSparkles,
  IconTool,
  IconWreckingBall,
} from "@tabler/icons-react";

interface PageUnderConstructionProps {
  name?: string;
}

export default function PageUnderConstruction({
  name = "This page",
}: PageUnderConstructionProps) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Animated Icons */}
        <div className="relative mb-8 flex items-center justify-center gap-8">
          {/* Left Tool - Floating Animation */}
          <div className="animate-pulse opacity-70">
            <IconTool className="h-16 w-16 text-muted-foreground" stroke={1.5} />
          </div>

          {/* Center Hammer - Bounce Animation */}
          <div className="animate-bounce">
            <IconHammer className="h-24 w-24 text-primary" stroke={1.5} />
          </div>

          {/* Right Wrecking Ball - Float Animation */}
          <div className="animate-pulse opacity-70 delay-150">
            <IconWreckingBall className="h-16 w-16 text-muted-foreground" stroke={1.5} />
          </div>

          {/* Sparkles - Pulse Animation */}
          <div className="absolute -right-4 -top-4 animate-pulse">
            <IconSparkles className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="absolute -left-4 -bottom-4 animate-ping">
            <IconSparkles className="h-6 w-6 text-yellow-500 opacity-75" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {name} is Under Construction
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8 text-lg sm:text-xl">
          We&apos;re working hard to bring you something amazing. This page is
          currently being built and will be available soon.
        </p>
      </div>
    </div>
  );
}
