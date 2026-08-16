/**
 * 各工具自己的「模板 / 历史」列表。
 * 约定字段：id、name、payload、at
 */
import { readList, writeList, nowId, nowText, objStr, makeObj, type JsonMap } from './store'

export function loadNamedList(key: string): JsonMap[] {
	return readList(key)
}

export function saveNamedItem(key: string, name: string, payload: string, limit: number): JsonMap {
	const item = makeObj(['id', nowId(), 'name', name, 'payload', payload, 'at', nowText()])
	writeList(key, [item, ...readList(key)].slice(0, limit))
	return item
}

export function upsertNamedItem(key: string, id: string, name: string, payload: string, limit: number): JsonMap {
	if (!id) {
		return saveNamedItem(key, name, payload, limit)
	}
	const list = readList(key)
	let updated: JsonMap | null = null
	const next = list.map((row) => {
		if (objStr(row, 'id', '') !== id) {
			return row
		}
		updated = makeObj(['id', id, 'name', name, 'payload', payload, 'at', nowText()])
		return updated
	})
	if (updated == null) {
		return saveNamedItem(key, name, payload, limit)
	}
	writeList(key, next)
	return updated
}

export function removeNamedItem(key: string, id: string) {
	writeList(
		key,
		readList(key).filter((row) => objStr(row, 'id', '') !== id)
	)
}

export function prependUnique(key: string, title: string, payload: string, limit: number) {
	const item = makeObj(['id', nowId(), 'name', title, 'payload', payload, 'at', nowText()])
	const rest = readList(key).filter((row) => objStr(row, 'payload', '') !== payload)
	writeList(key, [item, ...rest].slice(0, limit))
}
