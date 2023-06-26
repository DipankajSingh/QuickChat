// again some utility functions 
export function $(selector = 'body') {
    const e = document.querySelectorAll(selector)
    if (e.length == 1) return e[0]
    if (e.length > 1) return e
}
export function giveElement(tagName = 'div', classList = '', appendElm = '') {
    const elm = document.createElement(tagName)
    classList = classList.split(" ")
    if (classList != '') elm.classList.add(...classList)
    if (appendElm != '') elm.append(appendElm)
    return elm
}
export function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
export function hasWhiteSpace(s = 'hello there') {
    return s.indexOf(' ') >= 0;
}
export function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
export function checkCookie() {
    let user = getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
    }
}
export function delete_cookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export function randomId() {
    let currentDate = new Date()
    return currentDate.getTime()
}

export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getCurrentTime(date = new Date()) {
    let now = new Date(date);
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let period = hours >= 12 ? "PM" : "AM";
    hours = (hours % 12) || 12;
    let timeString = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + " " + period;
    return timeString;
}