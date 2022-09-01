import Loon from './Loon.js'

const example = new Loon('my-h1', {
    style: `h1 { color: red }`,
    struc: `
        <h1>{{ name }}/{{ age }}/{{ name }}</h1>
    `,
    data: {
        name: 'Loon',
        age: '300',
    },
})

window.example = example
