let mainCont = document.querySelector(".main");
let pTree = document.querySelector(".p-tree");
const panCont = document.querySelector(".pan-cont");
let cont = document.querySelector(".cont");
const ns = "http://www.w3.org/2000/svg";
class LessonTar {
    constructor(tar, bendOther = false) {
        this.id = tar;
        this.bendOther = bendOther;
    }
    id;
    bendOther;
    pathCont;
}
class TreeLesson {
    constructor(name, lid, x, y, next) {
        this.name = name;
        this.lid = lid;
        this.x = x;
        this.y = y;
        this.next = next || [];
        this.prev = [];
    }
    name;
    lid;
    x;
    y;
    next;
    prev;
    _x;
    _y;
    root;
    rootProg;
    animateUnlocks(lids) {
        for (const lid of lids) {
            let l = this.next.find(v => v.id == lid);
            if (!l) {
                console.warn("Err: couldn't find lid to animate unlock");
                continue;
            }
            let to = items.find(v => v.lid == lid);
            if (!to) {
                console.warn("Err: to not found, not good!");
                continue;
            }
            if (to.data.u)
                continue;
            to.data.u = true;
            to.data.n = true;
            to.update();
        }
    }
}
let progressTree_testing = {
    lessons: [
        new TreeLesson("The First Lesson", "0001", -40, -20, [
            new LessonTar("GUR5zKAcaZgObqWk")
        ]),
        new TreeLesson("The Second", "GUR5zKAcaZgObqWk", 0, 0, [
            new LessonTar("_0", true),
            new LessonTar("_1"),
            new LessonTar("_2", false),
        ]),
        new TreeLesson("The Third", "_0", -30, 40, null),
        new TreeLesson("The Fourth", "_1", 30, -30, null),
        new TreeLesson("Branch 1", "_b1", 280, 30, null),
        new TreeLesson("Branch 2", "_b2", 300, 50, null),
        new TreeLesson("Branch 3", "_b3", 310, 80, null),
        new TreeLesson("Branch 4", "_b4", 280, 95, null),
        new TreeLesson("555", "_2", 250, 70, [
            new LessonTar("_b1", true),
            new LessonTar("_b2", true),
            new LessonTar("_b3"),
            new LessonTar("_b4"),
        ]),
    ]
};
let progressTree_client = {
    lessons: [
        new TreeLesson("The First Lesson", "0001", 0, 0, [
            new LessonTar("GUR5zKAcaZgObqWk")
        ]),
        new TreeLesson("The Second", "GUR5zKAcaZgObqWk", 35, 20, [
            new LessonTar("RYRFcZXnLyJJm1Jc", true)
        ]),
        new TreeLesson("The Short Lesson", "RYRFcZXnLyJJm1Jc", 70, 40, []),
    ]
};
function parseProgTree(data) {
    console.log(data);
    let ar = [];
    for (const l of data) {
        let t = new TreeLesson(l.name, l.lid, l.x, l.y, l.links?.map((v) => new LessonTar(v.to, v.flip) ?? []));
        ar.push(t);
    }
    console.log(ar);
    return ar;
}
let openedLessonItems = [];
function closeAllLessonItems() {
    if (!openedLessonItems.length)
        return;
    for (const l of openedLessonItems) {
        l.close();
    }
    openedLessonItems = [];
}
class LessonItem {
    constructor(ldata, e, data) {
        if (data == null)
            data = { lid: ldata.lid, eventI: -1, taskI: -1, prog: 0, mode: 0, wu: "", s: false, n: false, u: false, times: 0, ws: "", hf: false, wls: "" };
        this.lid = ldata.lid;
        this.l = ldata;
        this.e = e;
        this.data = data;
    }
    e;
    l;
    lid;
    data;
    b_start;
    d_actions;
    tmp;
    isHovering;
    close() {
        if (!this.b_start)
            return;
        this.b_start.classList.remove("open");
        this.d_actions.classList.remove("open");
        if (!this.isHovering) {
            this.b_start.textContent = this.tmp;
            this.b_start.classList.remove("material-symbols-outlined");
            if (this.data.s)
                this.b_start.classList.add("percent");
        }
    }
    open() {
        if (!this.b_start)
            return;
        closeAllLessonItems();
        openedLessonItems.push(this);
        this.b_start.classList.add("open");
        this.d_actions.classList.add("open");
        this.b_start.classList.add("material-symbols-outlined");
        this.b_start.classList.remove("percent");
        this.b_start.textContent = "more_horiz";
    }
    addFlag(flag) {
        let cont = this.e.querySelector(".flags");
        if (!cont)
            return;
        let i = ["new", "complete", "inprogress"].indexOf(flag);
        let f = document.createElement("div");
        f.textContent = ["NEW", "COMPLETE", "IN PROGRESS"][i];
        f.className = "item-flag flag-" + flag;
        cont.appendChild(f);
    }
    update() {
        let e = this.e;
        let unlocked = this.data.u;
        if (!unlocked) {
            e.parentElement.classList.add("locked");
            e.classList.add("locked");
        }
        else {
            e.parentElement.classList.remove("locked");
            e.classList.remove("locked");
        }
        if (unlocked)
            e.innerHTML = `
            <div>${this.l.name}</div>
            <div class="btn-start ${this.data.s ? "percent" : "material-symbols-outlined"}">
                ${this.data.s ? this.data.prog + "%" : !this.data.s ? "play_arrow" : "more_horiz"}
            </div>
            <div class="prog-circle">
                <canvas></canvas>
            </div>
            <!--${this.data.s ? `
            <div class="prog-label">
                <span class="material-symbols-outlined" style="font-size:16px;margin-right:5px">check</span>
                <span>${this.data.prog}% Complete</span>
            </div>
            ` : ""}-->
            <div class="flags"></div>
            <div class="item-actions">
                <div>
                    <div>play_arrow</div>
                    <div>Resume</div>
                </div>
                <div>
                    <div>replay</div>
                    <div>Restart</div>
                </div>
                <div>
                    <div>delete</div>
                    <div>Clear</div>
                </div>
            </div>
        `;
        else
            e.innerHTML = `
            <div class="lock-icon material-symbols-outlined">lock</div>
        `;
        let b_start = e.querySelector(".btn-start");
        this.b_start = b_start;
        this.d_actions = e.querySelector(".item-actions");
        if (this.data.n)
            this.addFlag("new");
        if (this.data.s && this.data.prog != 100)
            this.addFlag("inprogress");
        if (b_start)
            if (this.data.s) {
                this.tmp = b_start.textContent;
                b_start.onmouseenter = () => {
                    this.isHovering = true;
                    b_start.classList.add("material-symbols-outlined");
                    b_start.classList.remove("percent");
                    b_start.textContent = (this.data.prog == 100 ? "more_horiz" : "more_horiz"); // play_arrow
                };
                b_start.onmouseleave = () => {
                    this.isHovering = false;
                    if (b_start.classList.contains("open"))
                        return;
                    b_start.classList.remove("material-symbols-outlined");
                    b_start.classList.add("percent");
                    b_start.textContent = this.tmp;
                };
                // if(this.data.prog == 100) this.addFlag("complete"); // not sure if we want complete flags since there may be a bunch of complete missions and it might get cluttered
            }
            else {
                this.tmp = b_start.textContent;
                b_start.onmouseenter = () => {
                    this.isHovering = true;
                    b_start.textContent = "play_arrow";
                };
                b_start.onmouseleave = () => {
                    this.isHovering = false;
                    if (b_start.classList.contains("open"))
                        return;
                    b_start.textContent = this.tmp;
                };
            }
        let can = e.querySelector("canvas");
        if (can) {
            let PI2 = Math.PI * 2 + 0.05; // extra offset so a completed circle is flush
            let tarAng = this.data.prog / 100 * PI2;
            let ang = 0;
            function _update() {
                can.width = 500;
                can.height = 500;
                let ctx = can.getContext("2d");
                let w = 40;
                ctx.lineWidth = w;
                let end = Math.PI / 2;
                let norm = ang / tarAng;
                let speed = 50 * Math.cos((norm - 0.44) * Math.PI * 0.9) * (tarAng / PI2);
                ang += 0.004 * speed;
                end = ang;
                if (ang >= tarAng || ang >= PI2)
                    end = tarAng;
                ctx.strokeStyle = "rgba(0,0,0,0.15)";
                ctx.beginPath();
                ctx.arc(can.width / 2, can.height / 2, can.width / 2 - w, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = "green";
                ctx.beginPath();
                ctx.arc(can.width / 2, can.height / 2, can.width / 2 - w, 0, end);
                ctx.stroke();
                if (ang >= tarAng || ang >= PI2)
                    return;
                requestAnimationFrame(_update);
            }
            _update();
        }
        if (b_start)
            b_start.addEventListener("click", e => {
                if (!this.data.s) {
                    socket.emit("startLesson", this.lid, 0, (data) => {
                        console.log("RES: ", data);
                        if (data != 0) {
                            alert(`Error ${data} trying to start lesson`);
                            return;
                        }
                        localStorage.setItem("cc-lastLID", this.lid);
                        location.href = "/learn/lesson/index.html?lid=" + this.lid;
                    });
                    return;
                }
                if (b_start.classList.contains("open"))
                    this.close();
                else
                    this.open();
            });
        if (this.d_actions) {
            this.d_actions.children[0].addEventListener("click", e => {
                let mode = 0; // Lesson Mode [lesson, review]
                socket.emit("startLesson", this.lid, mode, (data) => {
                    if (data != 0) {
                        alert(`Error ${data}: while trying to start lesson`);
                        return;
                    }
                    location.href = "/learn/lesson/index.html?lid=" + this.lid;
                });
            });
            this.d_actions.children[1].addEventListener("click", e => {
                new ConfirmMenu("Reset Progress", `Are you sure you want<br> to reset lesson progress for "${this.l.name}" ?`, () => {
                    socket.emit("restartLessonProgress", this.lid, (data) => {
                        if (data == 0) {
                            this.resetProgress();
                        }
                        else {
                            alert("Err: while restarting lesson progress, error code: " + data);
                        }
                    });
                }, () => { }).load();
            });
            this.d_actions.children[2].addEventListener("click", e => {
                new ConfirmMenu("Delete Progress", `Are you sure you want<br> to delete lesson progress for "${this.l.name}" ?`, () => {
                    socket.emit("deleteLessonProgress", this.lid, (data) => {
                        if (data == 0) {
                            this.deleteProgress();
                        }
                        else {
                            alert("Err: while deleting lesson progress, error code: " + data);
                        }
                    });
                }, () => { }).load();
            });
        }
    }
    init() {
        let e = this.e;
        let list = this.l.next.concat(this.l.prev);
        // if(_loadLastLID == this.lid){
        //     panX = this.l.x; // idk the formula for this
        //     panY = this.l.y;
        //     zoom = 1;
        //     updatePan();
        //     zoomBy(1);
        // }
        if (false)
            for (const tar of list) { // on hover
                let pc = tar.pathCont;
                if (!pc)
                    continue;
                e.addEventListener("mouseenter", e => {
                    pc.classList.add("hov");
                });
                e.addEventListener("mouseleave", e => {
                    pc.classList.remove("hov");
                });
            }
    }
    deleteProgress() {
        this.data.eventI = -1;
        this.data.taskI = -1;
        this.data.prog = 0;
        this.data.s = false;
        this.update();
    }
    resetProgress() {
        console.log(this);
        this.data.eventI = -1;
        this.data.taskI = -1;
        this.data.prog = 0;
        this.data.s = true;
        this.update();
        console.log(this);
    }
}
let items = [];
async function loadProgressTree() {
    let cx = pTree.offsetWidth / 2;
    let cy = pTree.offsetHeight / 2;
    let moveScale = 10;
    // User Data
    // let progress = [
    //     {
    //         id:"0001", // lid
    //         prog:23.5, // progress percentage
    //         u:true // unlocked
    //     },
    //     {
    //         id:"GUR5zKAcaZgObqWk",
    //         prog:0,
    //         u:true,
    //         n:true
    //     },
    //     {
    //         id:"_0",
    //         prog:100,
    //         u:true
    //     }
    // ] as ProgressData[];
    let progressTree = await new Promise(resolve => {
        socket.emit("getProgressTree", "theBeginnings", (data) => {
            if (typeof data == "number" || data == null) {
                alert(`Error ${data} while trying to get progress tree`);
                return;
            }
            resolve(parseProgTree(data));
        });
    });
    let progress = await new Promise(resolve => {
        socket.emit("getLearnData", (data) => {
            if (typeof data == "number") {
                alert(`Error ${data}: failed to retrieve learn progress`);
                return;
            }
            let ar = [];
            let ok = Object.keys(data);
            for (const key of ok) {
                let v = data[key];
                if (!v)
                    continue;
                v.lid = key;
                ar.push(v);
            }
            resolve(ar);
        });
    });
    for (const l of progressTree) {
        l.root = progressTree;
        l.rootProg = progress;
    }
    let lessonCont = document.createElement("div");
    for (const l of progressTree) {
        let pdata = progress.find(v => v.lid == l.lid);
        console.log(pdata);
        let x = cx + l.x * moveScale;
        let y = cy + l.y * moveScale;
        let itemCont = document.createElement("div");
        itemCont.classList.add("item-cont");
        let item = document.createElement("div");
        item.classList.add("circle");
        itemCont.style.left = x + "px";
        itemCont.style.top = y + "px";
        l._x = x;
        l._y = y;
        itemCont.addEventListener("mouseenter", e => {
            canPan = false;
        });
        itemCont.addEventListener("mouseleave", e => {
            canPan = true;
        });
        itemCont.appendChild(item);
        lessonCont.appendChild(itemCont);
        let ref = new LessonItem(l, item, pdata);
        items.push(ref);
        ref.update();
        if (ref.data.hf) {
            setTimeout(() => {
                socket.emit("postFinishLesson", "theBeginnings", ref.lid, (data) => {
                    console.log("data: ", data);
                    if (data == 0)
                        return;
                    if (typeof data == "number" || data == null) {
                        alert(`Error ${data} while post finishing lesson`);
                        return;
                    }
                    l.animateUnlocks(data);
                });
            }, 1000);
        }
        let r = 50;
        if (l.next)
            setTimeout(() => {
                for (const tar of l.next) {
                    let next = progressTree.find(v => v.lid == tar.id);
                    next.prev.push(tar);
                    if (next) {
                        let test = document.createElement("div");
                        test.classList.add("test");
                        let sx = 0;
                        let sy = 0;
                        let fx = 0;
                        let fy = 0;
                        let pointsX = [
                            l._x,
                            next._x
                        ];
                        let pointsY = [
                            l._y,
                            next._y
                        ];
                        sx = Math.min(...pointsX);
                        sy = Math.min(...pointsY);
                        fx = Math.max(...pointsX);
                        fy = Math.max(...pointsY);
                        let centerX = (fx + sx) / 2;
                        let centerY = (fy + sy) / 2;
                        let x1 = l._x;
                        let y1 = l._y;
                        let x2 = next._x;
                        let y2 = next._y;
                        let dx = x2 - x1;
                        let dy = y2 - y1;
                        let dist = Math.sqrt(dx ** 2 + dy ** 2);
                        let dxo = dx;
                        let dyo = dy;
                        let horz = tar.bendOther;
                        dx /= dist;
                        dy /= dist;
                        let dashArray = "40,20";
                        test.style.width = Math.abs(dxo) + "px";
                        test.style.height = Math.abs(dyo) + "px";
                        test.style.left = (sx) + "px";
                        test.style.top = (sy) + "px";
                        let strokeWidth = "8";
                        let pad = 0; //8
                        let pad2 = 5;
                        function adjust() {
                            sx += pad2;
                            sy += pad2;
                            fx -= pad2;
                            fy -= pad2;
                            if (x1 > x2)
                                x1 -= pad2;
                            else
                                x1 += pad2;
                            if (y1 > y2)
                                y1 -= pad2;
                            else
                                y1 += pad2;
                            if (x2 > x1)
                                x2 -= pad2;
                            else
                                x2 += pad2;
                            if (y2 > y1)
                                y2 -= pad2;
                            else
                                y2 += pad2;
                            return true;
                        }
                        let scale = (Math.abs(dxo) + pad * 2) / Math.abs(dxo);
                        test.innerHTML = `
                    <!--<svg viewBox="0 0 ${pTree.offsetWidth} ${pTree.offsetHeight}" xmlns="http://www.w3.org/2000/svg">-->
                    <svg style="transform:scale(${scale});margin-left:${0}px;margin-top:${0}px" viewBox="${sx - pad} ${sy - pad} ${Math.abs(dxo) + pad * 2} ${Math.abs(dyo) + pad * 2}" xmlns="http://www.w3.org/2000/svg">
        <!-- <path d="M ${sx - r},${sy - r} L ${fx + r},${sy - r} L ${fx + r},${fy + r} L ${sx - r},${fy + r} z" stroke="red" fill="none"/> -->

        
        <!--<path d="M ${x1},${y1} Q ${x1},${centerY} ${centerX},${centerY}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>-->
        <!--<path d="M ${centerX},${centerY} Q ${x2},${centerY} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>-->

        <!--<path d="M ${x1},${y1} Q ${x1},${centerY} ${centerX},${centerY} Q ${x2},${centerY} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>-->

        ${adjust() ? "" : ""}
        ${
                        //dxo > 0 && dyo > 0 ? `<path d="M ${x1},${y1} Q ${tx},${ty} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>`:""
                        dxo > 0 && dyo > 0 && horz ? `<path d="M ${x1},${y1} Q ${x2},${y1} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>` :
                            dxo > 0 && dyo > 0 ? `<path d="M ${x1},${y1} Q ${x1},${y2} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>` :
                                dxo > 0 && dyo < 0 && horz ? `<path d="M ${x1},${y1} Q ${x1},${y2} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>` :
                                    dxo > 0 && dyo < 0 ? `<path d="M ${x1},${y1} Q ${x2},${y1} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>` :
                                        dxo < 0 && dyo > 0 && horz ? `<path d="M ${x1},${y1} Q ${x2},${y1} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>` :
                                            dxo < 0 && dyo > 0 ? `<path d="M ${x1},${y1} Q ${x1},${y2} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>` :
                                                dxo < 0 && dyo < 0 && horz ? `<path d="M ${x1},${y1} Q ${x1},${y2} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>` :
                                                    dxo < 0 && dyo < 0 ? `<path d="M ${x1},${y1} Q ${x2},${y1} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>` : ""}
    </svg>
                    `;
                        let pathCont = document.createElement("div");
                        pathCont.className = "path-cont";
                        cont.appendChild(pathCont);
                        tar.pathCont = pathCont;
                        pathCont.appendChild(test);
                        let arrow = document.createElement("div");
                        arrow.className = "arrow";
                        function updateArrow() {
                            let path = test.querySelector("path");
                            let spot = path.getTotalLength() / 2;
                            // let spot = Math.floor(performance.now()/3) % path.getTotalLength(); // animated arrow
                            // spot = Math.floor(spot/60)*60+45+60; // arrow is farther along
                            spot = Math.floor(spot / 60) * 60 + 45;
                            let before = path.getPointAtLength(spot - 1);
                            let after = path.getPointAtLength(spot + 1);
                            let mid = path.getPointAtLength(spot);
                            let lx = after.x - before.x;
                            let ly = after.y - before.y;
                            let ang2 = Math.atan2(ly, lx);
                            arrow.style.left = mid.x + "px";
                            arrow.style.top = mid.y + "px";
                            arrow.style.transform = `translate(-50%,-50%) rotate(${ang2}rad)`;
                        }
                        updateArrow();
                        arrow.innerHTML = `
                        <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 5,5 L 25,25 L 5,45" stroke-width="8" fill="none" stroke="var(--col)" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    `;
                        pathCont.appendChild(arrow);
                        // function update(){ // <---- for animated arrow
                        //     requestAnimationFrame(update);
                        //     updateArrow();
                        // }
                        // update();
                    }
                }
            }, 0);
    }
    cont.appendChild(lessonCont);
    setTimeout(() => {
        for (const ref of items) {
            ref.init();
        }
    }, 50);
}
// Back pan blocking
let canPan = true;
// const back = document.querySelector(".back");
// back.addEventListener("mousemove",e=>{
//     canPan = true;
// });
// back.addEventListener("mouseleave",e=>{
//     canPan = false;
// });
// Nav
let msx = 0; // mouse start x
let msy = 0;
let mlx = 0; // mouse last x
let mly = 0;
let isPanning = false;
let panX = 0;
let panY = 0;
let zoom = 1;
let mx = 0;
let my = 0;
window.addEventListener("pointerdown", e => {
    msx = e.clientX;
    msy = e.clientY;
    mlx = msx;
    mly = msy;
    if (canPan) {
        if (menusOpen.length)
            return;
        isPanning = true;
        closeAllLessonItems();
    }
});
window.addEventListener("pointerup", e => {
    if (isPanning) {
        if (localStorage.getItem("cc-lastLID"))
            localStorage.removeItem("cc-lastLID");
        localStorage.setItem("cc-panX", (panX || 0).toString());
        localStorage.setItem("cc-panY", (panY || 0).toString());
        localStorage.setItem("cc-zoom", (zoom || 1).toString());
    }
    isPanning = false;
});
let startTouches;
let startTouchDist = 1;
window.addEventListener("touchstart", e => {
    if (canPan)
        if (e.touches.length == 2) {
            startTouches = [...e.touches];
            let dx = startTouches[1].clientX - startTouches[0].clientX;
            let dy = startTouches[1].clientY - startTouches[0].clientY;
            let dist = Math.sqrt(dx ** 2 + dy ** 2);
            startTouchDist = dist;
        }
});
window.addEventListener("touchmove", e => {
    e.preventDefault();
    if (e.touches.length == 1) {
        let t = e.touches[0];
        mx = t.clientX;
        my = t.clientY;
    }
    if (e.touches.length == 2) {
        let dx = e.touches[1].clientX - e.touches[0].clientX;
        let dy = e.touches[1].clientY - e.touches[0].clientY;
        mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        let dist = Math.sqrt(dx ** 2 + dy ** 2);
        let dif = dist - startTouchDist;
        startTouchDist = dist;
        if (Math.abs(dif) > 0)
            zoomBy(1 + dif / 300);
    }
    else if (isPanning) {
        let t = e.touches[0];
        e.preventDefault();
        let dx = t.clientX - mlx;
        let dy = t.clientY - mly;
        panX += dx;
        panY += dy;
        mlx = t.clientX;
        mly = t.clientY;
        updatePan();
    }
}, {
    passive: false
});
window.addEventListener("mousemove", e => {
    mx = e.clientX;
    my = e.clientY;
    if (isPanning) {
        e.preventDefault();
        let dx = e.clientX - mlx;
        let dy = e.clientY - mly;
        panX += dx;
        panY += dy;
        mlx = e.clientX;
        mly = e.clientY;
        updatePan();
    }
});
document.addEventListener("wheel", e => {
    if (menusOpen.length)
        return;
    e.preventDefault();
    let speed = Math.abs(e.deltaY) / 500;
    let scale = 1.001 + speed; //1.1
    zoomBy(e.deltaY > 0 ? 1 / scale : scale);
}, { passive: false });
function updatePan() {
    panCont.style.marginLeft = panX + "px";
    panCont.style.marginTop = panY + "px";
    let r = panCont.getBoundingClientRect();
    let _x = r.x + r.width / 2;
    let _y = r.y + r.height / 2;
    mainCont.style.backgroundPositionX = (_x) + "px";
    mainCont.style.backgroundPositionY = (_y) + "px";
}
function zoomBy(r) {
    zoom *= r;
    if (zoom < 0.1)
        zoom = 0.1;
    if (zoom > 5)
        zoom = 5; //3
    let r1 = panCont.getBoundingClientRect();
    panCont.style.scale = zoom.toString();
    mainCont.style.backgroundSize = (zoom * 2) + "vw";
    // FINAL!!! (for center zooming only)
    // panX *= r;
    // panY *= r;
    let r2 = panCont.getBoundingClientRect();
    let a1 = r2.width - r1.width;
    let b1 = r2.height - r1.height;
    let cxd = mx - (r1.x + r1.width / 2);
    let cyd = my - (r1.y + r1.height / 2);
    let cx = cxd / r1.width;
    let cy = cyd / r1.height;
    panX -= a1 * cx;
    panY -= b1 * cy;
    updatePan();
    _locNeedsSaved = true;
}
let _locNeedsSaved = false;
function zoomToSimple(z) {
    zoom = z;
    if (zoom < 0.1)
        zoom = 0.1;
    if (zoom > 5)
        zoom = 5; //3
    panCont.style.scale = zoom.toString();
    mainCont.style.backgroundSize = (zoom * 2) + "vw";
}
async function initLearnPage() {
    await loginProm;
    if (!g_user) {
        alertNotLoggedIn();
        return;
    }
    loadProgressTree();
}
initLearnPage();
panX = parseFloat(localStorage.getItem("cc-panX")) || 0;
panY = parseFloat(localStorage.getItem("cc-panY")) || 0;
zoom = parseFloat(localStorage.getItem("cc-zoom")) || 1;
zoomToSimple(zoom);
let _loadLastLID = localStorage.getItem("cc-lastLID");
updatePan();
setInterval(() => {
    if (_locNeedsSaved) {
        localStorage.setItem("cc-panX", (panX || 0).toString());
        localStorage.setItem("cc-panY", (panY || 0).toString());
        localStorage.setItem("cc-zoom", (zoom || 1).toString());
    }
}, 500);
function resetView() {
    panX = 0;
    panY = 0;
    updatePan();
    zoomToSimple(1);
    _locNeedsSaved = true;
}
const b_viewOptions = document.querySelector(".view-options");
b_viewOptions.addEventListener("mousedown", e => {
    let list = [
        "Reset Camera/View"
    ];
    openDropdown(b_viewOptions, () => list, i => {
        if (i == 0) {
            resetView();
        }
        closeAllSubMenus();
    });
});
// 1 -> 2
// spx: -1380.0000610351562
// fpx: -1518 (about)
// change: 0.035049389948139276
// dpx: -137.99993896484375
// r: -4.836813673598228
// myst: 2.834
// 2 -> 3
// spx: -1518
// fpx: -1670 (about)
// change: 0.03855432894295319
// dpx: -152
// r: -5.860257999328884
// mystery: 2.6 (spx*change*myst = dpx)
// 
// panCont gbcr width
// 1: 748.8003540039062 = a
// 2: 680.7275390625 = b
// 3: 618.84326171875 = c
// !!!
// a * change(1 -> 2) = 26.244995600787643 = mr (myst ratio)
// b * change(2 -> 3) = 26.244993461542638
// !
// dpx(1 -> 2)*change(1 -> 2) - change(2 -> 3)*mr = dpx(2 -> 3)*change(2 -> 3)
// n = where you are now
// n+1 = where you want to go
// VAL = ( dpx(n-1 -> n)*change(n-1 -> n) - change(n -> n+1)*mr ) / change(n -> n+1)
// dpx*1.1 = (dpx*change - change*1.1*mr) / (change*1.1)
// NEW
// (b-a)/dpx*0.1 = -0.0365165047742913 (could be the same as change from 1 -> 2?)
// dpx/(b-a)/0.1 = -27.384877226914373 (could be related to mr)
// NEW 2
// dpx = (36.475/1.1)-4
// dpx = ((r2.x-r.x)/2/1.1)-4
// FINALLYYYYYYY
// dpx = (px*1.1 - px)
// panX += (panX*1.1-panX);
///////////////////////
// 1: -73
// 2: -153.5 (80.3)
// 3: -242 (88.5))
// 4: -339 (97)
//# sourceMappingURL=learn.js.map