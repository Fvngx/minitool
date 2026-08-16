/**
 * JSON 美化 / 压缩。纯字符串扫描，不走 eval，输入再怪也不执行。
 */

export function formatJson(raw: string): string {
	const src = raw.trim()
	if (src.length === 0) {
		throw new Error('内容是空的')
	}
	let out = ''
	let indent = 0
	let inStr = false
	let escape = false
	for (let i = 0; i < src.length; i++) {
		const ch = src.charAt(i)
		if (inStr) {
			out += ch
			if (escape) {
				escape = false
			} else if (ch === '\\') {
				escape = true
			} else if (ch === '"') {
				inStr = false
			}
			continue
		}
		if (ch === '"') {
			inStr = true
			out += ch
			continue
		}
		if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
			continue
		}
		if (ch === '{' || ch === '[') {
			indent++
			out += ch + '\n' + pad(indent)
			continue
		}
		if (ch === '}' || ch === ']') {
			indent--
			if (indent < 0) {
				throw new Error('括号对不上')
			}
			out += '\n' + pad(indent) + ch
			continue
		}
		if (ch === ',') {
			out += ch + '\n' + pad(indent)
			continue
		}
		if (ch === ':') {
			out += ': '
			continue
		}
		out += ch
	}
	if (inStr) {
		throw new Error('字符串没闭合')
	}
	if (indent !== 0) {
		throw new Error('括号对不上')
	}
	return out
}

export function minifyJson(raw: string): string {
	const pretty = formatJson(raw)
	let out = ''
	let inStr = false
	let escape = false
	for (let i = 0; i < pretty.length; i++) {
		const ch = pretty.charAt(i)
		if (inStr) {
			out += ch
			if (escape) {
				escape = false
			} else if (ch === '\\') {
				escape = true
			} else if (ch === '"') {
				inStr = false
			}
			continue
		}
		if (ch === '"') {
			inStr = true
			out += ch
			continue
		}
		if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
			continue
		}
		out += ch
	}
	return out
}

function pad(n: number): string {
	return '  '.repeat(n)
}
