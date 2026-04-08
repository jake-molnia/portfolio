import type { SimpleIcon } from 'simple-icons'
import {
  siCplusplus,
  siDocker,
  siGit,
  siGo,
  siGoogle,
  siGrafana,
  siHuggingface,
  siKicad,
  siKubernetes,
  siNixos,
  siNumpy,
  siOverleaf,
  siPandas,
  siPrometheus,
  siProxmox,
  siPython,
  siPytorch,
  siRust,
  siTensorflow,
  siUv,
  siWeightsandbiases,
} from 'simple-icons'

export interface SkillGroup {
  label: string
  value: string
}

function stripProficiency(chip: string): string {
  return chip.replace(/\s*\([^)]*\)\s*$/u, '').trim()
}

/** Key used to look up brand icons (after normalizing). */
function iconLookupKey(chip: string): string {
  return stripProficiency(chip).toLowerCase().replace(/\s+/g, ' ')
}

const BRAND_ICONS: Record<string, SimpleIcon> = {
  'c/c++': siCplusplus,
  c: siCplusplus,
  'c++': siCplusplus,
  python: siPython,
  golang: siGo,
  go: siGo,
  rust: siRust,
  git: siGit,
  torch: siPytorch,
  pytorch: siPytorch,
  tensorflow: siTensorflow,
  wandb: siWeightsandbiases,
  huggingface: siHuggingface,
  nix: siNixos,
  grafana: siGrafana,
  prometheus: siPrometheus,
  uv: siUv,
  pandas: siPandas,
  numpy: siNumpy,
  docker: siDocker,
  jax: siGoogle,
  kubernetes: siKubernetes,
  kicad: siKicad,
  overleaf: siOverleaf,
  proxmox: siProxmox,
}

function isLanguagesCategory(category: string): boolean {
  return category.trim().toLowerCase() === 'languages'
}

function resolveBrand(chip: string): SimpleIcon | undefined {
  const key = iconLookupKey(chip)
  return BRAND_ICONS[key]
}

function GlobeIcon() {
  return (
    <svg className="skill-pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function GenericIcon() {
  return (
    <svg className="skill-pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6M9 12h6M9 15h4" />
    </svg>
  )
}

function BrandIcon({ icon }: { icon: SimpleIcon }) {
  return (
    <svg className="skill-pill-icon" viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path d={icon.path} fill="currentColor" />
    </svg>
  )
}

function SkillPill({ chip, category }: { chip: string; category: string }) {
  const trimmed = chip.trim()
  const languages = isLanguagesCategory(category)
  const brand = !languages ? resolveBrand(trimmed) : undefined

  return (
    <span className="skill-pill">
      {languages ? <GlobeIcon /> : brand ? <BrandIcon icon={brand} /> : <GenericIcon />}
      <span className="skill-pill-text">{trimmed}</span>
    </span>
  )
}

export default function ResumeSkills({ groups }: { groups: SkillGroup[] }) {
  if (!groups.length) return null

  return (
    <div className="skill-section">
      <div className="rs-label skill-section-title">Skills</div>
      {groups.map((s, i) => (
        <div key={i} className="skill-group">
          <div className="skill-group-label">{s.label}</div>
          <div className="skill-pills">
            {s.value.split(/,\s*/).map((chip, j) => (
              <SkillPill key={`${chip}-${j}`} chip={chip} category={s.label} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
