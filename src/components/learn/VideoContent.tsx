"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

interface VideoContentProps {
  title: string;
  videoUrl?: string;
  videoId?: string;
  thumbnail?: string;
  trigger: React.ReactNode;
}

export function VideoContent({
  title,
  videoUrl,
  videoId,
  thumbnail,
  trigger,
}: VideoContentProps) {
  const [open, setOpen] = useState(false);

  const getEmbedUrl = (url: string | undefined): string => {
    if (!url) return "";
    const videoIdMatch = url.match(
      /(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]+)/
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : "";
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : "";
  };

  const src = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
    : getEmbedUrl(videoUrl);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          {src ? (
            <iframe
              width="100%"
              height="100%"
              src={src}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <p className="text-gray-500">No video available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
