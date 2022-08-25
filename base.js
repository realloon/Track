import Loon from './Loon'

class Database {
    static _data = JSON.parse(localStorage.getItem('TrackDatabase'))

    static get data() {
        return this._data
            ? this._data
            : {
                  背单词: {
                      title: '背单词',
                      icon: '📖',
                      time: [[1661232832157, 1661232838157]],
                  },
              }
    }

    static updataTime(id, time) {
        const lists = this.data[id].time
        const lastList = lists[lists.length - 1]

        lastList.length !== 2 ? lastList.push(time) : lists.push([time])

        // 将数据本地储存
        localStorage.setItem('TrackDatabase', JSON.stringify(this.data))
    }
}

class TaskCardList extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'closed' })
        this.render()
    }

    render() {
        const data = Database.data
        const fragment = new DocumentFragment()

        for (const key of Object.keys(data)) {
            fragment.appendChild(new TaskCard(key))
        }

        this.shadow.appendChild(fragment)
    }
}

class TaskCard extends HTMLElement {
    constructor(id) {
        super()
        this.shadow = this.attachShadow({ mode: 'closed' })

        this.id = id
        this.data = Database.data[this.id]

        this.render()
        this.eventBind()
    }

    connectedCallback() {
        this.updataCountView()
    }

    get count() {
        let count = 0
        const lists = Database.data[this.id].time

        lists.forEach((list) => {
            if (list.length === 2) {
                count += list[1] - list[0]
            }
        })

        return (count / 60000).toFixed(2)
    }

    get lastCount() {
        const lists = Database.data[this.id].time
        const lastList = lists[lists.length - 1]
        let lastCount = 0

        lastList.length === 2
            ? (lastCount = lastList[1] - lastList[0])
            : (lastCount = new Date().getTime() - lastList[0])

        return (lastCount / 60000).toFixed(2)
    }

    get started() {
        const lists = Database.data[this.id].time
        const lastList = lists[lists.length - 1]
        return lastList.length !== 2
    }

    render() {
        this.shadow.innerHTML = `
            <style>
                .card {
                    background: #fff;
                    padding: 16px;
                    margin: 16px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    font-size: 16px;
                }

                .icon {
                    font-size: 1.5em;
                    
                    height: 24px;
                    line-height: 1em;
                    margin-right: 8px;
                }

                .title {
                    font-weight: bold;
                    margin-right: auto;
                }

                @media (prefers-color-scheme: dark) {
                    .card {
                        background: #1c1c1d;
                        color: #fff;
                    }
                }
            </style>

            <div class="card">
                <span class="icon">${this.data.icon}</span>
                <div class="title">${this.data.title}</div>
                <span class="counter"></span>
            </div>
        `
    }

    eventBind() {
        this.shadow.addEventListener('click', () => {
            Database.updataTime(this.id, new Date().getTime())
            this.updataCountView()
        })
    }

    updataCountView() {
        const countEl = this.shadow.querySelector('.counter')
        this.started
            ? (countEl.textContent = `正在计时：${this.lastCount}min`)
            : (countEl.textContent = `上次计时：${this.lastCount}min`)

        const that = this
        ;(function setTime() {
            setTimeout(() => {
                if (that.started) {
                    countEl.textContent = `正在计时：${that.lastCount}min`
                    setTime()
                } else {
                    countEl.textContent = `上次计时：${that.lastCount}min`
                }
            }, 600)
        })()
    }
}

new Loon('app-header', {
    struc: `
        <header>
            <h1>{{ title }}</h1>
        </header>
    `,
    style: `
        header {
            z-index: 20;
            background: #ededed;
            position: sticky;
            top: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 46px;
            border-bottom: 1px solid #eee;
        }

        h1 {
            font-size: 17px;
            font-weight: bold;
            line-height: 1em;
            margin: 0;
        }

        @media (prefers-color-scheme: dark) {
            header {
                background: var(--dark);
                color: #fff;
                border-bottom-color: #111;
            }
        }
    `,
    data: {
        title: 'Track',
    },
})

window.customElements.define('task-card', TaskCard)
window.customElements.define('task-card-list', TaskCardList)
