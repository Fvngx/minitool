/// <reference types="@dcloudio/types" />

declare module '*.uvue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<object, object, unknown>
	export default component
}

/** 输入框事件。uni 各端 detail.value 都是字符串 */
interface UniInputEvent {
	detail: { value: string }
	currentTarget: { dataset: Record<string, string> }
}

/** 页面 onLoad 查询参数 */
type OnLoadOptions = Record<string, string | undefined>

/** 兼容原先 UTS 的 JSON 对象写法 */
type UTSJSONObject = Record<string, unknown>
