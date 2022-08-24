class Database {
    static _data = JSON.parse(localStorage.getItem('TrackDatabase')) || {
        背单词: {
            title: '背单词',
            icon: '📖',
            time: [[1661232832157, 1661232838157]],
        },
    }
    static get data() {
        return Database._data
    }
    static set data(value) {
        Database._data = value
    }

    static updataTime(id, time) {
        const lists = this._data[id].time
        const lastList = lists[lists.length - 1]
        lastList.length !== 2 ? lastList.push(time) : lists.push([time])

        // 将数据本地储存
        localStorage.setItem('TrackDatabase', JSON.stringify(this._data))
    }
}

class TaskCardList extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'closed' })
        this.render()
    }
    render() {
        let innerHTML = ''
        const Data = Database.data

        for (const item of Object.keys(Data)) {
            innerHTML += `<task-card
                :id="${Data[item].title}" 
            ></task-card>`
        }

        this.shadow.innerHTML = innerHTML
    }
}

class TaskCard extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'closed' })

        this.id = this.getAttribute(':id')
        this.data = Database.data[this.id]
        this.data.count = (() => {
            let count = 0
            const lists = Database.data[this.id].time

            lists.forEach((list) => {
                if (list.length === 2) {
                    count += list[1] - list[0]
                }
            })

            return (count / 60000).toFixed(2)
        })()
        this.data.lastCount = (() => {
            const lists = Database.data[this.id].time
            const lastList = lists[lists.length - 1]
            let lastCount = 0

            lastList.length === 2
                ? (lastCount = lastList[1] - lastList[0])
                : (lastCount = lastList[0] - new Date().getTime())

            return (lastCount / 60000).toFixed(2)
        })()

        this.render()
        this.eventBind()
    }

    render() {
        this.started = (() => {
            const lists = Database.data[this.id].time
            const lastList = lists[lists.length - 1]
            return lastList.length !== 2
        })()

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
            <div class="title" style="color: ${
                this.started ? 'red' : 'inherit'
            }">${this.data.title}</div>
            <span class="counter">最近一次计时：${this.data.lastCount}min</span>
        </div>
        `
    }

    eventBind() {
        this.shadow.addEventListener('click', () => {
            Database.updataTime(this.id, new Date().getTime())
        })
    }
}

class HoneyHeader extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'closed' })
        let attr = this.attributes
        this._data = {
            title: attr[':title'] ? attr[':title'].value : '项目名称',
        }
        this.render()
    }

    render() {
        this.shadow.innerHTML = `
            <style>
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
            </style>
            <header>
                <h1>${this._data.title}</h1>
            </header>
        `
    }
}

window.customElements.define('honey-header', HoneyHeader)
window.customElements.define('task-card', TaskCard)
window.customElements.define('task-card-list', TaskCardList)
