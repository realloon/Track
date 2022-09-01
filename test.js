import Loon from './Loon.js'

const example = new Loon('my-h1', {
    style: `h1 { color: red }`,
    struc: `<h1>你好：{{ name }}</h1>`,
    data: {
        name: 'Loon',
        // no: 'xxx'
    },
})

window.example = example