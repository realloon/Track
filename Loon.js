export default class Loon {
    #style
    #struc
    #observe
    #synctexs = []

    // 重绘模板文本
    #redrawTextNode() {
        const synctexElements = this.$shadow.querySelectorAll('[data-synctex]')
        synctexElements.forEach((el) => {
            const key = el.dataset.synctex
            if (el.textContent !== this.data[key]) {
                el.textContent = this.data[key]
                console.log('redraw text node had Done.')
            }
        })
    }

    constructor(tagName, parms = {}) {
        this.#struc = parms.struc || ''
        this.#style = parms.style || ''
        this.#observe = parms.observe || []
        this.data = new Proxy(parms.data ? parms.data : {}, {
            // FIXME: 还有 dataset
            set: (target, property, value) => {
                if (target.property !== value) {
                    Reflect.set(target, property, value)

                    // 剔除没有对应模板字段的属性
                    if (this.#synctexs.includes(property)) {
                        this.#redrawTextNode()
                    }

                    // update dataset
                    // this.$element.dataset[property] = value
                }
                return true
            },
        })

        // Bind callback function
        this.attributeChangedCallback = parms.attributeChangedCallback

        const that = this
        class customElement extends HTMLElement {
            constructor() {
                super()
                this.shadow = this.attachShadow({ mode: 'closed' })
                this.shadow.innerHTML = that.style + that.struc

                // 绑定交互元素的监听事件
                // this.bindAttrHandle()

                // 暴露内部属性
                that.$element = this
                that.$shadow = this.shadow
            }

            static get observedAttributes() {
                return that.#observe.map((e) => 'data-' + e)
            }

            // 添加到 DOM 中时触发
            connectedCallback() {}

            attributeChangedCallback(target, oldValue, newValue) {
                // 绑定操作书写处
                that.#observe.forEach((key) => {
                    // console.log(`${that.data[key]} -> ${this.dataset[key]}`)

                    that.data[key] = this.dataset[key]
                })

                // that.xxxCallback
                if (that.attributeChangedCallback)
                    that.attributeChangedCallback.call(that)
            }

            bindAttrHandle() {
                // Doing input
                const inputNode = this.shadow.querySelectorAll('[data-input]')
                if (inputNode.length) {
                    inputNode.forEach((el) => {
                        const key = el.dataset.input

                        const sync = new Proxy(el.dataset, {
                            set: (target, property, value) => {
                                Reflect.set(target, property, value)
                                // Doing
                                el.value = that.data[key]
                                return true
                            },
                        })

                        sync.input = that.data[key]

                        el.addEventListener('input', (e) => {
                            that.data[key] = e.target.value
                        })
                    })
                }

                // const inputLazyNode =
                //     this.shadow.querySelectorAll('[data-input-lazy]')
                // if (inputLazyNode.length) {
                //     inputLazyNode.forEach((el) => {
                //         const sync = new Proxy(el.dataset, {
                //             set: (target, property, value) => {
                //                 Reflect.set(target, property, value)
                //                 // Doing
                //                 el.value = value
                //                 return true
                //             },
                //         })

                //         el.addEventListener('change', (e) => {
                //             sync.valueLazy = e.target.value
                //         })

                //         sync.valueLazy = that.data[el.dataset.valueLazy]
                //     })
                // }
            }
        }

        customElements.define(tagName, customElement)

        // Custom End callback
        if (parms.customCallback) parms.customCallback.call(this)
    }

    get style() {
        // console.log(
        //     '$@Loon=> get style result:',
        //     '<style>' + this.#style + '</style>'
        // )
        return '<style>' + this.#style + '</style>'
    }

    get struc() {
        const regex = /{{ \w+ }}/g
        let struc = this.#struc

        const isTemplate = regex.test(struc)

        if (isTemplate) {
            struc = struc.replace(regex, (match) => {
                return match.replace(regex, (match) => {
                    const key = match.replace(/({{ | }})/g, '')

                    // 增量保存需要更新的同步文本的 key
                    this.#synctexs.push(key)

                    // 添加 "data-synctex" 同步标记。并初始化节点文本值
                    return `<span data-synctex="${key}">${this.data[key]}</span>`
                })
            })
        }

        // console.log('$@Loon=> get struc result:', struc)
        return struc
    }
}
