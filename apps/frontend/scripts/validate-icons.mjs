import fs from 'node:fs'

const pngSignature = '89504e470d0a1a0a'
const appIconBaseUrl = 'https://sawithub-public-assets-660113312407-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/public/app-icons'

function readPngSize(buffer, label) {
  if (buffer.subarray(0, 8).toString('hex') !== pngSignature) {
    throw new Error(`${label} is not a PNG file`)
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

async function fetchAsset(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`)
  return {
    contentType: response.headers.get('content-type') ?? '',
    buffer: Buffer.from(await response.arrayBuffer()),
  }
}

const expectedPngs = {
  [`${appIconBaseUrl}/favicon-16.png`]: [16, 16],
  [`${appIconBaseUrl}/favicon-32.png`]: [32, 32],
  [`${appIconBaseUrl}/favicon-48.png`]: [48, 48],
  [`${appIconBaseUrl}/apple-touch-icon.png`]: [180, 180],
  [`${appIconBaseUrl}/icon-192.png`]: [192, 192],
  [`${appIconBaseUrl}/icon-512.png`]: [512, 512],
  [`${appIconBaseUrl}/maskable-192.png`]: [192, 192],
  [`${appIconBaseUrl}/maskable-512.png`]: [512, 512],
}

for (const [url, [expectedWidth, expectedHeight]] of Object.entries(expectedPngs)) {
  const { contentType, buffer } = await fetchAsset(url)
  if (!contentType.startsWith('image/png')) throw new Error(`${url} must be served as image/png; found ${contentType}`)
  const { width, height } = readPngSize(buffer, url)
  if (width !== expectedWidth || height !== expectedHeight) {
    throw new Error(`${url} must be ${expectedWidth}x${expectedHeight}; found ${width}x${height}`)
  }
}

for (const svg of [`${appIconBaseUrl}/favicon.svg`]) {
  const { contentType } = await fetchAsset(svg)
  if (!contentType.startsWith('image/svg+xml')) throw new Error(`${svg} must be served as image/svg+xml; found ${contentType}`)
}

const indexHtml = fs.readFileSync('index.html', 'utf8')
for (const [size, path] of [
  ['16x16', `${appIconBaseUrl}/favicon-16.png`],
  ['32x32', `${appIconBaseUrl}/favicon-32.png`],
  ['48x48', `${appIconBaseUrl}/favicon-48.png`],
  ['180x180', `${appIconBaseUrl}/apple-touch-icon.png`],
]) {
  if (!indexHtml.includes(`sizes="${size}"`) || !indexHtml.includes(`href="${path}"`)) {
    throw new Error(`index.html missing icon link for ${size} ${path}`)
  }
}

const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'))
const manifestIcons = manifest.icons ?? []
const requiredManifestIcons = [
  [`${appIconBaseUrl}/icon-192.png`, '192x192', 'any'],
  [`${appIconBaseUrl}/icon-512.png`, '512x512', 'any'],
  [`${appIconBaseUrl}/maskable-192.png`, '192x192', 'maskable'],
  [`${appIconBaseUrl}/maskable-512.png`, '512x512', 'maskable'],
]

for (const [src, sizes, purpose] of requiredManifestIcons) {
  const icon = manifestIcons.find(item => item.src === src)
  if (!icon) throw new Error(`manifest.json missing icon ${src}`)
  if (icon.sizes !== sizes) throw new Error(`manifest icon ${src} must declare ${sizes}; found ${icon.sizes}`)
  if (icon.type !== 'image/png') throw new Error(`manifest icon ${src} must declare image/png`)
  if (icon.purpose !== purpose) throw new Error(`manifest icon ${src} must declare purpose ${purpose}; found ${icon.purpose}`)

  const [expectedWidth, expectedHeight] = sizes.split('x').map(Number)
  const { buffer } = await fetchAsset(src)
  const actual = readPngSize(buffer, src)
  if (actual.width !== expectedWidth || actual.height !== expectedHeight) {
    throw new Error(`manifest icon ${src} declares ${sizes} but file is ${actual.width}x${actual.height}`)
  }
}

console.log('[icons] OK: S3 favicon, app icons, maskable icons, manifest references, and dimensions validated.')
