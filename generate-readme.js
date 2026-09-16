import https from 'node:https';
import fs from 'node:fs';

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const USERNAME = 'fernando-msa';

// Repositórios do Grupo FJJ a serem destacados como primeira prioridade
const GRUPO_FJJ_PROJECTS = [
  {
    name: 'FJJ Soluções Tecnológicas (Portal & Portfólio)',
    repoUrl: 'https://github.com/FJJGroup/FJJ_portfolio',
    liveUrl: 'https://grupofjj.com.br/',
    description:
      'Portal institucional oficial e showcase corporativo da software house. Arquitetura multi-páginas de alta performance desenvolvida com Vite, Tailwind CSS, partículas neurais interativas em Canvas 2D, efeitos 3D tilt e SEO técnico avançado (Schema.org JSON-LD).',
    badge: '![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)',
  },
  {
    name: 'FJJ PDV',
    repoUrl: 'https://github.com/FJJGroup/FJJ_PDV',
    liveUrl: 'https://pdv.grupofjj.com.br/',
    demoUrl: 'https://pdv.grupofjj.com.br/app',
    description:
      'Sistema de Ponto de Venda (PDV) de alta disponibilidade e operação 100% Offline-First para varejo. Desenvolvido com persistência local em IndexedDB, sincronização assíncrona resiliente com Supabase em nuvem, impressão térmica de cupons ESC/POS (80mm/58mm), módulo White-Label e interface dark tech.',
    badge: '![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)',
  },
  {
    name: 'FJJ Connect',
    repoUrl: 'https://github.com/FJJGroup/FJJ_Connect',
    liveUrl: 'https://connect.grupofjj.com.br/',
    description:
      'Plataforma SaaS de IA Conversacional para Instagram e qualificação inteligente de leads comerciais. Integração 100% oficial com Meta Graph API, agente autônomo baseado em Google Gemini 1.5 Flash, atendimento em tempo real com live chat e hand-off humano, quick replies, gatilhos de stories e webhooks CRM.',
    badge: '![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![Gemini AI](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat-square&logo=google&logoColor=white) ![Meta API](https://img.shields.io/badge/Meta%20Graph%20API-0081FB?style=flat-square&logo=meta&logoColor=white)',
  },
  {
    name: 'PactoAI',
    repoUrl: '',
    liveUrl: 'https://pactoia.grupofjj.com.br/login',
    description:
      'Plataforma LegalTech SaaS para análise semântica e auditoria automatizada de minutas contratuais. Identificação preventiva de cláusulas de risco, verificação de conformidade regulatória com a LGPD e geração de pareceres estruturados com inteligência artificial.',
    badge: '![LegalTech](https://img.shields.io/badge/LegalTech%20SaaS-0EA5E9?style=flat-square) ![LGPD](https://img.shields.io/badge/LGPD%20Compliance-10B981?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)',
  },
];

// Repos a ignorar na listagem geral (repositório do perfil, etc.)
const SKIP = [USERNAME, 'fernando-msa'];

// Repositórios já destacados nas seções principais
const FEATURED_NAMES = new Set([
  'metrics-compliance-agent',
  'windows-compliance-agent',
  'terraform-hama-iac-governance',
  'secpolicy-hama',
  'auxilia-app',
  'mob-app',
  'infrapulse-social',
  'InfraPulse-Social',
  'prime-pet',
  'HelpDesk-SergipeTec',
]);

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
    HCL: ['555555', null, 'white'],
  };
  const [color, logo, textColor] = map[lang] || ['555555', null, 'white'];
  const l = encodeURIComponent(lang);
  return `![${lang}](https://img.shields.io/badge/${l}-${color}?style=flat-square${logo ? `&logo=${logo}&logoColor=${textColor}` : ''})`;
}

// ─── README BUILDER ──────────────────────────────────────────────────────────

function buildFjjSection() {
  return GRUPO_FJJ_PROJECTS.map((p) => {
    const live = p.liveUrl ? ` — [Live](${p.liveUrl})` : '';
    const demo = p.demoUrl ? ` · [Demo Online](${p.demoUrl})` : '';
    const title = p.repoUrl ? `**[${p.name}](${p.repoUrl})**` : `**${p.name}**`;
    return `- ${title}${live}${demo}  \n  ${p.description}  \n  ${p.badge}`;
  }).join('\n\n');
}

