export default class Loon {
    #style
    #struc
    #observe
    #synctexs = []
    #callback

    constructor(tagName, parms = {}) {
        this.data = new Proxy(parms.data ? parms.data : {}, {
            set: (target, property, value) => {
                if (target.property !== value) {
                    // 对有模板字段的属性进行重绘文本
                    if (this.#synctexs.includes(property)) {
                        // 如果药修改的属性对应模板字段，其值转换为字符串类型
                        Reflect.set(target, property, String(value))

                        const synctexElements =
                            this.$shadow.querySelectorAll('[data-synctex]')

                        synctexElements.forEach((el) => {
                            const key = el.dataset.synctex

                            if (el.textContent !== this.data[key]) {
                                el.textContent = this.data[key]
                                console.log(
                                    '@Loon: Redraw text node had Done, content:',
                                    this.data[key]
                                )
                            }

                            // FIXME: 还有 dataset
                            // this.$element.dataset[property] = value

                            // slot 方案
                            // const slot = this.$element.querySelectorAll(`[slot=${key}]`)
                            // slot.forEach((e) => {
                            //     e.textContent = this.data[key]
                            // })
                            // slot.textContent = this.data[key]
                        })
                    } else {
                        Reflect.set(target, property, value)
                    }
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
                        this.#synctexs.push(key)

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

        this.#observe = parms.observe || []

        // Bind callback function
        this.#callback = parms.callback

        const that = this
        class customElement extends HTMLElement {
            constructor() {
                super()
                this.shadow = this.attachShadow({ mode: 'closed' })
                this.shadow.innerHTML = that.#style + that.#struc

                // 绑定交互元素的监听事件
                // this.bindAttrHandle()

                // 暴露真实 dom 到 Loon 对象上
                that.$element = this
                that.$shadow = this.shadow

                // slot 方案 init
                // Object.keys(that.data).forEach((key) => {
                //     const span = document.createElement('span')
                //     span.textContent = that.data[key]
                //     span.setAttribute('slot', key)
                //     this.appendChild(span)
                // })
            }

            static get observedAttributes() {
                return that.#observe.map((e) => 'data-' + e)
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

                // that.xxxCallback
                if (that.#callback && that.#callback.attributeChangedCallback)
                    that.#callback.attributeChangedCallback.call(that)
            }

            // 绑定交互元素的监听事件
            // bindAttrHandle() {
            //     // Doing input
            //     const inputNode = this.shadow.querySelectorAll('[data-input]')
            //     if (inputNode.length) {
            //         inputNode.forEach((el) => {
            //             const key = el.dataset.input

            //             const sync = new Proxy(el.dataset, {
            //                 set: (target, property, value) => {
            //                     Reflect.set(target, property, value)
            //                     // Doing
            //                     el.value = that.data[key]
            //                     return true
            //                 },
            //             })

            //             sync.input = that.data[key]

            //             el.addEventListener('input', (e) => {
            //                 that.data[key] = e.target.value
            //             })
            //         })
            //     }

            //     // const inputLazyNode =
            //     //     this.shadow.querySelectorAll('[data-input-lazy]')
            //     // if (inputLazyNode.length) {
            //     //     inputLazyNode.forEach((el) => {
            //     //         const sync = new Proxy(el.dataset, {
            //     //             set: (target, property, value) => {
            //     //                 Reflect.set(target, property, value)
            //     //                 // Doing
            //     //                 el.value = value
            //     //                 return true
            //     //             },
            //     //         })

            //     //         el.addEventListener('change', (e) => {
            //     //             sync.valueLazy = e.target.value
            //     //         })

            //     //         sync.valueLazy = that.data[el.dataset.valueLazy]
            //     //     })
            //     // }
            // }
        }

        customElements.define(tagName, customElement)

        // Custom End callback
        if (this.#callback && this.#callback.customCallback)
            this.#callback.customCallback.call(this)
    }
}
