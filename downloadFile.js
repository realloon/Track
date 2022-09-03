// 将传入对象以 json 格式储存
function downloadFile(data) {
    if (!data) return console.error("Don't have data!")

    const element = document.createElement('a')
    const timestamp = new Date().getTime()

    element.setAttribute(
        'href',
        'data:application/json;charset=utf-8,' + JSON.stringify(data)
    )
    element.setAttribute('download', `TrackFile_${timestamp}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}

// 将传入 json 文件读取为对象
function loadFile(file) {
    const reader = new FileReader()
    reader.readAsText(file)

    return new Promise((resolve, reject) => {
        reader.onload = function () {
            resolve(JSON.parse(this.result))
        }
    })
}

export { downloadFile, loadFile }
