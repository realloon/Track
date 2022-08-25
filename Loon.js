export default class Loon {
    constructor(tagName, parms) {
        this.data = new Proxy(parms.data, {
            get: (target, property) => {
                if (!target[property])
                    return console.error(`目标对象没有 ${property} 参数`)

                return Reflect.get(target, property)
            },
            set: (target, property, value) => {
                if (!target[property])
                    return console.error(`目标对象没有 ${property} 参数`)

                console.log('执行了一次' + value)
                Reflect.set(target, property, value)
                that.$element.innerHTML = `${this.style}\n${this.struc}`
            },
        })

        this.__style = `<style>${parms.style}</style>`
        this.__struc = `${parms.struc}`

        const that = this
        class newElemnt extends HTMLElement {
            constructor() {
                super()
                this.shadow = this.attachShadow({ mode: 'closed' })

                this.shadow.innerHTML = `${that.style}\n${that.struc}`

                // 将影子 DOM 绑定到 Loon 实例上
                that.$element = this.shadow
            }
        }

        customElements.define(tagName, newElemnt)
    }

    get style() {
        return this.__style
    }

    get struc() {
        let struc = this.__struc

        this.__struc.replace(/{{\s\w+\s}}/g, (martch) => {
            const key = martch.replace(/({{ | }})/g, '')
            struc = struc.replace(martch, this.data[key])
        })
        return struc
    }
}

// eg:
let test = new Loon('x-foo', {
    struc: `
        <div>
            <h1>hello, LoonFrame!</h1>
            <p>姓名：{{ name }}</p>
            <p>年龄：{{ age }}</p>
        </div>
    `,
    style: `
        h1 { color: #607d8b }
        div {
            box-shadow: 0 0 4px 2px #00000016;
            margin: 16px;
            padding: 16px;
        }
    `,
    data: {
        name: 'realloon',
        age: 21,
    },
})
