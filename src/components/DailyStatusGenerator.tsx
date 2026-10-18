import React, { useState } from 'react';
import { Copy, Check, Sparkles, Send, RotateCcw } from 'lucide-react';
import { playClickTone } from '../utils/audio';

export const DailyStatusGenerator: React.FC = () => {
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }));
  const [time, setTime] = useState('9:30 PM');
  const [venueCheck, setVenueCheck] = useState('Lighting OK / Smoke low / Overlays updated');
  const [adsMeta, setAdsMeta] = useState('3.2k');
  const [adsCtr, setAdsCtr] = useState('2.1%');
  const [adsGoogle, setAdsGoogle] = useState('1.1k');
  const [contentReels, setContentReels] = useState('2');
  const [contentStories, setContentStories] = useState('5');
  const [contentPosts, setContentPosts] = useState('1');
  const [inboxTotal, setInboxTotal] = useState('12');
  const [inboxCleared, setInboxCleared] = useState('12');
  const [teamTasks, setTeamTasks] = useState('Rahul - color grade, Priya - shot list');
  const [goldenHour, setGoldenHour] = useState('Done — Rooftop 6:15 PM');
  const [issues, setIssues] = useState('None / DJ lighting sync tested');
  const [priority1, setPriority1] = useState('Next week creatives final');
  const [priority2, setPriority2] = useState('Weekend shoot rentals confirm');
  const [priority3, setPriority3] = useState('Ad content double-check');
  const [packWrap, setPackWrap] = useState('Done 12:20 AM');
  const [copied, setCopied] = useState(false);

  const formattedStatusText = `NIGHT CLUB & DINING — DAILY STATUS
Date: [${date}]
Time: [${time}]
━━━━━━━━━━━━━━━━━━━━━━
Venue Check: [${venueCheck}]
Ads Running: [Meta ${adsMeta} / CTR ${adsCtr} / Google ${adsGoogle}]
Content Posted: [${contentReels} Reels, ${contentStories} Stories, ${contentPosts} Posts]
Priority Inbox: [${inboxTotal} DMs — ${inboxCleared} cleared]
Team Tasks: [${teamTasks}]
Golden Hour: [${goldenHour}]
Issues: [${issues}]
━━━━━━━━━━━━━━━━━━━━━━
Tomorrow Priority:
1. ${priority1}
2. ${priority2}
3. ${priority3}
Pack & Wrap: [${packWrap}]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedStatusText).then(() => {
      setCopied(true);
      playClickTone();
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div className="rounded-2xl border border-[var(--border-neon)] bg-[linear-gradient(180deg,rgba(168,85,247,0.06),rgba(18,18,26,0))] p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-[2px] bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)]" />
            <span className="font-mono text-xs text-[#c4b5fd] tracking-widest uppercase">
              Manager Sync · Required Nightly Ritual
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Status Update Format — For Manager Updates
          </h2>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-1 max-w-xl">
            Dispatch daily at 9:30 PM Live Status Update slot + Night Wrap. Keep it sharp and concise for owners & GM.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-lg ${
            copied
              ? 'bg-emerald-400 text-black border border-emerald-400'
              : 'bg-white text-black hover:bg-slate-100 border border-white'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied to Clipboard' : 'Copy Status for WhatsApp / Slack'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Input Controls */}
        <div className="lg:col-span-6 space-y-4 bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-dim)] mb-2">
            Live Metrics & Shift Log
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">
                Date (DD/MM)
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono focus:border-[var(--accent-purple)] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">
                Dispatch Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono focus:border-[var(--accent-purple)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">
              Venue Checks (Lighting / Smoke / Overlays)
            </label>
            <input
              type="text"
              value={venueCheck}
              onChange={(e) => setVenueCheck(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono focus:border-[var(--accent-purple)] outline-none"
            />
          </div>

          {/* Ad Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] mb-1">
                Meta Spend
              </label>
              <input
                type="text"
                value={adsMeta}
                onChange={(e) => setAdsMeta(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] mb-1">
                CTR
              </label>
              <input
                type="text"
                value={adsCtr}
                onChange={(e) => setAdsCtr(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] mb-1">
                Google Spend
              </label>
              <input
                type="text"
                value={adsGoogle}
                onChange={(e) => setAdsGoogle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Content Posted */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] mb-1">
                Reels
              </label>
              <input
                type="text"
                value={contentReels}
                onChange={(e) => setContentReels(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] mb-1">
                Stories
              </label>
              <input
                type="text"
                value={contentStories}
                onChange={(e) => setContentStories(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] mb-1">
                Posts
              </label>
              <input
                type="text"
                value={contentPosts}
                onChange={(e) => setContentPosts(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">
              Team Tasks Assigned
            </label>
            <input
              type="text"
              value={teamTasks}
              onChange={(e) => setTeamTasks(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] mb-1">
                Golden Hour Shoot
              </label>
              <input
                type="text"
                value={goldenHour}
                onChange={(e) => setGoldenHour(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[var(--text-muted)] mb-1">
                Issues / Blockers
              </label>
              <input
                type="text"
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1">
              Tomorrow Priorities (Top 3)
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={priority1}
                onChange={(e) => setPriority1(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
                placeholder="Priority 1"
              />
              <input
                type="text"
                value={priority2}
                onChange={(e) => setPriority2(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
                placeholder="Priority 2"
              />
              <input
                type="text"
                value={priority3}
                onChange={(e) => setPriority3(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white font-mono"
                placeholder="Priority 3"
              />
            </div>
          </div>
        </div>

        {/* Formatted Output Preview */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex-1 rounded-2xl bg-black/60 border border-white/10 p-5 backdrop-blur flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-[#a78bfa] tracking-widest uppercase">
                <span>Output Format · Auto-generated</span>
                <span>Copy ready</span>
              </div>
              <pre className="font-mono text-xs text-[#e9d5ff] whitespace-pre-wrap break-words leading-relaxed select-all">
                {formattedStatusText}
              </pre>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[var(--text-dim)]">
                Formatted for instant messaging apps
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-white hover:text-white/80 underline font-mono flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
