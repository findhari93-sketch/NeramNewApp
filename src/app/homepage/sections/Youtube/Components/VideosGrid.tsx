"use client";
import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY as string | undefined;
const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID as
  | string
  | undefined;

export default function VideosGrid() {
  const [videos, setVideos] = useState<any[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelUrl = useMemo(
    () =>
      CHANNEL_ID
        ? `https://www.youtube.com/channel/${CHANNEL_ID}`
        : "https://www.youtube.com/",
    []
  );

  useEffect(() => {
    if (!API_KEY || !CHANNEL_ID) return;
    const fetchSubs = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&id=${CHANNEL_ID}&part=statistics`
        );
        if (!res.ok) {
          const msg = `YouTube channels API error: ${res.status}`;
          console.error(msg);
          setError("Unable to load YouTube stats. Please try again later.");
          return;
        }
        const data = await res.json();
        const count = data?.items?.[0]?.statistics?.subscriberCount;
        if (count) setSubscriberCount(count);
      } catch (e) {
        console.error("Error fetching subscriber count", e);
        setError("Unable to load YouTube stats. Please try again later.");
      }
    };
    fetchSubs();
  }, []);

  useEffect(() => {
    if (!API_KEY || !CHANNEL_ID) return;
    const fetchVideos = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=15&type=video&videoDuration=medium`
        );
        if (!res.ok) {
          const msg = `YouTube search API error: ${res.status}`;
          console.error(msg);
          setError("Unable to load videos now. Please try again later.");
          return;
        }
        const data = await res.json();
        setVideos((data?.items ?? []).filter((v: any) => v?.id?.videoId));
      } catch (e) {
        console.error("Error fetching videos", e);
        setError("Unable to load videos now. Please try again later.");
      }
    };
    fetchVideos();
  }, []);

  const playVideo = (id: string) => {
    setSelectedVideoId(id);
    setOpen(true);
  };

  const closeVideo = () => {
    setSelectedVideoId(null);
    setOpen(false);
  };

  return (
    <Box>
      {(!API_KEY || !CHANNEL_ID) && (
        <Box sx={{ px: 2, my: 3 }}>
          <Typography color="text.secondary">
            Set NEXT_PUBLIC_YOUTUBE_API_KEY and NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
            in .env.local and restart the dev server to see latest videos here.
          </Typography>
        </Box>
      )}
      {subscriberCount && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            my: 3,
          }}
        >
          <Typography>
            <b>{Number(subscriberCount).toLocaleString()}</b> Subscribers
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.open(channelUrl, "_blank")}
          >
            Subscribe for Exam Updates
          </Button>
        </Box>
      )}
      {error && (
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography color="error.main">{error}</Typography>
        </Box>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1, sm: 2 },
        }}
      >
        {videos.map((video) => (
          <VideoCard
            key={video.id.videoId}
            thumbUrl={
              video.snippet?.thumbnails?.high?.url ||
              video.snippet?.thumbnails?.medium?.url ||
              video.snippet?.thumbnails?.default?.url ||
              ""
            }
            title={video.snippet.title}
            onClick={() => playVideo(video.id.videoId)}
          />
        ))}
      </Box>
      <VideoModal open={open} onClose={closeVideo}>
        {selectedVideoId && (
          <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
            <Box
              component="iframe"
              title="YouTube Video"
              src={`https://www.youtube.com/embed/${selectedVideoId}?rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </Box>
        )}
      </VideoModal>
    </Box>
  );
}
