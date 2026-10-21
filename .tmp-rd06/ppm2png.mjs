import fs from 'fs'
import zlib from 'zlib'
import path from 'path'
import { getDocument, OPS } from '../webapp/node_modules/pdfjs-dist/legacy/build/pdf.mjs'

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function writePng(file, width, height, rgb) {
  const raw = Buffer.alloc((width * 3 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0
    rgb.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  fs.writeFileSync(file, png)
}

function parsePpm(file) {
  const buf = fs.readFileSync(file)
  let i = 0
  const readLine = () => {
    let s = ''
    while (i < buf.length && buf[i] !== 10) {
      s += String.fromCharCode(buf[i++])
    }
    i++
    return s.trim()
  }
  const magic = readLine()
  if (magic !== 'P6') throw new Error('not P6: ' + magic)
  let dim = readLine()
  while (dim.startsWith('#')) dim = readLine()
  const [w, h] = dim.split(/\s+/).map(Number)
  const max = readLine()
  if (max !== '255') throw new Error('max ' + max)
  const rgb = buf.subarray(i)
  return { w, h, rgb }
}

const outDir = path.resolve('.')
const data = new Uint8Array(fs.readFileSync('../docs/req/1. Quy trinh Phan mem KHCN chi tiet.pdf'))
const doc = await getDocument({ data, disableWorker: true }).promise

async function dumpPageImages(p) {
  const page = await doc.getPage(p)
  const ops = await page.getOperatorList()
  let n = 0
  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] !== OPS.paintImageXObject) continue
    const name = ops.argsArray[i][0]
    const img = await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('timeout ' + name)), 5000)
      page.objs.get(name, (obj) => {
        clearTimeout(t)
        if (obj) resolve(obj)
        else reject(new Error('missing ' + name))
      })
    }).catch(
      () =>
        new Promise((resolve, reject) => {
          const t = setTimeout(() => reject(new Error('timeout2 ' + name)), 5000)
          page.commonObjs.get(name, (obj) => {
            clearTimeout(t)
            if (obj) resolve(obj)
            else reject(new Error('missing2 ' + name))
          })
        }),
    )
    n++
    const { width: w, height: h, data: d } = img
    const ch = Math.round(d.length / (w * h))
    let rgb
    if (ch === 3) rgb = Buffer.from(d)
    else if (ch === 4) {
      rgb = Buffer.alloc(w * h * 3)
      for (let j = 0, k = 0; j < d.length; j += 4) {
        rgb[k++] = d[j]
        rgb[k++] = d[j + 1]
        rgb[k++] = d[j + 2]
      }
    } else {
      rgb = Buffer.alloc(w * h * 3)
      for (let j = 0, k = 0; j < d.length; j++) {
        rgb[k++] = d[j]
        rgb[k++] = d[j]
        rgb[k++] = d[j]
      }
    }
    const out = path.join(outDir, `page${p}_img${n}_${w}x${h}.png`)
    writePng(out, w, h, rgb)
    console.log('wrote', out)
  }
  console.log('page', p, 'images', n, 'ops', ops.fnArray.length)
}

for (const p of [59, 60, 61, 62]) await dumpPageImages(p)

// also convert existing ppm if present
for (const f of fs.readdirSync(outDir).filter((x) => x.endsWith('.ppm'))) {
  const { w, h, rgb } = parsePpm(path.join(outDir, f))
  const out = path.join(outDir, f.replace(/\.ppm$/, '.png'))
  writePng(out, w, h, rgb)
  console.log('converted', out, w, h)
}
