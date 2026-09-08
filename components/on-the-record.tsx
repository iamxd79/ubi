import { ArrowUpRight, Heart, MessageCircle, Repeat2 } from 'lucide-react';

const posts = [
  { name: 'Elon Musk', handle: '@elonmusk', date: 'Jul 24, 2020', avatar: '/socials/elon-musk.jpg', quote: <>As a reminder, I’m in <em>favor</em> of universal basic income</>, stats: [['Replies', '3.4K'], ['Reposts', '3.8K'], ['Likes', '48.7K']], url: 'https://x.com/elonmusk/status/1286675223434141697' },
  { name: 'Elon Musk', handle: '@elonmusk', date: 'Apr 17, 2026', avatar: '/socials/elon-musk.jpg', quote: <>Universal HIGH INCOME via checks issued by the Federal government is the best way to deal with unemployment caused by AI.</>, stats: [['Replies', '45.2K'], ['Reposts', '20.6K'], ['Likes', '189.7K']], url: 'https://x.com/elonmusk/status/2044990537145753894' },
  { name: 'Sam Altman', handle: '@sama', date: 'May 31, 2016', avatar: '/socials/sam-altman.jpg', quote: <>Basic income is not socialism. Basic income provides a floor, and then people can get as rich as they want.</>, stats: [['Replies', '46'], ['Reposts', '272'], ['Likes', '509']], url: 'https://x.com/sama/status/737688607964549121' },
  { name: 'Andrew Yang', handle: '@AndrewYang', date: 'Oct 23, 2025', avatar: '/socials/andrew-yang.jpg', quote: <>All paths lead to Universal Basic Income.</>, stats: [['Replies', '866'], ['Reposts', '329'], ['Likes', '3.8K']], url: 'https://x.com/AndrewYang/status/1981154672347140253' },
] as const;
const statIcons = [MessageCircle, Repeat2, Heart];

export function OnTheRecord() {
  return <section id="record" className="on-record" aria-labelledby="record-title">
    <div className="record-heading">
      <span className="record-kicker">03 / THE PUBLIC RECORD</span>
      <h2 id="record-title">On the <em>record.</em></h2>
      <p>People have been saying the quiet part for years. The distribution just moved onchain.</p>
    </div>
    <div className="record-grid">
      {posts.map((post) => <a className="record-card" key={post.url} href={post.url} target="_blank" rel="noopener" aria-label={`Open ${post.name} post from ${post.date} in a new tab`}>
        <div className="record-card-top"><img className="record-avatar" src={post.avatar} alt="" width={70} height={70}/><span><strong>{post.name}</strong><small>{post.handle}</small></span><ArrowUpRight size={17} aria-hidden="true"/></div>
        <blockquote>{post.quote}</blockquote>
        <div className="record-stats" aria-label={`Post engagement: ${post.stats.map(([label,value])=>`${value} ${label.toLowerCase()}`).join(', ')}`}>{post.stats.map(([label,value],index)=>{const Icon=statIcons[index];return <span key={label}><Icon size={14} aria-hidden="true"/><b>{value}</b><em>{label}</em></span>})}</div>
        <time>{post.date}</time>
      </a>)}
    </div>
  </section>;
}
