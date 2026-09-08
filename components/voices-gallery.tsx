'use client';

import { useRef, useState } from 'react';

const videos = [
  { file: '(3) Videos by Universal Basic Income (@stonkubi) _ X.mp4', title: 'Universal Basic Income', detail: 'X / UBI' },
  { file: 'another one.mp4', title: 'Universal Basic Income', detail: 'A recorded voice' },
  { file: 'Elon musk saying it.mp4', title: 'Elon Musk', detail: 'Saying it out loud' },
  { file: 'Elon Musk Some kind of universal basic income is.mp4', title: 'Elon Musk', detail: 'Some kind of universal basic income' },
  { file: 'Sam Altman.mp4', title: 'Sam Altman', detail: 'On basic income' },
  { file: 'Universal Basic Income is Now Coming to Canada..mp4', title: 'Universal Basic Income', detail: 'Now coming to Canada' },
] as const;

export function VoicesGallery() {
  const videosRef = useRef<(HTMLVideoElement | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);

  function toggle(index: number) {
    const video = videosRef.current[index];
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(index);
    } else {
      video.pause();
      setPlaying(null);
    }
  }

  return <section className="voices-gallery" aria-labelledby="voices-title">
    <div className="voices-heading"><span>04 / THE VOICES</span><h2 id="voices-title">They said it <em>out loud.</em></h2><p>Same idea. Their voices. Click a frame.</p></div>
    <div className="voices-grid">
      {videos.map((item, index) => <article className="voice-exhibit" key={item.file}>
        <div className="voice-frame" role="button" tabIndex={0} aria-label={`Play or pause ${item.title}: ${item.detail}`} onClick={() => toggle(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(index); } }} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}>
          <video ref={(element) => { videosRef.current[index] = element; }} src={encodeURI(`/images/${item.file}`)} playsInline preload="metadata" muted controls={hovered === index || playing === index} onPlay={() => setPlaying(index)} onPause={() => setPlaying((current) => current === index ? null : current)}/>
          {playing !== index && <span className="voice-play" aria-hidden="true">▶</span>}
        </div>
        <div className="voice-plaque"><span>{String(index + 1).padStart(2, '0')} / 06</span><h3>{item.title}</h3><p>{item.detail}</p></div>
      </article>)}
    </div>
  </section>;
}
