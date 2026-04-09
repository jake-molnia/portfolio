export type ToolCategory = 'text' | 'image' | 'pdf' | 'conversion' | 'other'

export interface ToolDescriptor {
  slug: string
  name: string
  description: string
  category: ToolCategory
  icon: string            // SVG path(s) for the tool card icon
  lossy?: boolean         // Show "lossy" warning badge
  accepts?: string[]      // MIME types the tool accepts
  component: () => Promise<{ default: React.ComponentType }>
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  text: 'Text & Data',
  image: 'Image Tools',
  pdf: 'PDF Tools',
  conversion: 'File Conversions',
  other: 'Other Utilities',
}

export const CATEGORY_ORDER: ToolCategory[] = ['text', 'image', 'pdf', 'conversion', 'other']

export const TOOLS: ToolDescriptor[] = [
  // ── Text & Data ──
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Pretty-print, minify, and validate JSON',
    category: 'text',
    icon: 'M4 7V4h16v3M9 20h6M12 4v16',
    component: () => import('./tools/JsonFormatter'),
  },
  {
    slug: 'base64',
    name: 'Base64 Encode / Decode',
    description: 'Encode and decode text or files to Base64',
    category: 'text',
    icon: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
    component: () => import('./tools/Base64Codec'),
  },
  {
    slug: 'url-codec',
    name: 'URL Encode / Decode',
    description: 'Percent-encode and decode URL strings',
    category: 'text',
    icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
    component: () => import('./tools/UrlCodec'),
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    description: 'MD5, SHA-1, SHA-256 hashes from text or files',
    category: 'text',
    icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    component: () => import('./tools/HashGenerator'),
  },
  {
    slug: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode JWT header and payload, check expiry',
    category: 'text',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    component: () => import('./tools/JwtDecoder'),
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test patterns with live match highlighting',
    category: 'text',
    icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    component: () => import('./tools/RegexTester'),
  },
  {
    slug: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Write Markdown, see rendered HTML live',
    category: 'text',
    icon: 'M4 7V4h16v3M9 20h6M12 4v16',
    component: () => import('./tools/MarkdownPreview'),
  },
  {
    slug: 'diff',
    name: 'Text Diff',
    description: 'Compare two text blocks with highlighted changes',
    category: 'text',
    icon: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
    component: () => import('./tools/DiffTool'),
  },
  {
    slug: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between HEX, RGB, and HSL with preview',
    category: 'text',
    icon: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
    component: () => import('./tools/ColorConverter'),
  },

  // ── Image Tools ──
  {
    slug: 'image-resize',
    name: 'Image Resize',
    description: 'Resize images with aspect ratio lock',
    category: 'image',
    icon: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
    accepts: ['image/*'],
    component: () => import('./tools/ImageResize'),
  },
  {
    slug: 'image-compress',
    name: 'Image Compress',
    description: 'Reduce file size with quality control',
    category: 'image',
    icon: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
    lossy: true,
    accepts: ['image/*'],
    component: () => import('./tools/ImageCompress'),
  },
  {
    slug: 'image-convert',
    name: 'Image Convert',
    description: 'Convert between PNG, JPG, WebP, and AVIF',
    category: 'image',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
    lossy: true,
    accepts: ['image/*'],
    component: () => import('./tools/ImageConvert'),
  },
  {
    slug: 'svg-to-png',
    name: 'SVG to PNG',
    description: 'Export SVG at any resolution as PNG',
    category: 'image',
    accepts: ['image/svg+xml'],
    icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    component: () => import('./tools/SvgToPng'),
  },

  // ── PDF Tools ──
  {
    slug: 'pdf-merge',
    name: 'Merge PDFs',
    description: 'Combine multiple PDF files into one',
    category: 'pdf',
    accepts: ['application/pdf'],
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6',
    component: () => import('./tools/PdfMerge'),
  },
  {
    slug: 'pdf-split',
    name: 'Split PDF',
    description: 'Extract page ranges into separate files',
    category: 'pdf',
    accepts: ['application/pdf'],
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 15h6',
    component: () => import('./tools/PdfSplit'),
  },
  {
    slug: 'pdf-rotate',
    name: 'Rotate PDF Pages',
    description: 'Rotate individual or all pages',
    category: 'pdf',
    accepts: ['application/pdf'],
    icon: 'M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2',
    component: () => import('./tools/PdfRotate'),
  },
  {
    slug: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Render each page as PNG or JPG',
    category: 'pdf',
    lossy: true,
    accepts: ['application/pdf'],
    icon: 'M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM3 16l5-5 4 4 4-4 5 5M14.5 9.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',
    component: () => import('./tools/PdfToImages'),
  },
  {
    slug: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Combine images into a PDF document',
    category: 'pdf',
    accepts: ['image/*'],
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14',
    component: () => import('./tools/ImagesToPdf'),
  },
  {
    slug: 'pdf-compress',
    name: 'Compress PDF',
    description: 'Reduce PDF file size by re-serializing',
    category: 'pdf',
    lossy: true,
    accepts: ['application/pdf'],
    icon: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
    component: () => import('./tools/PdfCompress'),
  },

  // ── Other Utilities ──
  {
    slug: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes from text or URLs',
    category: 'other',
    icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17 14h1M14 14h1M17 17h1M14 20h1M20 14h1M20 17h1M20 20h1M17 20h1',
    component: () => import('./tools/QrGenerator'),
  },
  {
    slug: 'json-to-csv',
    name: 'JSON to CSV',
    description: 'Convert a JSON array of objects to CSV',
    category: 'other',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h2M8 17h2M14 13h2M14 17h2',
    component: () => import('./tools/JsonToCsv'),
  },
  {
    slug: 'csv-to-json',
    name: 'CSV to JSON',
    description: 'Parse CSV into a JSON array of objects',
    category: 'other',
    icon: 'M16 18l6-6-6-6M8 6l-6 6 6 6M14 4l-4 16',
    component: () => import('./tools/CsvToJson'),
  },
]

export function getToolBySlug(slug: string): ToolDescriptor | undefined {
  return TOOLS.find(t => t.slug === slug)
}

export function getToolsByCategory(): Map<ToolCategory, ToolDescriptor[]> {
  const map = new Map<ToolCategory, ToolDescriptor[]>()
  for (const cat of CATEGORY_ORDER) {
    const tools = TOOLS.filter(t => t.category === cat)
    if (tools.length) map.set(cat, tools)
  }
  return map
}
