// 将传入对象以 json 格式储存
export default function downloadFile(data) {
    if (!data) return console.error("Don't have data!")

    const element = document.createElement('a')
    const timestamp = new Date().getTime()

    element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + JSON.stringify(data)
    )
    element.setAttribute('download', `TrackFile_${timestamp}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}
