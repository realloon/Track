export default class Loon {
    constructor(tagName, parms = {}) {
        this.__style = parms.style ? `<style>${parms.style}</style>` : ''
        this.__struc = parms.struc ? parms.struc : ''

        this.data = parms.data
            ? new Proxy(parms.data, {
                  set: (target, property, value) => {
                      if (Reflect.get(target, property) !== value) {
                          Reflect.set(target, property, value)
                          //   Doing
                          that.$shadowRoot.innerHTML = `${this.style}\n${this.struc}`
                          console.log('触发了 shadowRoot.innerHTML 重绘')
                      }

                      return true
                  },
              })
            : {}

        const that = this
        class newElemnt extends HTMLElement {
            constructor() {
                super()
                this.shadow = this.attachShadow({ mode: 'closed' })
                this.shadow.innerHTML = `${that.style}\n${that.struc}`

                this.bindAttr()

                // 暴露内部属性
                that.$HTMLElement = this
                that.$shadowRoot = this.shadow
                if (parms.constructCallback) parms.constructCallback.call(that)
            }

            static get observedAttributes() {
                return ['data-value']
            }

            connectedCallback() {}

            attributeChangedCallback(target, oldValue, newValue) {
                // 绑定操作书写处
                console.log('done')
            }

            bindAttr() {
                // Doing
                const textNodeHadnle = this.shadow.querySelectorAll('[-text]')
                if (textNodeHadnle.length) {
                    textNodeHadnle.forEach((el) => {
                        const value = that.data[el.getAttribute('-text')]
                        el.textContent = value
                    })
                }
            }
        }

        customElements.define(tagName, newElemnt)
        if (parms.customCallback) parms.customCallback.call(this)
    }

    get style() {
        return this.__style
    }

    get struc() {
        let struc = this.__struc

        const isTemplate = /{{\s\w+\s}}/.test(struc)

        if (isTemplate) {
            this.__struc.replace(/{{\s\w+\s}}/g, (match) => {
                const key = match.replace(/({{ | }})/g, '')
                struc = struc.replace(match, this.data[key])
            })
        }

        return struc
    }
}
