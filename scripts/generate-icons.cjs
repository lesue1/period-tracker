const fs = require('fs')
const { deflateSync } = require('zlib')

function crc32(buf) {
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    table[n] = c
  }
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeAndData = Buffer.concat([Buffer.from(type), data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(typeAndData))
  return Buffer.concat([len, typeAndData, crcBuf])
}

function generateRoundedRectPNG(size, r, g, b, bgR, bgG, bgB) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  for (let i = 10; i < 13; i++) ihdr[i] = 0

  const radius = size * 0.225
  const rawData = []
  for (let y = 0; y < size; y++) {
    rawData.push(0)
    for (let x = 0; x < size; x++) {
      const dx = Math.min(x, size - 1 - x)
      const dy = Math.min(y, size - 1 - y)
      const cornerDist = Math.sqrt(Math.max(0, radius - dx) ** 2 + Math.max(0, radius - dy) ** 2)
      if (cornerDist <= radius) {
        rawData.push(r, g, b)
      } else {
        rawData.push(bgR, bgG, bgB)
      }
    }
  }
  const compressed = deflateSync(Buffer.from(rawData))
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const icon192 = generateRoundedRectPNG(192, 219, 77, 112, 255, 255, 255)
const icon512 = generateRoundedRectPNG(512, 219, 77, 112, 255, 255, 255)
fs.writeFileSync('public/icons/icon-192.png', icon192)
fs.writeFileSync('public/icons/icon-512.png', icon512)
console.log('Generated icon-192.png: ' + icon192.length + ' bytes')
console.log('Generated icon-512.png: ' + icon512.length + ' bytes')
