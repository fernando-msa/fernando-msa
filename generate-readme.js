import https from 'node:https';
import fs from 'node:fs';

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const USERNAME = 'fernando-msa';

// Repos to always pin at the top, in this order (slug = repo name)
const PINNED = [
  'secpolicy-hama',
  'auxilia-app',
  'mob-app',
  'HelpDesk-SergipeTec',
  'prime-pet',
  'Tradutor-MSA-Extensao',
];

// Repos to skip entirely (forks, meta repos, etc.)
const SKIP = [USERNAME, 'fernando-msa']; // skip the profile repo itself

// Manual overrides: add/correct description or live URL for specific repos
const OVERRIDES = {
  'secpolicy-hama': {
    description:
      'Information security policy checklist for HAMA, aligned with ISO/IEC 27001. Features PDF export and localStorage persistence.',
    homepage: 'https://secpolicy-hama.vercel.app',
  },
  'auxilia-app': {
    description:
      'Progressive Web App for Movimento Auxilia Brasil (Salesian movement). Covers vocational tracking (PSA), tithe management and mission inscriptions.',
    homepage: 'https://auxilia-app.vercel.app',
  },
  'mob-app': {
    description:
      'PWA for the Billings Ovulation Method (MOB). Full auth flow, push notifications and cron jobs.',
    homepage: 'https://mob-app-five.vercel.app',
  },
  'HelpDesk-SergipeTec': {
    description:
      'Help Desk ticket management system developed for the SergipeTec technical selection process.',
    homepage: '',
  },
  'prime-pet': {
    description:
      'Service contract and scheduling system for a pet care business, with Firebase Realtime Database integration and admin panel.',
    homepage: '',
  },
  'Tradutor-MSA-Extensao': {
    description:
      'Lightweight browser extension for instant text translation. Published on the Microsoft Edge Store and Firefox Add-ons.',
    homepage: '',
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function get(url, token) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'readme-generator',
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    https
      .get(url, options, (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function langBadge(lang) {
  const map = {
    JavaScript: ['F7DF1E', 'javascript', 'black'],
    TypeScript: ['3178C6', 'typescript', 'white'],
    Java: ['ED8B00', 'java', 'white'],
    Python: ['3776AB', 'python', 'white'],
    Dart: ['0175C2', 'dart', 'white'],
    HTML: ['E34F26', 'html5', 'white'],
    CSS: ['1572B6', 'css3', 'white'],
    Shell: ['4EAA25', 'gnubash', 'white'],
    PowerShell: ['5391FE', 'powershell', 'white'],
  };
  const [color, logo, textColor] = map[lang] || ['555555', null, 'white'];
  const l = encodeURIComponent(lang);
  return `![${lang}](https://img.shields.io/badge/${l}-${color}?style=flat-square${logo ? `&logo=${logo}&logoColor=${textColor}` : ''})`;
}

// ─── README BUILDER ──────────────────────────────────────────────────────────

function buildProjectRow(repo) {
  const override = OVERRIDES[repo.name] || {};
  const desc = override.description || repo.description || '_No description._';
  const url = repo.html_url;
  const home = override.homepage !== undefined ? override.homepage : repo.homepage;
  const lang = repo.language;
  const stars = repo.stargazers_count;

  const liveLink = home ? ` — [Live](${home})` : '';
  const starStr = stars > 0 ? ` ⭐ ${stars}` : '';
  const langStr = lang ? `  \n${langBadge(lang)}` : '';

  return `**[${repo.name}](${url})**${starStr}  \n${desc}${liveLink}${langStr}`;
}

function buildReadme(pinned, others) {
  const pinnedSection = pinned.map((r) => `### ${buildProjectRow(r)}`).join('\n\n');

  const otherSection =
    others.length > 0
      ? others.map((r) => `- ${buildProjectRow(r)}`).join('\n\n')
      : '_No additional public repositories._';

  const now = new Date().toISOString().split('T')[0];

  return `# Fernando Junior

**IT Infrastructure Analyst | Computer Engineering Student**  
Aracaju, Sergipe, Brazil

---

IT Infrastructure Analyst at IGH/HAMA with experience in server administration, backup management (Bacula), IT service management (GLPI), and infrastructure automation. Computer Engineering student at Descomplica.

My work sits at the intersection of enterprise infrastructure, cybersecurity, and full-stack web development — building internal tooling and automations that make systems operate more reliably.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fernando-msa/)
[![GitLab](https://img.shields.io/badge/GitLab-FC6D26?style=flat-square&logo=gitlab&logoColor=white)](https://gitlab.com/fernando-msa)
[![Lattes](https://img.shields.io/badge/Lattes-CV-003366?style=flat-square)](https://lattes.cnpq.br/6430749481990088)

---

## Core Competencies

**Infrastructure & Operations** — Windows Server, Linux, Bacula, GLPI, Active Directory, network administration  
**Automation & Scripting** — Google Apps Script, PowerShell, Bash, Ansible  
**Web Development** — Next.js, TypeScript, React, Node.js, Supabase, Firebase, Vercel  
**Security** — ISO/IEC 27001, incident management, ONA accreditation documentation

---

## Featured Projects

<!-- PINNED_START -->
${pinnedSection}
<!-- PINNED_END -->

---

## Other Public Repositories

<!-- OTHERS_START -->
${otherSection}
<!-- OTHERS_END -->

---

## GitHub Stats

![GitHub Stats](https://github-readme-stats-fast.vercel.app/api?username=${USERNAME}&show_icons=true&theme=default&include_all_commits=true&count_private=true&hide_border=true)
![Top Languages](https://github-readme-stats-fast.vercel.app/api/top-langs/?username=${USERNAME}&layout=compact&theme=default&hide_border=true)

---

_Last updated: ${now} — auto-generated by [generate-readme.js](.github/workflows/update-readme.yml)_
`;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  const token = process.env.GH_TOKEN || '';
  console.log('Fetching repositories for', USERNAME, '...');

  let allRepos = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/users/${USERNAME}/repos?per_page=100&page=${page}&sort=updated`;
    const batch = await get(url, token);
    if (!Array.isArray(batch) || batch.length === 0) break;
    allRepos = allRepos.concat(batch);
    page++;
  }

  console.log(`Fetched ${allRepos.length} repos.`);

  // Filter out skipped and forked repos
  const repos = allRepos.filter((r) => !SKIP.includes(r.name) && !r.fork);

  // Build pinned list (preserving manual order, skipping missing ones)
  const repoMap = Object.fromEntries(repos.map((r) => [r.name, r]));
  const pinnedRepos = PINNED.filter((n) => repoMap[n]).map((n) => repoMap[n]);

  // Remaining repos (not in pinned), sorted by last push
  const pinnedNames = new Set(PINNED);
  const otherRepos = repos
    .filter((r) => !pinnedNames.has(r.name))
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  const readme = buildReadme(pinnedRepos, otherRepos);
  fs.writeFileSync('README.md', readme, 'utf8');
  console.log('README.md written successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
