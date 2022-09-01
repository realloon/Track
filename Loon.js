export default class Loon {
    constructor(tagName, parms = {}) {
        this.__style = parms.style ? `<style>${parms.style}</style>` : ''
        this.__struc = parms.struc ? parms.struc : ''

        // FIXME: 还有 dataset
        this.data = new Proxy(parms.data ? parms.data : {}, {
            set: (target, property, value) => {
                if (Reflect.get(target, property) !== value) {
                    Reflect.set(target, property, value)

                    this.#redrawTextNode()
                    // update dataset
                    // console.log(property)
                    this.$HTMLElement.dataset[property] = value
                }

                return true
            },
        })

        this.observe = parms.observe || []

        // Bind callback function
        this.attributeChangedCallback = parms.attributeChangedCallback

        const that = this
        class newElemnt extends HTMLElement {
            constructor() {
                super()
                this.shadow = this.attachShadow({ mode: 'closed' })
                this.shadow.innerHTML = that.style + that.struc

                this.bindAttrHandle()

                // 暴露内部属性
                that.$HTMLElement = this
                that.$shadowRoot = this.shadow
            }

            static get observedAttributes() {
                return that.observe.map((e) => 'data-' + e)
            }

            // 添加到 DOM 中时触发
            connectedCallback() {}

            attributeChangedCallback(target, oldValue, newValue) {
                // 绑定操作书写处
                that.observe.forEach((key) => {
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

        customElements.define(tagName, newElemnt)

        // Custom End callback
        if (parms.customCallback) parms.customCallback.call(this)
    }

    get style() {
        return this.__style
    }

    get struc() {
        let struc = this.__struc

        const isTemplate = /{{ \w+ }}/.test(struc)

        if (isTemplate) {
            struc = struc.replace(/<.*{{ \w+ }}.*>/g, (match) => {
                return match.replace(/{{ \w+ }}/g, (match) => {
                    const key = match.replace(/({{ | }})/g, '')
                    return `<span data-loon-content="${key}">${this.data[key]}</span>`
                })
            })
        }

        return struc
    }

    #redrawTextNode() {
        const textNode = this.$shadowRoot.querySelectorAll(
            '[data-loon-content]'
        )
        textNode.forEach((el) => {
            const key = el.dataset.loonContent
            if (el.textContent !== this.data[key]) {
                el.textContent = this.data[key]
                // console.log('redrawTextNode')
            }
        })
    }
}
