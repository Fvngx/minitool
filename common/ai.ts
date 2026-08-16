/**
 * 混元等大模型接入点。
 * 默认不请求网络：审核友好、也避免把用户文案打到别人服务器。
 * 以后要接，只改这一个文件，业务页继续走 fillLocal。
 */
export function fillLocal(body: string, hint: string): string {
	if (hint.trim().length === 0) {
		return body
	}
	return body + '\n\n——补充：' + hint.trim()
}
