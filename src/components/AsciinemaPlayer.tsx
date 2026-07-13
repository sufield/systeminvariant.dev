import React, { useEffect, useRef } from "react";
import "asciinema-player/dist/bundle/asciinema-player.css";

interface Props {
  src: string;
  speed?: number;
  autoPlay?: boolean;
}

export default function AsciinemaPlayer({ src, speed = 2, autoPlay = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: { dispose: () => void } | undefined;
    import("asciinema-player").then((mod) => {
      if (ref.current) {
        player = mod.create(src, ref.current, {
          cols: 120,
          rows: 40,
          autoPlay,
          speed,
          theme: "monokai",
        });
      }
    });

    return () => {
      if (player) {
        player.dispose();
      }
    };
  }, [src, speed, autoPlay]);

  return <div ref={ref} />;
}
