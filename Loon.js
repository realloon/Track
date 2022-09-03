export default class Loon {
    #style = ''
    #struc = ''
    #observe = new Set()
    #synctexs = new Set()
    #callback = {}
    #syncInputElements = []

    constructor(tagName, parms = {}) {
        this.data = new Proxy(parms.data || {}, {
            set: (target, property, value) => {
                if (target.property === value) return true

                const hasSyncTexs = this.#synctexs.has(property)
                const hasSyncInputs = this.#syncInputElements.length !== 0

                if (hasSyncTexs || hasSyncInputs) {
                    // 如果修改的属性对应同步字段，其值转换为字符串类型
                    value = String(value)
                }

                Reflect.set(target, property, value)

                // 对有同步字段的属性重绘 textContent 值
                if (hasSyncTexs) {
                    const synctexElements =
                        this.$shadow.querySelectorAll('[data-synctex]')

                    synctexElements.forEach((el) => {
                        const key = el.dataset.synctex
                        if (
                            key !== property ||
                            el.textContent === this.data[key]
                        )
                            return

                        // if (el.textContent !== this.data[key]) {}

                        // console.log(
                        //     '@Loon: Redraw text node had Done:',
                        //     `${el.textContent} -> ${this.data[key]}`
                        // )
                        
                        el.textContent = this.data[key]

                        // if (this.#observe.includes(key)) {
                        //     console.log('绑定 dataset')
                        //     // 同步到元素 dataset 属性上
                        //     this.$element.dataset[key] = value
                        // }
                    })
                }

                // 同步 Proxy(data) 的变化到 input.value 上
                if (hasSyncInputs) {
                    this.#syncInputElements.forEach((el) => {
                        const key = el.dataset.input

                        if (!(key === property)) return

                        value = String(value)
                        if (el.value !== value) {
                            console.log(
                                'input value data: ',
                                el.value,
                                '->',
                                value
                            )
                            el.value = value
                        }
                    })
                }

                return true
            },
        })

        this.#struc = (() => {
            if (!parms.struc) return ''

            let struc = parms.struc

            const templatRegex = /{{ \w+ }}/g
            const isTemplate = templatRegex.test(struc)

            if (isTemplate) {
                struc = struc.replace(templatRegex, (match) => {
                    return match.replace(templatRegex, (match) => {
                        const key = match.replace(/({{ | }})/g, '')

                        // 增量保存需要更新的同步文本的 key
                        this.#synctexs.add(key)

                        // 添加 "data-synctex" 同步标记。并初始化节点文本值
                        return `<span data-synctex="${key}">${this.data[key]}</span>`

                        // slot 方案
                        // return `<slot name=${key}></slot>`
                    })
                })
            }

            // console.log('@Loon get struc result:', struc)
            return struc
        })()

        this.#style = parms.style ? '<style>' + parms.style + '</style>' : ''

        this.#observe = (() => {
            if (Array.isArray(parms.observe) && parms.observe.length === 0)
                return new Set()

            return new Set(parms.observe)
        })()

        // Bind callback function
        this.#callback = parms.callback

        const that = this
        class customElement extends HTMLElement {
            constructor() {
                super()
                this.shadow = this.attachShadow({ mode: 'closed' })
                this.shadow.innerHTML = that.#style + that.#struc

                // 绑定交互元素的监听事件
                this.#bind()

                // 暴露真实 dom 到 Loon 对象上
                that.$element = this
                that.$shadow = this.shadow

                if (that.#callback && that.#callback.constructedCallback)
                    that.#callback.constructedCallback.call(that)
            }

            #bind() {
                const inputElements =
                    this.shadow.querySelectorAll('[data-input]')

                inputElements.forEach((el) => {
                    const key = el.dataset.input

                    // init element.value
                    el.value = that.data[key]

                    // console.log('bind event listener:', el)
                    el.addEventListener('input', (e) => {
                        // 把 input 属性的变化同步到 Proxy(data)
                        that.data[key] = e.target.value
                    })

                    // TODO XXXXXXXXXXXXXXX
                    that.#syncInputElements.push(el)
                })
            }

            static get observedAttributes() {
                const array = []

                that.#observe.forEach((value) => array.push('data-' + value))

                return array
            }

            // 添加到 DOM 中时触发
            connectedCallback() {
                if (that.#callback && that.#callback.connectedCallback)
                    that.#callback.connectedCallback.call(that)
            }

            attributeChangedCallback(target, oldValue, newValue) {
                that.#observe.forEach((key) => {
                    // 将 dataset 的值同步到 data 代理对象
                    that.data[key] = this.dataset[key]
                })

                // attributeChangedCallback
                if (that.#callback && that.#callback.attributeChangedCallback)
                    that.#callback.attributeChangedCallback.call(that)
            }

            // 绑定交互元素的监听事件
        }

        customElements.define(tagName, customElement)

        // Custom End callback
        if (this.#callback && this.#callback.customCallback)
            this.#callback.customCallback.call(this)
    }
}
