export default class Loon {
    constructor(tagName, parms) {
        this.data = new Proxy(parms.data, {
            get: (target, property) => {
                return Reflect.get(target, property)
            },
            set: (target, property, value) => {
                if (!target[property]) return false

                if (Reflect.get(target, property) !== value) {
                    Reflect.set(target, property, value)
                    that.$element.innerHTML = `${this.style}\n${this.struc}`
                }

                return true
            },
        })

        this.__style = parms.style ? `<style>${parms.style}</style>` : ''
        this.__struc = parms.struc ? `${parms.struc}` : ''

        const that = this
        class newElemnt extends HTMLElement {
            constructor() {
                super()
                this.shadow = this.attachShadow({ mode: 'closed' })

                this.shadow.innerHTML = `${that.style}\n${that.struc}`

                // 将影子 DOM 绑定到 Loon 实例上
                that.$element = this.shadow

                if (parms.constructCallback) parms.constructCallback.call(that)
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

        this.__struc.replace(/{{\s\w+\s}}/g, (match) => {
            const key = match.replace(/({{ | }})/g, '')
            struc = struc.replace(match, this.data[key])
        })
        return struc
    }
}
