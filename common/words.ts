/**
 * 关键词清洗：换行/逗号切开，去空、去重，可选排序。
 */
export function splitWords(raw: string): string[] {
	const parts = raw.replace(/[，,、]/g, '\n').split('\n')
	const out: string[] = []
	for (const part of parts) {
		const w = part.trim()
		if (w && !out.includes(w)) {
			out.push(w)
		}
	}
	return out
}

export function sortWords(list: string[]): string[] {
	return [...list].sort()
}

export function joinWords(list: string[]): string {
	return list.join('\n')
}
