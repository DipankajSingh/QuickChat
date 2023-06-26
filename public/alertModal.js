import { giveElement } from "./utilityFunc.js";

const div = giveElement("div", "absolute hidden alertModel top-1/3 rounded-md bg-red-400");
const closeBtn = giveElement("button", "closeBtn rounded-md");
const msgElm = giveElement("p", "text-black rounded-md")
closeBtn.textContent = 'x'
closeBtn.addEventListener('click', () => div.classList.add('hidden'))
document.body.append(div)

export function promptDailog(msg = '') {
    div.classList.remove('hidden')
    msgElm.textContent = msg
    div.append(msgElm, closeBtn)

}