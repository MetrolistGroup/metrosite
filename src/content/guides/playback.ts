import type { Guide } from '../guides'
import { PAGE_META } from '../site'

export const PLAYBACK_GUIDES: readonly Guide[] = [
  {
    slug: 'metrolist-listen-together',
    heading: 'Listen to YouTube Music with friends in Metrolist',
    meta: {
      title: 'Metrolist Listen Together · Shared YouTube Music playback',
      description: 'How to start a Listen Together room, invite friends, join with a room code, and fix links or playback that falls out of sync.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Listen Together lets you and your friends hear the same track at the exact same moment. One person starts a room, sends an invite link or code, and everyone listens in sync without copying libraries between devices.',
    sections: [
      {
        id: 'create-a-room',
        heading: 'Start a room',
        paragraphs: [
          'Open Listen Together in Metrolist, tap Create Room, and send the invite link or room code to your friends.',
          'Share the link only with people you want in the session, and check room settings to decide what guests can control. Guests can suggest songs for the shared queue. If your playback buttons are greyed out as a guest, it’s just the host’s room permissions, not a bug.',
        ],
        links: [{ label: 'Listen Together feature overview', href: 'https://metrolist.cc/#features' }],
      },
      {
        id: 'join-with-a-code',
        heading: 'Join by link or room code',
        paragraphs: [
          'Tap the invite link on a device that has Metrolist installed. If it opens in your browser instead of the app, copy the room code, open Listen Together in Metrolist, tap Join Room, and paste it in.',
          'On Android, automatic link opening depends on whether Metrolist is set to open supported links in system settings; on iOS, sideloading can affect deep links too. Pasting the code manually always works as a fallback.',
        ],
        links: [{ label: 'Listen Together invite and manual join page', href: 'https://metrolist.cc/listen' }],
      },
      {
        id: 'playback-and-connection',
        heading: 'Everyone needs their own connection',
        paragraphs: [
          'Listen Together syncs what’s playing and the timestamp, not the audio stream itself. Each person’s app loads the song from YouTube Music directly, so everyone needs a working internet connection.',
          'If a track fails for one friend, check their connection or whether the song is blocked in their region. Give them a second to recover before spamming play/pause on the host device.',
        ],
        links: [{ label: 'Metrolist playback FAQ', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'room-troubleshooting',
        heading: 'When a room won’t connect',
        paragraphs: [
          'If a room code isn’t accepted, ask the host for a fresh invite and make sure you’re on compatible versions of Metrolist. If you get disconnected, check your Wi-Fi or mobile data before messing with your library or reinstalling the app.',
          'A sync server coordinates the room while you’re in it, while your local library stays on your device. Check the privacy policy for details, and leave the room whenever you want to go back to listening solo.',
        ],
        links: [
          { label: 'Listen Together join page', href: 'https://metrolist.cc/listen' },
          { label: 'Metrolist privacy policy', href: 'https://metrolist.cc/privacy' },
        ],
      },
    ],
  },
  {
    slug: 'metrolist-synced-lyrics',
    heading: 'Synced lyrics and translation in Metrolist',
    meta: {
      title: 'YouTube Music lyrics in Metrolist · Sync and translation',
      description: 'How word-by-word lyrics, translations, and romanization work in Metrolist, plus how to switch sources or nudge timing when lyrics don’t line up.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Metrolist highlights lyrics line by line, or word by word when a source includes word timestamps. You can also turn on translations to understand another language, or romanization to read how lyrics sound in Latin letters.',
    sections: [
      {
        id: 'lyric-timing',
        heading: 'Plain, line-synced, and word-synced lyrics',
        paragraphs: [
          'Plain lyrics are just text, line-synced lyrics jump line by line, and word-synced lyrics highlight each word as it’s sung. Which one you get depends on what the lyric source provides for that song.',
          'If the timing feels off, open the lyrics menu and try another source. A different provider often has word timing or a cleaner match for that exact track.',
        ],
        links: [{ label: 'Metrolist synced lyrics overview', href: 'https://metrolist.cc/#features' }],
      },
      {
        id: 'translation',
        heading: 'Translations and providers',
        paragraphs: [
          'Head to Settings > Lyrics to pick your target language and translation provider. Translations are great for catching the meaning of a song, though slang and wordplay don’t always carry over cleanly, so keeping the original lines visible helps.',
          'If you plug in an external AI provider, check its API key, pricing, and privacy policy first: those providers send the lyric text to their servers rather than running locally on your device.',
        ],
        links: [{ label: 'Metrolist privacy policy', href: 'https://metrolist.cc/privacy' }],
      },
      {
        id: 'romanization',
        heading: 'Romanization for reading pronunciation',
        paragraphs: [
          'Romanization writes out how non-Latin scripts sound using Latin letters. It’s handy for singing along to Japanese, Korean, or Russian tracks, though it shows pronunciation rather than meaning.',
          'You can toggle it in Settings > Lyrics or straight from the lyrics menu. Results vary by language and method, and word-level highlighting still follows the original timed words when available.',
        ],
        links: [{ label: 'Metrolist lyrics features', href: 'https://metrolist.cc/#features' }],
      },
      {
        id: 'fix-a-mismatch',
        heading: 'Fixing lyrics that are out of sync',
        paragraphs: [
          'Live recordings, remixes, and music videos often have longer intros or different arrangements than the studio track. If the words don’t match the song at all, switch lyric sources or edit the title and artist used for the search.',
          'If the words are right but show up a little early or late, nudge the lyrics offset in the lyrics menu. Just note that an offset shifts the whole song evenly. If the song’s structure is completely different, picking another lyric source is the better fix.',
        ],
        links: [{ label: 'Metrolist playback features', href: 'https://metrolist.cc/#features' }],
      },
    ],
  },
]
