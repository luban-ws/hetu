export function isSSH(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return false;
    } else {
        return true;
    }
}

export default {
    isSSH
}