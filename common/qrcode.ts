/**
 * 极简二维码（字节模式 + L 纠错）。
 * 前端本地画点阵，不把链接传到第三方短链/生码服务。
 * 内容过长会提示分段，避免 silently 出错。
 */

export function makeQrMatrix(text: string): number[][] {
	const data = encodeBytes(text)
	const version = pickVersion(data.length)
	if (version < 1) {
		throw new Error('内容太长，先缩短链接再生成')
	}
	const eccLen = eccCount(version)
	const dataCap = dataCw(version)
	const padded = padData(data, dataCap)
	const ecc = rsEncode(padded, eccLen)
	const codewords: number[] = []
	for (let i = 0; i < padded.length; i++) {
		codewords.push(padded[i])
	}
	for (let i = 0; i < ecc.length; i++) {
		codewords.push(ecc[i])
	}
	const size = version * 4 + 17
	const matrix = emptyMatrix(size)
	placeFinders(matrix, size)
	placeTiming(matrix, size)
	placeDark(matrix, version)
	if (version >= 2) {
		placeAlign(matrix, version)
	}
	placeFormatReserve(matrix, size)
	fillData(matrix, size, codewords)
	const mask = 0
	applyMask(matrix, size, mask)
	placeFormat(matrix, size, mask)
	return matrix
}

function encodeBytes(text: string): number[] {
	const bytes: number[] = []
	for (let i = 0; i < text.length; i++) {
		const c = text.charCodeAt(i)
		if (c < 128) {
			bytes.push(c)
		} else {
			// 非 ASCII 按 UTF-8 拆
			const u = encodeURIComponent(text.charAt(i))
			const parts = u.split('%')
			for (let k = 0; k < parts.length; k++) {
				if (parts[k].length == 2) {
					bytes.push(parseInt(parts[k], 16))
				}
			}
		}
	}
	const bits: number[] = []
	pushBits(bits, 4, 4)
	pushBits(bits, bytes.length, 8)
	for (let i = 0; i < bytes.length; i++) {
		pushBits(bits, bytes[i], 8)
	}
	pushBits(bits, 0, 4)
	while (bits.length % 8 != 0) {
		bits.push(0)
	}
	const cw: number[] = []
	for (let i = 0; i < bits.length; i += 8) {
		let v = 0
		for (let b = 0; b < 8; b++) {
			v = (v << 1) | bits[i + b]
		}
		cw.push(v)
	}
	return cw
}

function pushBits(bits: number[], value: number, len: number) {
	for (let i = len - 1; i >= 0; i--) {
		bits.push((value >> i) & 1)
	}
}

function pickVersion(dataLen: number): number {
	for (let v = 1; v <= 6; v++) {
		if (dataLen <= dataCw(v)) {
			return v
		}
	}
	return -1
}

function dataCw(v: number): number {
	if (v == 1) return 19
	if (v == 2) return 34
	if (v == 3) return 55
	if (v == 4) return 80
	if (v == 5) return 108
	return 136
}

function eccCount(v: number): number {
	if (v == 1) return 7
	if (v == 2) return 10
	if (v == 3) return 15
	if (v == 4) return 20
	if (v == 5) return 26
	return 18
}

function padData(data: number[], cap: number): number[] {
	const out: number[] = []
	for (let i = 0; i < data.length && i < cap; i++) {
		out.push(data[i])
	}
	const pads: number[] = [0xEC, 0x11]
	let p = 0
	while (out.length < cap) {
		out.push(pads[p % 2])
		p++
	}
	return out
}

let EXP: number[] = [] as number[]
let LOG: number[] = [] as number[]

function initGF() {
	if (EXP.length > 0) {
		return
	}
	EXP = [] as number[]
	LOG = [] as number[]
	for (let i = 0; i < 256; i++) {
		LOG.push(0)
		EXP.push(0)
	}
	let x = 1
	for (let i = 0; i < 255; i++) {
		EXP[i] = x
		LOG[x] = i
		x = x << 1
		if (x > 255) {
			x = x ^ 0x11d
		}
	}
	EXP[255] = EXP[0]
}

function gfMul(a: number, b: number): number {
	initGF()
	if (a == 0 || b == 0) {
		return 0
	}
	return EXP[(LOG[a] + LOG[b]) % 255]
}

function rsEncode(data: number[], eccLen: number): number[] {
	const generator = rsGenerator(eccLen)
	const poly: number[] = []
	for (let i = 0; i < data.length; i++) {
		poly.push(data[i])
	}
	for (let i = 0; i < eccLen; i++) {
		poly.push(0)
	}
	for (let i = 0; i < data.length; i++) {
		const coef = poly[i]
		if (coef == 0) {
			continue
		}
		for (let j = 0; j < generator.length; j++) {
			poly[i + j] = poly[i + j] ^ gfMul(generator[j], coef)
		}
	}
	const ecc: number[] = []
	for (let i = data.length; i < poly.length; i++) {
		ecc.push(poly[i])
	}
	return ecc
}

function rsGenerator(eccLen: number): number[] {
	initGF()
	let gen: number[] = [1]
	for (let i = 0; i < eccLen; i++) {
		const next: number[] = []
		for (let k = 0; k < gen.length + 1; k++) {
			next.push(0)
		}
		for (let j = 0; j < gen.length; j++) {
			next[j] = next[j] ^ gen[j]
			next[j + 1] = next[j + 1] ^ gfMul(gen[j], EXP[i])
		}
		gen = next
	}
	return gen
}

