/**
 * 本地存储统一入口。
 * 全部用字符串落盘，避免各端对对象序列化不一致。
 * 数据只存在用户设备，不上传。
 */

export type JsonMap = Record<string, unknown>

const PREFIX = 'mt_'

export function storageKey(name: string): string {
	return PREFIX + name
}

export function readText(name: string, fallback: string): string {
	const key = storageKey(name)
	const raw = uni.getStorageSync(key)
	if (raw == null) {
		return fallback
	}
	return String(raw)
}

export function writeText(name: string, value: string) {
	uni.setStorageSync(storageKey(name), value)
}

export function readList(name: string): JsonMap[] {
	const text = readText(name, '[]')
	try {
		const parsed = JSON.parse(text) as unknown
		if (!Array.isArray(parsed)) {
			return []
		}
		const list: JsonMap[] = []
		for (const item of parsed) {
			if (item != null && typeof item === 'object') {
				list.push(item as JsonMap)
			}
		}
		return list
	} catch (e) {
		console.log('读取列表失败', name, e)
		return []
	}
}

export function writeList(name: string, list: JsonMap[]) {
	writeText(name, JSON.stringify(list))
}

export function nowId(): string {
	return Date.now().toString()
}

export function nowText(): string {
	const d = new Date()
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function pad2(n: number): string {
	return n < 10 ? '0' + n : String(n)
}

export function copyText(text: string) {
	uni.setClipboardData({
		data: text,
		success: () => {
			uni.showToast({ title: '已复制', icon: 'none' })
		}
	})
}

export function objStr(obj: JsonMap, key: string, fallback: string): string {
	const v = obj[key]
	if (v == null) {
		return fallback
	}
	return String(v)
}

export function objNum(obj: JsonMap, key: string, fallback: number): number {
	const v = obj[key]
	if (v == null) {
		return fallback
	}
	const n = parseFloat(String(v))
	return Number.isNaN(n) ? fallback : n
}

export function objBool(obj: JsonMap, key: string, fallback: boolean): boolean {
	const v = obj[key]
	if (v == null) {
		return fallback
	}
	if (typeof v === 'boolean') {
		return v
	}
	const s = String(v).toLowerCase()
	return s === 'true' || s === '1'
}

export function makeObj(pairs: string[]): JsonMap {
	const o: JsonMap = {}
	for (let i = 0; i + 1 < pairs.length; i += 2) {
		o[pairs[i]] = pairs[i + 1]
	}
	return o
}
