/**
 * 收藏常用工具、通用历史记录。
 * 历史只留最近若干条，防止本地撑爆。
 */
import { readList, writeList, nowId, nowText, objStr, makeObj, type JsonMap } from './store'

const FAV_KEY = 'fav_tools'
const HIS_KEY = 'tool_history'
const HIS_LIMIT = 30

export function loadFavIds(): string[] {
	return readList(FAV_KEY).map((item) => objStr(item, 'id', ''))
}

export function isFav(id: string): boolean {
	return loadFavIds().includes(id)
}

export function toggleFav(id: string): boolean {
	const list = readList(FAV_KEY)
	const found = list.some((item) => objStr(item, 'id', '') === id)
	const next = found
		? list.filter((item) => objStr(item, 'id', '') !== id)
		: [makeObj(['id', id, 'at', nowText()]), ...list]
	writeList(FAV_KEY, next)
	return !found
}

export function pushHistory(toolId: string, title: string, payload: string) {
	const list = readList(HIS_KEY)
	const item = makeObj(['id', nowId(), 'toolId', toolId, 'title', title, 'payload', payload, 'at', nowText()])
	writeList(HIS_KEY, [item, ...list].slice(0, HIS_LIMIT))
}

export function loadHistory(): JsonMap[] {
	return readList(HIS_KEY)
}

export function clearHistory() {
	writeList(HIS_KEY, [])
}
