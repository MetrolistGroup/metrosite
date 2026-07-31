interface Section {
  header: string;
  level: number;
  content: string;
}

function renderInline(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/(?<!href=")(https?:\/\/[^\s<]+)/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\(?@([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\)?/gi, (_match, username) => {
      return `<a href="https://github.com/${username}" class="mention" target="_blank" style="--avatar: url(https://avatars.githubusercontent.com/${username}?s=36)">@${username}</a>`;
    });
}

function renderListItems(content: string): string {
  let html = content.replace(/^[-*] (.*$)/gim, (_match, item) => `<li>${renderInline(item)}</li>`);
  html = html.replace(/(?:<li>.*<\/li>\s*)+/gms, (match) => `<ul>${match.replace(/\n/g, '')}</ul>`);
  return html;
}

function parseSections(body: string): Section[] {
  const lines = body.split(/\r?\n/);
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const headerMatch = line.match(/^(#{1,2})\s+(.+)/);
    if (headerMatch) {
      if (current) sections.push(current);
      current = {
        header: headerMatch[2].trim(),
        level: headerMatch[1].length,
        content: ''
      };
    } else if (current) {
      current.content += line + '\n';
    }
  }
  if (current) sections.push(current);
  return sections;
}

function renderMaintenanceBanner(content: string): string {
  const text = content.replace(/\n{2,}/g, '<br><br>').trim();
  if (!text) return '';
  return `<div class="changelog-banner">
    <span class="material-symbols-rounded">warning</span>
    <div class="changelog-banner-text">${renderInline(text)}</div>
  </div>`;
}

function renderStandardSection(header: string, content: string): string {
  const listHtml = renderListItems(content.trim());
  if (!listHtml) return '';
  return `<div class="changelog-section">
    <h3 class="changelog-section-title">${header}</h3>
    ${listHtml}
  </div>`;
}

function renderContributors(content: string): string {
  const lines = content.trim().split('\n').filter((l) => l.trim());
  const contributors: { username: string; url: string }[] = [];

  for (const line of lines) {
    const userMatch = line.match(/@([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})/i);
    const urlMatch = line.match(/https?:\/\/[^\s]+/);
    if (userMatch) {
      contributors.push({
        username: userMatch[1],
        url: urlMatch?.[0] || `https://github.com/${userMatch[1]}`
      });
    }
  }

  if (!contributors.length) {
    return renderStandardSection('New Contributors', content);
  }

  return `<div class="changelog-section">
    <h3 class="changelog-section-title">New Contributors</h3>
    <div class="contributors-row">
      ${contributors
        .map(
          (c) => `
        <a href="${c.url}" class="contributor-chip" target="_blank" rel="noopener noreferrer" style="--avatar: url(https://avatars.githubusercontent.com/${c.username}?s=36)">
          <span class="contributor-avatar"></span>
          <span>@${c.username}</span>
        </a>`
        )
        .join('')}
    </div>
  </div>`;
}

export function renderChangelog(body: string): string {
  if (!body) return '';
  const sections = parseSections(body);
  let html = '';

  for (const section of sections) {
    const header = section.header;
    if (header === 'MAINTENANCE MODE') {
      html += renderMaintenanceBanner(section.content);
    } else if (header === 'New Contributors') {
      html += renderContributors(section.content);
    } else {
      html += renderStandardSection(header, section.content);
    }
  }

  return html || renderInline(body);
}
