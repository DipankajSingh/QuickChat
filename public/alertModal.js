import { giveElement } from "./utilityFunc.js";

const div = giveElement("div", "absolute hidden alertModel top-1/3 rounded-md bg-red-400");
const closeBtn = giveElement("button", "closeBtn rounded-md");
const msgElm = giveElement("p", "text-white rounded-md")
closeBtn.textContent = 'x'
closeBtn.addEventListener('click', () => div.classList.add('hidden'))
document.body.append(div)

export function promptDailog(msg = '',color="red") {
    div.classList.remove('hidden')
    div.classList.add(`bg-${color}-600`)
    msgElm.textContent = msg
    div.append(msgElm, closeBtn)

}