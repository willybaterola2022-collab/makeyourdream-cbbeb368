import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Heart, MessageCircle, Share2, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Story {
  id: string;
  user: string;
  initials: string;
  duration: string;
  likes: number;
  comments: number;
  hashtag: string;
  liked: boolean;
}

const STORIES: Story[] = [
  { id: "1", user: "Luna Vox", initials: "LV", duration: "18s", likes: 234, comments: 12, hashtag: "#RetoAgudos", liked: false },
  { id: "2", user: "Echo Rivera", initials: "ER", duration: "25s", likes: 189, comments: 8, hashtag: "#CoverDelDía", liked: true },
  { id: "3", user: "Aria Storm", initials: "AS", duration: "15s", likes: 412, comments: 23, hashtag: "#FreestyleFriday", liked: false },
  { id: "4", user: "Nova Beat", initials: "NB", duration: "30s", likes: 156, comments: 5, hashtag: "#VozDelDía", liked: false },
];

export default function VocalStories() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stories, setStories] = useState(STORIES);
  const story = stories[currentIdx];

  const toggleLike = () => {
    setStories((prev) =>
      prev.map((s, i) =>
        i === currentIdx ? { ...s, liked: !s.liked, likes: s.liked ? s.likes - 1 : s.likes + 1 } : s
      )
    );
  };

  const next = () => setCurrentIdx((i) => Math.min(i + 1, stories.length - 1));
  const prev = () => setCurrentIdx((i) => Math.max(i - 1, 0));

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Vocal Stories</h1>
        <p className="text-muted-foreground mt-1">Clips de voz de 15-30 segundos. Escucha, reacciona, canta.</p>
      </div>

      {/* Story Card (vertical feed) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
        >
          <Card className="bg-card border-border/40 overflow-hidden">
            {/* Audio Visualizer Area */}
            <div className="h-64 bg-gradient-to-b from-primary/10 to-card flex flex-col items-center justify-center relative">
              {/* Progress dots */}
              <div className="absolute top-3 left-3 right-3 flex gap-1">
                {stories.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i === currentIdx ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>

              <div className="flex items-end gap-[2px] h-20 w-48">
                {Array.from({ length: 32 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm bg-primary"
                    animate={{ height: `${15 + Math.random() * 85}%`, opacity: 0.6 }}
                    transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
                  />
                ))}
              </div>

              <Badge className="mt-4 bg-primary/20 text-primary border-primary/30">{story.hashtag}</Badge>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{story.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{story.user}</p>
                  <p className="text-xs text-muted-foreground">{story.duration}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={toggleLike} className={story.liked ? "text-red-500" : ""}>
                  <Heart className={`h-5 w-5 mr-1 ${story.liked ? "fill-red-500" : ""}`} />
                  {story.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-5 w-5 mr-1" />
                  {story.comments}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={prev} disabled={currentIdx === 0}>
          <ChevronUp className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <Button className="gold-gradient text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Grabar story
        </Button>
        <Button variant="outline" onClick={next} disabled={currentIdx === stories.length - 1}>
          Siguiente <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
