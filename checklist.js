function example() {
    return `
# Review BACKEND

*
Block for checklist
*

. # Checklist name
. . Comment inside the checklist (does not reflect for rendering)
. -- Section
. - Paragraph
. * * A description block that applies to both the entire checklist and its sections and items. The relationship is determined by the previous ancestor.

-- Controller
*
Block for section
*
- Swagger annotations for @Api controller
*
Block for item
*
+ Swagger annotations for @ApiOperation method
- Required rights are set for endpoints
- Endpoint API is described according to the REST API standard

-- Architecture
- Location of classes in packages
*
Example block
*

-- Code
- Exceptions are logged with the triggered exception
+ Exception rethrow contains the source exception
- Text in exceptions is clear
- Variables are named clearly

-- Tests
- Written tests for validators
- Written tests for services
`.trim()
}

function parseCheckListFromSimpleText(text) {
    let textLines = text.split("\n")
    let checkList = {title: null, items: [], blocks: []}
    let currentSection = null
    let currentItem = null

    let isStartBlock = false
    let textBlock = ""

    textLines.forEach(function callback(currentValue, index, array) {
        // если блок начался, добавляем всё как есть
        if (isStartBlock) {
            textBlock = textBlock + "\n" + currentValue
        }

        // поиск и установка заголовка
        if (currentValue.startsWith("#")) {
            checkList.title = currentValue.substring(1).trim()
        }

        if (currentValue.startsWith("--")) { // поиск и установка секции
            let textItem = currentValue.substring(2).trim()
            currentItem = null
            currentSection = createCheckListItem(textItem)
            checkList.items.push(currentSection)
        } else if (currentValue.trim().startsWith("-")) { // поиск и установка невыполненного пункта
            let textItem = currentValue.trim().substring(1).trim()

            const newItem = createCheckListItem(textItem)
            if (currentSection !== null) {
                currentSection.items.push(newItem)
                currentItem = newItem
            } else {
                checkList.items.push(newItem)
            }
        } else if (currentValue.trim().startsWith("+")) { // поиск и установка выполненного пункта
            let textItem = currentValue.trim().substring(1).trim()

            const newItem = createCheckListItem(textItem, true)
            if (currentSection !== null) {
                currentItem.items.push(newItem)
                currentItem = newItem
            } else {
                checkList.items.push(newItem)
            }
        }

        if (currentValue.startsWith("*")) { // поиск и идентификация блока
            if (isStartBlock) {
                let block = textBlock.substring(0, textBlock.length - 1).trim()
                if (currentItem !== null) {
                    currentItem.blocks.push(block)
                } else if (currentSection !== null) {
                    currentSection.blocks.push(block)
                } else {
                    checkList.blocks.push(block)
                }
                isStartBlock = false
                textBlock = ""
            } else {
                isStartBlock = true
            }
        }
    })

    return checkList
}

function createCheckListItem(text, isComplete = false) {
    return {text: text, isComplete: isComplete, items: [], blocks: []}
}

function toPlainTextFromBase64(base64) {
    return Base64.decode(base64)
}


function generateLink(plainText) {
    const base64 = toBase64FromPlainText(plainText)
    const link = window.location.origin + window.location.pathname

    console.log(window.location)
    return link + '?base64=' + base64
}

// Кодировать нужно с помощью: Base64.encode(utf8, true)
function toBase64FromPlainText(plainText) {
    return Base64.encode(plainText, true)
}

// // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
// function toPlainTextFromBase64(base64) {
//     const binary = atob(base64);
//     const bytes = new Uint8Array(binary.length);
//     for (let i = 0; i < bytes.length; i++) {
//         bytes[i] = binary.charCodeAt(i);
//     }
//     return String.fromCharCode(...new Uint16Array(bytes.buffer));
// }