function buildReadme(otherRepos) {
  const fjjSection = buildFjjSection();

  const otherList =
    otherRepos.length > 0
      ? otherRepos
          .map((r) => {
            const desc = r.description ? ` — ${r.description}` : '';
            const stars = r.stargazers_count > 0 ? ` ⭐ ${r.stargazers_count}` : '';
            const badge = r.language ? ` ${langBadge(r.language)}` : '';
            return `- [${r.name}](${r.html_url})${stars}${desc}${badge}`;
          })
          .join('\n')
      : '_Nenhum repositório adicional encontrado._';

  return `<div align="center">

![Profile views](https://komarev.com/ghpvc/?username=fernando-msa&color=blueviolet&style=flat-square&label=Profile+views)

# Hi, I'm Fernando 👋

### IT Infrastructure Analyst · Windows Server / PowerShell · Founder & Full-Stack Engineer at Grupo FJJ ☁️🚀

Keeping hospital infrastructure compliant, monitored and running,  
while architecting scalable SaaS platforms, AI systems and offline-first software at **[Grupo FJJ](https://grupofjj.com.br)**. 🏥🧪⚡

</div>

---

### 🐈 About

- 🏢 **Founding & Engineering at [Grupo FJJ](https://grupofjj.com.br)**: Building B2B SaaS solutions, high-conversion web architectures, and conversational AI agents ([FJJGroup](https://github.com/FJJGroup)).
- 🛒 **Building [FJJ PDV](https://pdv.grupofjj.com.br/)**: An offline-first point-of-sale system for retail with local IndexedDB storage, resilient Supabase cloud sync, ESC/POS thermal printing, and white-label customization.
- 🤖 **Building [FJJ Connect](https://connect.grupofjj.com.br/)**: An AI-powered conversational marketing and lead qualification SaaS for Instagram (Google Gemini 1.5 Flash + official Meta Graph API) with live chat human hand-off.
- ⚖️ **Co-building [PactoAI](https://pactoia.grupofjj.com.br/login)**: LegalTech SaaS for automated contract auditing, clause risk detection, and LGPD compliance.
- 💻 **By day at HAMA**: Deep in **Windows Server / PowerShell / Bacula / GLPI / Grafana / Looker Studio**, keeping mission-critical hospital infrastructure ISO 27001 & LGPD compliant.
- 🎨 **Full-Stack**: **Next.js, React, TypeScript, Tailwind CSS, Node.js & Supabase**.
- ☁️ **Cloud & DevOps**: Translating governance and compliance controls into **Terraform / AWS** infrastructure as code.
- ⚡ **Fun fact**: I'll turn a manual audit checklist into a dashboard before you finish filling it out.

---

### 📦 Projects

#### 🚀 Grupo FJJ & SaaS Ecosystem

${fjjSection}

#### 🏥 Enterprise Infrastructure & Healthcare

- **[metrics-compliance-agent](https://github.com/fernando-msa)**  
  Production compliance and metrics verification agent for Windows Servers at HAMA, integrating PowerShell, Next.js/Supabase backend, real-time dashboard, GLPI webhooks, and ISO 27001 audit PDF export.  
  ![PowerShell](https://img.shields.io/badge/PowerShell-5391FE?style=flat-square&logo=powershell&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)

- **[terraform-hama-iac-governance](https://github.com/fernando-msa)**  
  Portfolio project translating HAMA's paper-based governance controls into AWS infrastructure code — tagging, IAM, S3 backup, CloudWatch SLA monitoring, rack access audit trails, and a Python Lambda for Wi-Fi checks.  
  ![Terraform](https://img.shields.io/badge/Terraform-844FBA?style=flat-square&logo=terraform&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazonwebservices&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)

- **[secpolicy-hama](https://github.com/fernando-msa/secpolicy-hama)** — [Live](https://secpolicy-hama.vercel.app)  
  Information security policy checklist tool aligned with ISO/IEC 27001, featuring PDF export and localStorage persistence.  
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

#### 🌐 Web Apps & Community

- **[auxilia-app](https://github.com/fernando-msa/auxilia-app)** — [Live](https://auxilia-app.vercel.app)  
  Next.js 15 PWA for the Salesian Movimento Auxilia Brasil, with Supabase RLS across three modules (PSA, Together, Missões).  
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)

- **[mob-app](https://github.com/fernando-msa/mob-app)** — [Live](https://mob-app-five.vercel.app)  
  Next.js 14 PWA for the Billings Ovulation Method, with Supabase auth, VAPID push notifications, and cron-based reminders.  
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

- **[infrapulse-social](https://github.com/fernando-msa/InfraPulse-Social)**  
  GovTech platform (NestJS + Next.js + FastAPI) integrating six Brazilian public data connectors for Sergipe.  
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

- **[prime-pet](https://github.com/fernando-msa/prime-pet)**  
  Service contract and scheduling system for pet care businesses, with Firebase Realtime Database integration and admin panel.  
  ![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat-square&logo=html5&logoColor=white)

<details>
<summary><b>📂 Outros Repositórios Públicos</b></summary>
<br>

${otherList}

</details>

---

### 💼 Tech stack

<div align="center">

![My skills](https://skillicons.dev/icons?i=windows,ts,nextjs,react,tailwind,nodejs,supabase,postgres,python,terraform,aws,docker,powershell,bash,git,github,vscode,grafana&theme=dark)

</div>

---

### 📊 GitHub Activity

<div align="center">

![Streak](https://streak-stats.demolab.com?user=fernando-msa&theme=tokyonight&hide_border=true)
![Activity Graph](https://github-readme-activity-graph.vercel.app/graph?username=fernando-msa&theme=tokyo-night&hide_border=true)

</div>

<!-- 🔗 Connect: https://www.linkedin.com/in/fernando-msa/ | https://grupofjj.com.br -->

<div align="center">
<br>
<i>Always learning. Always building.</i>
</div>
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

  // Filtra repositórios ignorados e forks
  const repos = allRepos.filter((r) => !SKIP.includes(r.name) && !r.fork);

  // Repositórios não destacados na seção principal, ordenados pelo último push
  const otherRepos = repos
    .filter((r) => !FEATURED_NAMES.has(r.name))
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  const readme = buildReadme(otherRepos);
  fs.writeFileSync('README.md', readme, 'utf8');
  console.log('README.md written successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
