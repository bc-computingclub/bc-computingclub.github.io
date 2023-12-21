function wait(delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}
// callouts
const callouts = document.querySelectorAll(".callout");
//# sourceMappingURL=util.js.map