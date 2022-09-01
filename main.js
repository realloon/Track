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

    static set data(value) {
        this._data = value
        this.saveData()
        // FIXME: 不应该这样
        location.reload()
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
        const addItems = {
            title: title,
            icon: icon,
            descript: descript,
            time: [[0, 0]],
        }

        this.data[title] = addItems
        // 强制触发 setter
        this.data = this.data
    }

    static exportDataFile() {
        ;(async () => {
            const downloadFile = (await import('./downloadFile.js')).default
            downloadFile(Database.data)
        })()
    }

    static importDataFile(file) {
        const reader = new FileReader()
        reader.readAsText(file)

        reader.onload = function () {
            const obj = JSON.parse(this.result)
            Database.data = obj
        }
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

new Loon('track-h2', {
    style: `
        h2 {
            font-size: 1.125rem;
            line-height: 1em;
            color: var(--font-color);
            margin: 1.5rem 0 -0.5rem 1rem;
        }
    `,
    struc: `
        <h2>{{ title }}</h2>
    `,
    observe: ['title'],
})

new Loon('track-header', {
    struc: `
        <header>
            <h1>{{ title }}</h1>
        </header>
    `,
    style: `
        header {
            z-index: 20;
            background: var(--app-ground);
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

new Loon('extract-card', {
    struc: `
        <track-h2 data-title="总览"></track-h2>

        <div class="card">
            <div>
                <h3>今日专注时长</h3>
                <p class="theme">{{ currentCount }}/{{ totalCount }}min</p>
                <h3>专注事项</h3>
                <p>{{ tasks }}</p>
            </div>

            <track-ring data-rate="80"></track-ring>
        </div>
    `,
    style: `
        .card {
            border-radius: var(--borad-radius);
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin: 16px;
            padding: 16px;
            background: var(--controls-ground);
            color: var(--font-color);
        }

        h3,
        p {
            font-size: initial;
            margin: 0;
            line-height: 1em;
        }

        h3 {
            margin-top: .8rem;
        }
        h3:first-child {
            margin-top: 0;
        }

        p {
            margin-top: .25rem;
            font-weight: bold;
            color: var(--gray-font-color);
        }

        .theme {
            color: var(--theme-color);
        }
    `,
    data: {
        currentCount: 80,
        totalCount: 120,
        tasks: 4,
    },
})

new Loon('track-ring', {
    struc: `
        <svg xmlns="http://www.w3.org/200/svg" height="100" width="100">
            <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f4433650"
                stroke-width="16"
                stroke-linecap="round"
            />
            <circle
                id="ring"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--theme-color)"
                stroke-width="16"
                stroke-dasharray="0,10000"
            />
        </svg>
    `,
    style: `
        #ring {
            transform-origin: center;
            transform: rotate(-90deg);
            transition: stroke-dasharray .5s ease-out;
        }
    `,
    observe: ['rate'],
    customCallback: function () {
        ;(function initRingRate(instantiat) {
            const rateCache = instantiat.data.rate
            instantiat.data.rate = 0
            setTimeout(() => (instantiat.data.rate = rateCache))
        })(this)
    },
    attributeChangedCallback: function () {
        const ringEl = this.$shadowRoot.querySelector('#ring')
        const r = ringEl.getAttribute('r')
        const circleLength = Math.floor(2 * Math.PI * r)

        function rotateCircle(rate = 0) {
            const value = (circleLength * rate) / 100
            ringEl.setAttribute('stroke-dasharray', `${value},${circleLength}`)
        }

        rotateCircle(this.data.rate)
    },
})

new Loon('task-list', {
    data: {
        title: '项目',
        list: Database.data,
    },
    struc: `
        <track-h2 data-title="项目"></track-h2>
    `,
    customCallback: function () {
        const array = []

        for (const key of Object.keys(this.data.list)) {
            array.push(`<task-card data-key="${key}">hello</task-card>`)
        }

        this.$shadowRoot.innerHTML += array.join('')
    },
})

new Loon('add-card', {
    style: `
        form {
            display: flex;
            flex-direction: column;
            padding: 16px;
            margin: 16px;
            background: var(--controls-ground);
            border-radius: var(--borad-radius);
            color: var(--font-color);
        }

        .row {
            display: flex;
            align-content: center;
            align-items: baseline;
            margin-bottom: .5rem;
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
            margin: 1rem 0 0 auto;
        }

        #task-icon {
            width: 2.5em;
            text-align: center;
            margin-right: 16px;
        }
    `,
    struc: `
        <track-h2 data-title="添加新任务"></track-h2>
        
        <form action="./test" method="post">
            <div class="row">
                <input
                    type="text"
                    name="task-icon"
                    id="task-icon"
                    value="🏃"
                /><input
                    type="text"
                    name="task-title"
                    id="task-title"
                    value="跑步"
                />
            </div>
            <label for="task-descript">描述</label>
            <input type="text" name="task-descript" id="task-descript" />
            <button type="submit">保存</button>
        </form>
    `,
    customCallback: function () {
        const iconEl = this.$shadowRoot.querySelector('#task-icon')
        const titleEl = this.$shadowRoot.querySelector('#task-title')
        const descriptEl = this.$shadowRoot.querySelector('#task-descript')
        const submitEl = this.$shadowRoot.querySelector('button')

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
        :host {
            display: flex;
            flex-direction: column;
            background: var(--controls-ground);
            color: var(--font-color);
            margin-top: 32px;
            padding: 16px;
            font-size: 14px;
        }

        label {
            color: var(--font-color);
        }

        h2 {
            font-size: 1rem;
            margin: 0 0 .5rem 0;
            color: var(--font-color);
            font-family: serif;
        }

        button {
            display: block;
            margin-bottom: 1rem;
        }
    `,
    struc: `
            <h2>⚠️ Developer Setting</h3>
            <button id="save">保存数据库到本地</button>
            <button id="clear">清除页面储存</button>
            <label>
                <input type="file" id="file" />
            </label>
    `,
    customCallback: function () {
        const clearEl = this.$shadowRoot.querySelector('#clear')
        clearEl.addEventListener('click', Database.clearData)

        const saveEl = this.$shadowRoot.querySelector('#save')
        saveEl.addEventListener('click', Database.exportDataFile)

        const fileEl = this.$shadowRoot.querySelector('#file')
        fileEl.addEventListener('change', fileHandle)

        function fileHandle() {
            const file = this.files[0]
            Database.importDataFile(file)
        }
    },
})

window.customElements.define('task-card', TaskCard)
