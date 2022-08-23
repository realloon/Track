let database = localStorage.getItem('database') || {
    背单词: {
        title: '背单词',
        icon: '📖',
        count: 0,
        time: [
            [1661232832157, 1661232838157],
            [1661232232157, 1661232832157],
        ],
    },
    跑步: {
        title: '跑步',
        icon: '🏃',
        count: 0,
        time: [],
    },
}

class TaskCardList extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'closed' })
        this.render()
    }
    render() {
        let innerHTML = ''

        for (const item of Object.keys(database)) {
            innerHTML += `<task-card
                :title="${database[item].title}" 
                :icon="${database[item].icon}" 
                :count="${database[item].count}" 
                :time="${database[item].time}"
            ></task-card>`
        }

        this.shadow.innerHTML = innerHTML
    }
}

class TaskCard extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'closed' })
        let attr = this.attributes
        this._data = {
            title: attr[':title'] ? attr[':title'].value : '事项名称',
            icon: attr[':icon'] ? attr[':icon'].value : '❤️',
            count: attr[':count'] ? attr[':count'].value : 0,
        }
        this.render()

        this.shadow.addEventListener('click', () => {
            console.log(this._data.title + ': ' + this._data.count)
        })
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

                .counter::after {
                    content: '-|-';
                }

                @media (prefers-color-scheme: dark) {
                    .card {
                        background: #1c1c1d;
                        color: #fff;
                    }
                }
            </style>

        <div class="card">
            <span class="icon">${this._data.icon}</span>
            <div class="title">${this._data.title}</div>
            <span class="counter">+${this._data.count}min</span>
            <a href="javascript:;">Add</a>
        </div>
        `
    }
}

class AddCard extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'closed' })
        this.render()
        this.bindEvent()
    }

    render() {
        this.shadow.innerHTML = ``
    }

    bindEvent() {
        const cancel = this.shadow.getElementById('cancel')
        const done = this.shadow.getElementById('done')
        const name = this.shadow.getElementById('task-name')
        const icon = this.shadow.getElementById('task-icon')
        const card = this.shadow.querySelector('.add-card')
        const addBtn = document.getElementById('add-btn')

        function hideCard() {
            card.style.bottom = '-240px'
        }
        function showCard() {
            card.style.bottom = '0'
        }

        addBtn.addEventListener('click', () => {
            const card = document.querySelector('.add-card')
            card.classList.add('round')
        })

        // done.addEventListener('click', () => {
        //     console.log(database)
        //     hideCard()
        // })

        // cancel.addEventListener('click', hideCard)
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

window.customElements.define('task-card', TaskCard)
window.customElements.define('add-card', AddCard)
window.customElements.define('honey-header', HoneyHeader)
window.customElements.define('task-card-list', TaskCardList)
