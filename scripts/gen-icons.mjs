// scripts/gen-icons.mjs
// Generates minimal SVG placeholder icons for the PWA manifest.
// Replace public/icons/icon-192.svg and icon-512.svg with real artwork before production.

import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

function svgIcon(size) {
  const fs = Math.round(size * 0.3)
  const r = Math.round(size * 0.18)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#1a1a2e"/>
  <text x="50%" y="54%" font-family="system-ui,sans-serif" font-weight="700"
        font-size="${fs}" fill="white" text-anchor="middle" dominant-baseline="middle">MT</text>
</svg>`
}

writeFileSync('public/icons/icon-192.svg', svgIcon(192))
writeFileSync('public/icons/icon-512.svg', svgIcon(512))
console.log('Icons written to public/icons/')
