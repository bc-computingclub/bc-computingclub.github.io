let profileCont = document.querySelector(".p-cont") as HTMLElement;
let profileTop = document.querySelector(".p-top") as HTMLElement;
let profileMiddle = document.querySelector(".p-middle") as HTMLElement;
let profileBottom = document.querySelector(".p-bottom") as HTMLElement; // may want to delete the unused lines, not sure which are which

async function genProfile() {
    await loginProm; // Ensures that the user's logged in
    
}