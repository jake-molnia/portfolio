// Parses the specific WPI-style LaTeX resume template into structured data

function stripLatex(str) {
  return str
    .replace(/\\textbf\{([^}]*)\}/g, '$1')
    .replace(/\\textit\{([^}]*)\}/g, '$1')
    .replace(/\\normalsize\{([^}]*)\}/g, '$1')
    .replace(/\\large\{([^}]*)\}/g, '$1')
    .replace(/\\small\{([^}]*)\}/g, '$1')
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, '$1')
    .replace(/\\color\{[^}]*\}\{([^}]*)\}/g, '$1')
    .replace(/\{\\color\{[^}]*\}([^}]*)\}/g, '$1')
    .replace(/\\underline\{([^}]*)\}/g, '$1')
    .replace(/\\\\/g, '')
    .replace(/~/g, ' ')
    .replace(/\\&/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractArgs(str, startIdx, n) {
  // Extract n brace-delimited args starting at startIdx
  const args = []
  let i = startIdx
  for (let a = 0; a < n; a++) {
    while (i < str.length && str[i] !== '{') i++
    if (i >= str.length) break
    let depth = 0, start = i + 1, j = i
    for (; j < str.length; j++) {
      if (str[j] === '{') depth++
      else if (str[j] === '}') { depth--; if (depth === 0) break }
    }
    args.push(str.slice(start, j))
    i = j + 1
  }
  return args
}

export function parseLatexResume(tex) {
  const result = {
    name: '',
    contact: {},
    education: [],
    technicalSkills: [],
    additionalSkills: [],
    experience: [],
    projects: [],
    honours: [],
  }

  // --- Name ---
  const nameMatch = tex.match(/\{\\huge\s+([^}]+)\}/)
  if (nameMatch) result.name = stripLatex(nameMatch[1])

  // --- Contact ---
  const phoneMatch = tex.match(/\{([+\d\s()]+)\}/)
  if (phoneMatch) result.contact.phone = phoneMatch[1].trim()

  const emailMatch = tex.match(/href\{mailto:([^}]+)\}/)
  if (emailMatch) result.contact.email = emailMatch[1]

  const linkedinMatch = tex.match(/href\{https?:\/\/(www\.linkedin\.com\/[^}]+)\}/)
  if (linkedinMatch) result.contact.linkedin = linkedinMatch[1]

  const githubMatch = tex.match(/href\{https?:\/\/(github\.com\/[^}]+)\}/)
  if (githubMatch) result.contact.github = githubMatch[1]

  // --- Sections: split by \section ---
  const sectionRe = /\\section\{[^}]*\\color\{[^}]*\}([A-Z /]+)\}/gi
  const sectionMatches = [...tex.matchAll(/\\section\{[^}]*\}([^]*?)(?=\\section\{|\\end\{document\})/g)]

  for (const sm of sectionMatches) {
    const header = sm[0].match(/\\section\{[^}]*(?:color\{[^}]*\})?([A-Z /]+)/)
    const rawHeader = sm[0].match(/\\section\{\s*(?:\\color\{[^}]+\})?\s*([^}]+)\}/)
    const sectionName = rawHeader ? rawHeader[1].replace(/\\color\{[^}]+\}/g, '').trim().toUpperCase() : ''
    const body = sm[0]

    if (sectionName.includes('EDUCATION')) {
      const subheadings = [...body.matchAll(/\\resumeSubheading\s*\{/g)]
      for (const sh of subheadings) {
        const args = extractArgs(body, sh.index + sh[0].length - 1, 4)
        if (args.length < 4) continue
        const items = []
        const itemsBlock = body.slice(sh.index)
        const itemMatches = [...itemsBlock.matchAll(/\\resumeItem\{([^]*?)\}(?=\s*\\resumeItem|\s*\\resumeItemListEnd)/g)]
        for (const im of itemMatches.slice(0, 10)) items.push(stripLatex(im[1]))
        result.education.push({
          institution: stripLatex(args[0]),
          location: stripLatex(args[1]),
          degree: stripLatex(args[2]),
          dates: stripLatex(args[3]),
          items,
        })
      }
    }

    if (sectionName.includes('TECHNICAL SKILLS')) {
      const skillMatches = [...body.matchAll(/\\textbf\{\\normalsize\{([^}]+)\}\}\{\\s*\\normalsize\{([^}]+)\}/g)]
      for (const m of skillMatches) {
        result.technicalSkills.push({ label: stripLatex(m[1]), value: stripLatex(m[2]) })
      }
      // fallback pattern
      if (!result.technicalSkills.length) {
        const altMatches = [...body.matchAll(/\\textbf\{\\normalsize\{([^}]+)\}\}\{\s*\\normalsize\{([^}]+)\}/g)]
        for (const m of altMatches) {
          result.technicalSkills.push({ label: stripLatex(m[1]), value: stripLatex(m[2]) })
        }
      }
    }

    if (sectionName.includes('ADDITIONAL SKILLS')) {
      const altMatches = [...body.matchAll(/\\textbf\{\\normalsize\{([^}]+)\}\}\{\s*\\normalsize\{([^}]+)\}/g)]
      for (const m of altMatches) {
        result.additionalSkills.push({ label: stripLatex(m[1]), value: stripLatex(m[2]) })
      }
    }

    if (sectionName.includes('WORK EXPERIENCE') || sectionName.includes('EXPERIENCE')) {
      const shMatches = [...body.matchAll(/\\resumeSubheading\s*\{/g)]
      for (const sh of shMatches) {
        const args = extractArgs(body, sh.index + sh[0].length - 1, 4)
        if (args.length < 4) continue
        const items = []
        const afterSh = body.slice(sh.index)
        const itemMatches = [...afterSh.matchAll(/\\resumeItem\{\\normalsize\{\s*([^}]+)\}/g)]
        for (const im of itemMatches.slice(0, 6)) items.push(stripLatex(im[1]))
        result.experience.push({
          role: stripLatex(args[0]),
          location: stripLatex(args[1]),
          org: stripLatex(args[2]),
          dates: stripLatex(args[3]),
          items,
        })
      }
    }

    if (sectionName.includes('PROJECTS')) {
      const itemMatches = [...body.matchAll(/\\resumeItem\{\\normalsize\{([^]*?)\}\}/g)]
      for (const im of itemMatches) {
        const raw = im[1]
        const titleMatch = raw.match(/\\textbf\{([^}]+)\}/)
        const title = titleMatch ? stripLatex(titleMatch[1]) : ''
        const desc = stripLatex(raw.replace(/\\textbf\{[^}]+\},?\s*/, ''))
        result.projects.push({ title, desc })
      }
    }

    if (sectionName.includes('HONOURS') || sectionName.includes('AWARDS')) {
      const itemMatches = [...body.matchAll(/\\resumeItem\{\\normalsize\{([^}]+)\}\}/g)]
      for (const im of itemMatches) result.honours.push(stripLatex(im[1]))
    }
  }

  return result
}