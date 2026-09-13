'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

const videos = [
  { uid: 'ababd9e4d3c85847d26dac6dfea61521', title: 'Joe Rogan', detail: 'On universal basic income' },
  { uid: '839f08c7bcf3cd590099ee3b5fa3a273', title: 'Universal Basic Income', detail: 'A recorded voice' },
  { uid: '4734c803aa1672223425c7dd8e7ae762', title: 'Elon Musk', detail: 'Saying it out loud' },
  { uid: '858909ed77c0dfe549eae7db227b2a2a', title: 'Elon Musk', detail: 'Some kind of universal basic income' },
  { uid: '1408509d43820cf3770a24461f019d00', title: 'Sam Altman', detail: 'On basic income' },
  { uid: '0318800d72c4da87d693348027e99367', title: 'Universal Basic Income', detail: 'Now coming to Canada' },
] as const;

function streamThumbnail(uid: string) {
  return `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=1s&height=800`;
}

export function VoicesGallery() {
  const [loaded, setLoaded] = useState<number | null>(null);

  function play(index: number) {
    setLoaded(index);
    trackEvent('voice_video_played', { person: videos[index].title, stream_uid: videos[index].uid });
  }

  return <section className="voices-gallery" aria-labelledby="voices-title">
    <div className="voices-heading"><span>04 / THE VOICES</span><h2 id="voices-title">They said it <em>out loud.</em></h2><p>Same idea. Their voices. Click a frame.</p></div>
    <div className="voices-grid">
      {videos.map((item, index) => <article className="voice-exhibit" key={item.uid}>
        <div className="voice-frame">
          {loaded === index ? <iframe title={`${item.title}: ${item.detail}`} src={`https://iframe.videodelivery.net/${item.uid}?autoplay=true`} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowFullScreen /> : <button type="button" className="voice-launch" aria-label={`Play ${item.title}: ${item.detail}`} onClick={() => play(index)}><img className="voice-thumbnail" src={streamThumbnail(item.uid)} alt="" loading={index < 3 ? 'eager' : 'lazy'} decoding="async" /><span className="voice-thumbnail-shade" aria-hidden="true"><small>PLAY THE CLIP</small></span><span className="voice-play" aria-hidden="true" /></button>}
        </div>
        <div className="voice-plaque"><span>{String(index + 1).padStart(2, '0')} / 06</span><h3>{item.title}</h3><p>{item.detail}</p></div>
      </article>)}
    </div>
  </section>;
}
