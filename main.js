import Loon from './Loon.js'

export class Database {
    //FIXME: 初始化时应及时处理
    static _data = JSON.parse(localStorage.getItem('TrackDatabase'))

    static get data() {
        if (this._data) {
            return this._data
        } else {
            const initDatabase = {
                背单词: {
                    title: '背单词',
                    icon: '📖',
                    descript: '单词是英语的基础',
                    time: [[0, 0]],
                },
            }

            localStorage.setItem('TrackDatabase', JSON.stringify(initDatabase))

            return initDatabase
        }
    }

    static saveData() {
        localStorage.setItem('TrackDatabase', JSON.stringify(this.data))
    }

    static updataTimeItems(id, time) {
        const lists = this.data[id].time
        const lastList = lists[lists.length - 1]

        lastList.length !== 2 ? lastList.push(time) : lists.push([time])

        // 将数据本地储存
        this.saveData()
    }

    static addTaskItems(icon, title, descript) {
        const newItems = {
            title: title,
            icon: icon,
            descript: descript,
            time: [[0, 0]],
        }

        this.data[title] = newItems
        this.saveData()
    }

    static exportDataFile() {
        ;(async () => {
            const downloadFile = (await import('./downloadFile.js')).default
            downloadFile(Database.data)
        })()
    }

    static clearData() {
        localStorage.removeItem('TrackDatabase')
    }
}

class TaskCard extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'closed' })

        this.key = this.dataset.key
        this.data = Database.data[this.key]

        this.render()
        this.eventBind()
    }

    connectedCallback() {
        this.updataCountView()
    }

    get count() {
        let count = 0
        const lists = Database.data[this.key].time

        lists.forEach((list) => {
            if (list.length === 2) {
                count += list[1] - list[0]
            }
        })

        return (count / 60000).toFixed(2)
    }

    get lastCount() {
        const lists = Database.data[this.key].time
        const lastList = lists[lists.length - 1]
        let lastCount = 0

        lastList.length === 2
            ? (lastCount = lastList[1] - lastList[0])
            : (lastCount = new Date().getTime() - lastList[0])

        return (lastCount / 60000).toFixed(2)
    }

    get started() {
        const lists = Database.data[this.key].time
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
            Database.updataTimeItems(this.key, new Date().getTime())
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
            background: var(--prime);
            position: sticky;
            top: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 46px;
            border-bottom: 1px solid #eee;
            color: var(--font-color)
        }

        h1 {
            font-size: 17px;
            font-weight: bold;
            line-height: 1em;
            margin: 0;
        }

        @media (prefers-color-scheme: dark) {
            header {
                border-bottom-color: #111;
            }
        }
    `,
    data: {
        title: 'Track',
    },
})

new Loon('task-list', {
    struc: `{{ name }} List:\n<div></div>`,
    data: {
        list: Database.data,
        name: '项目',
    },
    customCallback: function () {
        let innerHTML = ''

        for (const key of Object.keys(this.data.list)) {
            innerHTML += `<task-card data-key="${key}">hello</task-card>`
        }

        this.$element.innerHTML = innerHTML
    },
})

new Loon('add-card', {
    style: `
        form {
            display: flex;
            flex-direction: column;
            padding: 16px;
            margin: 16px;
            background: #fff;
            border-radius: var(--borad-radius);
        }

        h2 {
            font-size: 1.25rem;
            margin: 0 0 16px 0;
        }

        .row {
            display: flex;
            align-content: center;
            align-items: baseline;
            margin-bottom: 16px;
        }

        input {
            font-size: 16px;
            width: 100%;
            padding: 0;
            border: none;
            padding: 0.5em;
            box-sizing: border-box;
            background: #f0f0f0;
        }

        button {
            font-size: 1rem;
            line-height: 1rem;
            padding: 0.5em;
            box-sizing: border-box;
            width: 4em;
            border: none;
            margin: 16px 0 0 auto;
        }

        #task-icon {
            width: 2.5em;
            text-align: center;
            margin-right: 16px;
        }

        @media (prefers-color-scheme: dark) {
            form {
                background: #1c1c1d;
                color: #fff;
            }
        }
    `,
    struc: `
        <form action="./test" method="post">
            <h2>添加新任务</h2>
            <div class="row">
                <input
                    type="text"
                    name="task-icon"
                    id="task-icon"
                    value="😍"
                /><input
                    type="text"
                    name="task-title"
                    id="task-title"
                    value="任务"
                />
            </div>
            <label for="task-descript">描述</label>
            <input type="text" name="task-descript" id="task-descript" />
            <button type="submit">保存</button>
        </form>
    `,
    constructCallback: function () {
        const iconEl = this.$element.querySelector('#task-icon')
        const titleEl = this.$element.querySelector('#task-title')
        const descriptEl = this.$element.querySelector('#task-descript')
        const submitEl = this.$element.querySelector('button')

        submitEl.addEventListener('click', (event) => {
            event.preventDefault()
            if (iconEl.value !== '' || titleEl.value !== '') {
                Database.addTaskItems(
                    iconEl.value,
                    titleEl.value,
                    descriptEl.value
                )
            } else {
                console.log('数据为空')
            }
        })
    },
})

new Loon('develop-card', {
    style: `
        div {
            display: flex;
            flex-direction: column;
            background: var(--prime);
            margin: 16px;
            padding: 16px;
        }
    `,
    struc: `
        <div>
            <button id="clear">清除页面储存</button>
            <button id="save">保存数据到本地</button>
        </div>
    `,
    constructCallback: function () {
        const clearEl = this.$element.querySelector('#clear')
        clearEl.addEventListener('click', Database.clearData)

        const saveEl = this.$element.querySelector('#save')
        saveEl.addEventListener('click', Database.exportDataFile)
    },
})

window.customElements.define('task-card', TaskCard)