function emptyMatrix(size: number): number[][] {
	const m: number[][] = []
	for (let y = 0; y < size; y++) {
		const row: number[] = []
		for (let x = 0; x < size; x++) {
			row.push(-1)
		}
		m.push(row)
	}
	return m
}

function fillRect(m: number[][], x: number, y: number, w: number, h: number, v: number) {
	for (let j = 0; j < h; j++) {
		for (let i = 0; i < w; i++) {
			m[y + j][x + i] = v
		}
	}
}

function placeFinder(m: number[][], x: number, y: number) {
	fillRect(m, x, y, 7, 7, 1)
	fillRect(m, x + 1, y + 1, 5, 5, 0)
	fillRect(m, x + 2, y + 2, 3, 3, 1)
}

function placeFinders(m: number[][], size: number) {
	placeFinder(m, 0, 0)
	placeFinder(m, size - 7, 0)
	placeFinder(m, 0, size - 7)
	for (let i = 0; i < 8; i++) {
		setIf(m, 7, i, 0)
		setIf(m, i, 7, 0)
		setIf(m, size - 8, i, 0)
		setIf(m, size - 8 + i, 7, 0)
		setIf(m, i, size - 8, 0)
		setIf(m, 7, size - 8 + i, 0)
	}
}

function setIf(m: number[][], x: number, y: number, v: number) {
	if (y >= 0 && y < m.length && x >= 0 && x < m[0].length) {
		m[y][x] = v
	}
}

function placeTiming(m: number[][], size: number) {
	for (let i = 8; i < size - 8; i++) {
		m[6][i] = i % 2 == 0 ? 1: 0
		m[i][6] = i % 2 == 0 ? 1: 0
	}
}

function placeDark(m: number[][], version: number) {
	m[4 * version + 9][8] = 1
}

function alignPos(version: number): number[] {
	if (version == 2) return [6, 18]
	if (version == 3) return [6, 22]
	if (version == 4) return [6, 26]
	if (version == 5) return [6, 30]
	if (version == 6) return [6, 34]
	return [] as number[]
}

function placeAlign(m: number[][], version: number) {
	const pos = alignPos(version)
	for (let a = 0; a < pos.length; a++) {
		for (let b = 0; b < pos.length; b++) {
			const x = pos[a]
			const y = pos[b]
			if ((x < 9 && y < 9) || (x > m.length - 10 && y < 9) || (x < 9 && y > m.length - 10)) {
				continue
			}
			fillRect(m, x - 2, y - 2, 5, 5, 1)
			fillRect(m, x - 1, y - 1, 3, 3, 0)
			m[y][x] = 1
		}
	}
}

function placeFormatReserve(m: number[][], size: number) {
	for (let i = 0; i < 9; i++) {
		if (m[8][i] < 0) m[8][i] = 0
		if (m[i][8] < 0) m[i][8] = 0
	}
	for (let i = 0; i < 8; i++) {
		if (m[8][size - 1 - i] < 0) m[8][size - 1 - i] = 0
		if (m[size - 1 - i][8] < 0) m[size - 1 - i][8] = 0
	}
}

function fillData(m: number[][], size: number, codewords: number[]) {
	const bits: number[] = []
	for (let i = 0; i < codewords.length; i++) {
		for (let b = 7; b >= 0; b--) {
			bits.push((codewords[i] >> b) & 1)
		}
	}
	let bi = 0
	let dir = -1
	let x = size - 1
	while (x > 0) {
		if (x == 6) {
			x--
		}
		for (let i = 0; i < size; i++) {
			const y = dir < 0 ? size - 1 - i: i
			for (let dx = 0; dx < 2; dx++) {
				const xx = x - dx
				if (m[y][xx] == -1) {
					let bit = 0
					if (bi < bits.length) {
						bit = bits[bi]
						bi++
					}
					m[y][xx] = bit
				}
			}
		}
		dir = -dir
		x -= 2
	}
}

function applyMask(m: number[][], size: number, mask: number) {
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			if (isFunction(m, x, y, size)) {
				continue
			}
			let flip = false
			if (mask == 0) {
				flip = (x + y) % 2 == 0
			}
			if (flip) {
				m[y][x] = m[y][x] == 1 ? 0: 1
			}
		}
	}
}

function isFunction(m: number[][], x: number, y: number, size: number): boolean {
	if (y < 9 && x < 9) return true
	if (y < 9 && x >= size - 8) return true
	if (y >= size - 8 && x < 9) return true
	if (y == 6 || x == 6) return true
	if (y == 8 && (x < 9 || x >= size - 8)) return true
	if (x == 8 && (y < 9 || y >= size - 8)) return true
	return false
}

function placeFormat(m: number[][], size: number, mask: number) {
	// 纠错等级 L = 01，加上 mask，BCH 预计算 mask0
	const bits = formatBits(mask)
	const coords = [
		[0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
		[8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0]
	]
	for (let i = 0; i < 15; i++) {
		const bit = (bits >> (14 - i)) & 1
		m[coords[i][1]][coords[i][0]] = bit
	}
	for (let i = 0; i < 8; i++) {
		const bit = (bits >> (14 - i)) & 1
		m[8][size - 1 - i] = bit
	}
	for (let i = 0; i < 7; i++) {
		const bit = (bits >> (6 - i)) & 1
		m[size - 7 + i][8] = bit
	}
}

function formatBits(mask: number): number {
	// L + mask0 的标准 15 位格式信息
	if (mask == 0) return 0x77C4
	if (mask == 1) return 0x72F3
	return 0x77C4
}
