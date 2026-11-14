import type { Guide } from '../guides'
import { PAGE_META } from '../site'

export const PLAYBACK_GUIDES: readonly Guide[] = [
  {
    slug: 'metrolist-listen-together',
    heading: 'Listen to YouTube Music with friends in Metrolist',
    meta: {
      title: 'Metrolist Listen Together · Shared YouTube Music playback',
      description: 'Create a Listen Together room, invite friends, join with a code, and troubleshoot links or playback that falls out of sync in Metrolist.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Listen Together lets a group share synchronized playback in Metrolist. One person creates a room and sends an invitation. Everyone joins through the app with an internet connection. A room shares a listening session, rather than copying a music library between devices.',
    sections: [
      {
        id: 'create-a-room',
        heading: 'Create the room in Metrolist',
        paragraphs: [
          'Open Listen Together in the app and choose Create Room. Follow the prompts, then share the invitation or room code with your friends.',
          'Treat the link as an invitation. Share it with the people you intend to listen with, and check the room settings for guest controls. A guest can suggest songs to the shared queue. If playback controls are locked while you are a guest, check the room permissions before treating that as a player fault.',
        ],
        links: [{ label: 'Metrolist Listen Together overview', href: 'https://metrolist.cc/#features' }],
      },
      {
        id: 'join-with-a-code',
        heading: 'Join through a link or enter the code',
        paragraphs: [
          'Open the invitation on a device with Metrolist installed. If it opens a browser page, copy the room code. In the app, open Listen Together, choose Join Room, and paste or type the code.',
          'An Android app link can depend on whether Metrolist is allowed to open supported links in system settings. On iPhone or iPad, the signing and link setup can also affect whether the app opens. Manual code entry is useful when a browser keeps reopening instead of joining the room.',
        ],
        links: [{ label: 'Metrolist invitation and manual join page', href: 'https://metrolist.cc/listen' }],
      },
      {
        id: 'playback-and-connection',
        heading: 'Keep each device connected',
        paragraphs: [
          'The room coordinates what plays and where playback should be. Each device still needs access to the music. Sharing a room does not send the host device audio to every guest, so a working connection on the host alone is not enough.',
          'If a guest cannot load a track, check that device for a playback or connection error. A song can also be unavailable through its YouTube Music connection. Avoid repeatedly pressing play on the host while another device is still recovering from a failed track load.',
        ],
        links: [{ label: 'Metrolist playback and service information', href: 'https://metrolist.cc/faq' }],
      },
      {
        id: 'room-troubleshooting',
        heading: 'Check the invitation before reinstalling',
        paragraphs: [
          'If the code is rejected, ask the host for a fresh invitation and check that your app versions are compatible. If the room disconnects, check the network on the affected device before changing its library or reinstalling the app.',
          'Listen Together uses a server to coordinate the room. Its online requests are separate from the library stored on your device. Read the privacy policy for information about optional services, and leave the room when you want to return to independent playback.',
        ],
        links: [
          { label: 'Metrolist room invitation help', href: 'https://metrolist.cc/listen' },
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
      description: 'Understand word-by-word lyrics, translation, and romanization in Metrolist. Choose another source or adjust the timing when the words do not match.',
      robots: PAGE_META.home.robots,
    },
    intro: 'Metrolist can show line-synced and word-by-word lyrics when a source provides the timing. Translation helps you read the meaning in another language. Romanization writes pronunciation in Latin letters.',
    sections: [
      {
        id: 'lyric-timing',
        heading: 'Word timing has to come from the lyric data',
        paragraphs: [
          'Plain lyrics contain words without timestamps. Line-synced lyrics time each line, while word-synced lyrics also time individual words. A song with only line timestamps cannot provide the same highlighting as a version with word timing.',
          'Open the lyrics and inspect the available sources in the lyrics menu. A different source may have better timing or a better match for that recording. If no source has timed lyrics, the player has no reliable timestamps to follow.',
        ],
        links: [{ label: 'Metrolist synchronized lyrics overview', href: 'https://metrolist.cc/#features' }],
      },
      {
        id: 'translation',
        heading: 'Choose a translation language and provider',
        paragraphs: [
          'Open Settings > Lyrics to review the translation options. Select the language you want to read and check the chosen provider. A translation can help explain a line, but it can lose slang, wordplay, or context. Keep the original words visible when the distinction matters.',
          'If you choose an external AI provider, review its credentials and billing requirements. A provider can need its own account or key. It may receive lyric text to process the request, so check the service you select rather than assuming every option works locally or has the same privacy policy.',
        ],
        links: [{ label: 'Metrolist third-party service privacy information', href: 'https://metrolist.cc/privacy' }],
      },
      {
        id: 'romanization',
        heading: 'Use romanization to follow pronunciation',
        paragraphs: [
          'Romanization displays how words sound in Latin letters. It can help you follow a song in a script you do not read. It does not replace a translation of what those words mean.',
          'Review Romanization under Settings > Lyrics or the romanization control in the lyrics menu. Languages and results depend on the selected method. When romanized lyrics are the main text, word-level highlighting can still depend on the original timed words.',
        ],
        links: [{ label: 'Metrolist lyrics, translation, and romanization', href: 'https://metrolist.cc/#features' }],
      },
      {
        id: 'fix-a-mismatch',
        heading: 'Check the recording before adjusting the offset',
        paragraphs: [
          'A live version, remix, or music video can have a different introduction or arrangement from the album recording. If the lyrics match another version, try another source or correct the title and artist used for the lyrics search.',
          'If the words are right but appear early or late, adjust the lyrics offset in the lyrics menu. A fixed offset shifts the timing together. It cannot repair timestamps for a recording whose structure is different throughout the song.',
        ],
        links: [{ label: 'Metrolist lyrics and playback tools', href: 'https://metrolist.cc/#features' }],
      },
    ],
  },
]
