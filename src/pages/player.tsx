import React, { useEffect, useRef } from "react";
import Layout from "@theme/Layout";
import "asciinema-player/dist/bundle/asciinema-player.css";

function useQuery() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export default function Player() {
  const query = useQuery();
  const src = query.get("src") || "";
  const speed = parseFloat(query.get("speed") || "2");
  const title = query.get("title") || "Recording";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!src || !ref.current) return;
    let player: { dispose: () => void } | undefined;
    import("asciinema-player").then((mod) => {
      if (ref.current) {
        player = mod.create(src, ref.current, {
          cols: 120,
          rows: 40,
          autoPlay: true,
          speed,
          theme: "monokai",
          fit: "width",
        });
      }
    });
    return () => {
      if (player) player.dispose();
    };
  }, [src, speed]);

  if (!src) {
    return (
      <Layout title="Player" description="Terminal recording player">
        <main style={{ padding: "2rem", textAlign: "center" }}>
          <h1>No recording specified</h1>
          <p>Use <code>?src=/recordings/example.cast</code> to load a recording.</p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout title={title} description={`Terminal recording: ${title}`}>
      <main style={{ padding: "1rem 2rem" }}>
        <h1>{title}</h1>
        <div ref={ref} />
      </main>
    </Layout>
  );
}
