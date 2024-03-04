let mainCont = document.querySelector(".main") as HTMLElement;
let pTree = document.querySelector(".p-tree") as HTMLElement;
const panCont = document.querySelector(".pan-cont") as HTMLElement;
// let svgCont = document.querySelector(".pt-svg") as SVGElement;
let cont = document.querySelector(".cont") as HTMLElement;
const ns = "http://www.w3.org/2000/svg";

class LessonTar{
    constructor(tar:string,bendOther=false){
        this.id = tar;
        this.bendOther = bendOther;
    }
    id:string;
    bendOther:boolean;
}
class TreeLesson{
    constructor(name:string,lid:string,x:number,y:number,next:LessonTar[]){
        this.name = name;
        this.lid = lid;
        this.x = x;
        this.y = y;
        this.next = next;
    }
    name:string;
    lid:string;
    x:number;
    y:number;
    next:LessonTar[];
    _x:number;
    _y:number;
}
let progressTree = {
    lessons:[
        new TreeLesson("The First Lesson","0001",-40,-20,[
            new LessonTar("GUR5zKAcaZgObqWk")
        ]),
        new TreeLesson("The Second","GUR5zKAcaZgObqWk",0,0,[
            new LessonTar("_0",true),
            new LessonTar("_1"),
            new LessonTar("_2",false),
        ]),
        new TreeLesson("The Third","_0",-30,40,null),
        new TreeLesson("The Fourth","_1",30,-30,null),

        new TreeLesson("Branch 1","_b1",280,30,null),
        new TreeLesson("Branch 2","_b2",300,50,null),
        new TreeLesson("Branch 3","_b3",310,80,null),
        new TreeLesson("Branch 4","_b4",280,95,null),
        new TreeLesson("555","_2",250,70,[
            new LessonTar("_b1",true),
            new LessonTar("_b2",true),
            new LessonTar("_b3"),
            new LessonTar("_b4"),
        ]),
    ] as TreeLesson[]
};

function loadProgressTree(){
    let cx = pTree.offsetWidth/2;
    let cy = pTree.offsetHeight/2;
    let moveScale = 10;

    let lessonCont = document.createElement("div");
    let lessonGroup = document.createElementNS(ns,"g");
    for(const l of progressTree.lessons){
        let x = cx+l.x*moveScale;
        let y = cy+l.y*moveScale;

        let itemCont = document.createElement("div");
        itemCont.classList.add("item-cont");
        let item = document.createElement("div");
        item.classList.add("circle");
        itemCont.style.left = x+"px";
        itemCont.style.top = y+"px";
        item.innerHTML = `
            <div>${l.name}</div>
        `;
        l._x = x;
        l._y = y;
        
        itemCont.appendChild(item);
        lessonCont.appendChild(itemCont);

        let r = 50;
        if(l.next) setTimeout(()=>{
            for(const tar of l.next){
                let next = progressTree.lessons.find(v=>v.lid == tar.id);
                if(next){
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
                    let centerX = (fx+sx)/2;
                    let centerY = (fy+sy)/2;

                    let x1 = l._x;
                    let y1 = l._y;
                    let x2 = next._x;
                    let y2 = next._y;
                    let dx = x2-x1;
                    let dy = y2-y1;
                    let dist = Math.sqrt(dx**2+dy**2);
                    let dxo = dx;
                    let dyo = dy;
                    // let horz = (Math.abs(dxo) > Math.abs(dyo));
                    let horz = tar.bendOther;
                    dx /= dist;
                    dy /= dist;
                    // if(Math.abs(dx) < Math.abs(dy)) dx = 0;
                    // else dy = 0;
                    // x1 += dx*r;
                    // y1 += dy*r;
                    // x2 -= dx*r;
                    // y2 -= dy*r;
                    if(false){
                        if(dxo > 0 && dyo > 0){
                            if(horz){
                                y2 -= r;
                                x1 += r;
                            }
                            else{
                                y1 += r;
                                x2 -= r;
                            }
                        }
                        if(dxo > 0 && dyo < 0){
                            if(horz){
                                x2 -= r;
                                y1 -= r;
                            }
                            else{
                                x1 += r;
                                y2 += r;
                            }
                        }
                        if(dxo < 0 && dyo > 0){
    
                        }
                        if(dxo < 0 && dyo < 0){
    
                        }
                    }


                    let dashArray = "40,20";
                    // let dashArray = "";

                    // let centerX2 = (x1+x2)/2;
                    // let centerY2 = (y1+y2)/2;
                    // let ang = Math.atan2(dyo,dxo);
                    // let ang = Math.atan2(dyo,dxo)+Math.PI/2;
                    // let tx = Math.cos(ang)*dist/2.8+centerX2;
                    // let ty = Math.sin(ang)*dist/2.8+centerY2;


                    test.style.width = Math.abs(dxo)+"px";
                    test.style.height = Math.abs(dyo)+"px";
                    test.style.left = (sx)+"px";
                    test.style.top = (sy)+"px";
                    // let scale = dxo/(pTree.offsetWidth);
                    // let scale = 1000/Math.abs(dxo)*8;
                    let strokeWidth = "8";
                    let pad = 0; //8
                    let pad2 = 5;

                    function adjust(){
                        sx += pad2;
                        sy += pad2;
                        fx -= pad2;
                        fy -= pad2;
                        if(x1 > x2) x1 -= pad2;
                        else x1 += pad2;
                        if(y1 > y2) y1 -= pad2;
                        else y1 += pad2;
                        if(x2 > x1) x2 -= pad2;
                        else x2 += pad2;
                        if(y2 > y1) y2 -= pad2;
                        else y2 += pad2;
                        return true;
                    }
                    
                    let scale = (Math.abs(dxo)+pad*2)/Math.abs(dxo);

                    test.innerHTML = `
                    <!--<svg viewBox="0 0 ${pTree.offsetWidth} ${pTree.offsetHeight}" xmlns="http://www.w3.org/2000/svg">-->
                    <svg style="transform:scale(${scale});margin-left:${0}px;margin-top:${0}px" viewBox="${sx-pad} ${sy-pad} ${Math.abs(dxo)+pad*2} ${Math.abs(dyo)+pad*2}" xmlns="http://www.w3.org/2000/svg">
        <!-- <path d="M ${sx-r},${sy-r} L ${fx+r},${sy-r} L ${fx+r},${fy+r} L ${sx-r},${fy+r} z" stroke="red" fill="none"/> -->

        
        <!--<path d="M ${x1},${y1} Q ${x1},${centerY} ${centerX},${centerY}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>-->
        <!--<path d="M ${centerX},${centerY} Q ${x2},${centerY} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>-->

        <!--<path d="M ${x1},${y1} Q ${x1},${centerY} ${centerX},${centerY} Q ${x2},${centerY} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>-->

        ${adjust() ? "" : ""}
        ${
            //dxo > 0 && dyo > 0 ? `<path d="M ${x1},${y1} Q ${tx},${ty} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>`:""
            dxo > 0 && dyo > 0 && horz ? `<path d="M ${x1},${y1} Q ${x2},${y1} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>`:
            dxo > 0 && dyo > 0 ? `<path d="M ${x1},${y1} Q ${x1},${y2} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>`:

            dxo > 0 && dyo < 0 && horz ? `<path d="M ${x1},${y1} Q ${x1},${y2} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>`:
            dxo > 0 && dyo < 0 ? `<path d="M ${x1},${y1} Q ${x2},${y1} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>`:

            dxo < 0 && dyo > 0 && horz ? `<path d="M ${x1},${y1} Q ${x2},${y1} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>`:
            dxo < 0 && dyo > 0 ? `<path d="M ${x1},${y1} Q ${x1},${y2} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>`:

            dxo < 0 && dyo < 0 && horz ? `<path d="M ${x1},${y1} Q ${x1},${y2} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>`:
            dxo < 0 && dyo < 0 ? `<path d="M ${x1},${y1} Q ${x2},${y1} ${x2},${y2}" stroke="var(--col)" fill="none" stroke-dasharray="${dashArray}" stroke-linecap="round" stroke-width="${strokeWidth}"/>`:""
        }
    </svg>
                    `;
                    cont.appendChild(test);

                    let arrow = document.createElement("div");
                    arrow.className = "arrow";

                    function updateArrow(){
                        let path = test.querySelector("path");
                        let spot = path.getTotalLength()/2;
                        // let spot = Math.floor(performance.now()/3) % path.getTotalLength(); // animated arrow
                        // spot = Math.floor(spot/60)*60+45+60; // arrow is farther along
                        spot = Math.floor(spot/60)*60+45;
                        let before = path.getPointAtLength(spot-1);
                        let after = path.getPointAtLength(spot+1);
                        let mid = path.getPointAtLength(spot);
                        let lx = after.x-before.x;
                        let ly = after.y-before.y;
                        let ang2 = Math.atan2(ly,lx);
                        arrow.style.left = mid.x+"px";
                        arrow.style.top = mid.y+"px";
                        arrow.style.transform = `translate(-50%,-50%) rotate(${ang2}rad)`;
                    }
                    updateArrow();

                    arrow.innerHTML = `
                        <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 5,5 L 25,25 L 5,45" stroke-width="8" fill="none" stroke="var(--col)" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    `;
                    cont.appendChild(arrow);

                    // function update(){ // <---- for animated arrow
                    //     requestAnimationFrame(update);
                    //     updateArrow();
                    // }
                    // update();
                }
            }
        },0);
    }
    // svg.appendChild(lessonGroup);
    cont.appendChild(lessonCont);
}
loadProgressTree();

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
window.addEventListener("pointerdown",e=>{
    msx = e.clientX;
    msy = e.clientY;
    mlx = msx;
    mly = msy;
    isPanning = true;
});
window.addEventListener("pointerup",e=>{
    isPanning = false;
});
let startTouches:Touch[];
let startTouchDist = 1;
window.addEventListener("touchstart",e=>{
    if(e.touches.length == 2){
        startTouches = [...e.touches];
        let dx = startTouches[1].clientX-startTouches[0].clientX;
        let dy = startTouches[1].clientY-startTouches[0].clientY;
        let dist = Math.sqrt(dx**2+dy**2);
        startTouchDist = dist;
    }
});
window.addEventListener("touchmove",e=>{
    e.preventDefault();
    if(e.touches.length == 1){
        let t = e.touches[0];
        mx = t.clientX;
        my = t.clientY;
    }
    if(e.touches.length == 2){
        let dx = e.touches[1].clientX-e.touches[0].clientX;
        let dy = e.touches[1].clientY-e.touches[0].clientY;
        mx = (e.touches[0].clientX+e.touches[1].clientX)/2;
        my = (e.touches[0].clientY+e.touches[1].clientY)/2;
        let dist = Math.sqrt(dx**2+dy**2);
        let dif = dist-startTouchDist;
        startTouchDist = dist;
        if(Math.abs(dif) > 0) zoomBy(1+dif/300);
    }
    else if(isPanning){
        let t = e.touches[0];
        e.preventDefault();
        let dx = t.clientX-mlx;
        let dy = t.clientY-mly;
        panX += dx;
        panY += dy;
        mlx = t.clientX;
        mly = t.clientY;
        updatePan();
    }
},{
    passive:false
});
window.addEventListener("mousemove",e=>{
    mx = e.clientX;
    my = e.clientY;
    if(isPanning){
        e.preventDefault();
        let dx = e.clientX-mlx;
        let dy = e.clientY-mly;
        panX += dx;
        panY += dy;
        mlx = e.clientX;
        mly = e.clientY;
        updatePan();
    }
});
document.addEventListener("wheel",e=>{
    // let scale = 0.002;
    // let speed = 1;
    let speed = Math.abs(e.deltaY)/500;
    let scale = 1.001+speed; //1.1
    zoomBy(e.deltaY > 0 ? 1/scale : scale);
    // zoomBy(1-e.deltaY*scale);
    // let scale = 0.06;
    // zoomBy(e.deltaY > 0 ? 1-scale : 1+scale);
});
function updatePan(){
    panCont.style.marginLeft = panX+"px";
    panCont.style.marginTop = panY+"px";
    let r = panCont.getBoundingClientRect();
    let _x = r.x+r.width/2;
    let _y = r.y+r.height/2;
    mainCont.style.backgroundPositionX = (_x)+"px";
    mainCont.style.backgroundPositionY = (_y)+"px";
}
function zoomBy(r:number){    
    let szoom = zoom;
    zoom *= r;
    if(zoom < 0.1) zoom = 0.1;
    if(zoom > 5) zoom = 5; //3
    let dif = zoom-szoom;
    let scaleX = panX/innerWidth*dif;
    let scaleY = panY/innerHeight*dif;
    let r1 = panCont.getBoundingClientRect();
    // let scaleX = dif;
    // let scaleY = dif;
    // panX -= innerWidth*scaleX;
    // panY -= innerHeight*scaleY;
    let sw = szoom;
    panCont.style.scale = zoom.toString();
    mainCont.style.backgroundSize = (zoom*2)+"vw";
    let fw = zoom;
    let dw = fw-sw;
    // console.log("SCALE CHANGE:",dw);

    // panX += (panX*r - panX);
    // panY += (panY*r - panY);

    // FINAL!!!
    // panX *= r;
    // panY *= r;

    let r2 = panCont.getBoundingClientRect();

    // let offX = (mx)/innerWidth-0.5;
    // let offX = (mx)/r1.width-0.5;
    // let offY = (my-60)/(innerHeight-60)-0.5;
    // let dif2 = r2.x-r1.x;

    // panX += (innerWidth-r2.right)-(innerWidth-r1.right);
    
    let a1 = r2.width-r1.width;
    let b1 = r2.height-r1.height;
    // let rat = (innerWidth-(r1.x+r1.width/2)) / r1.width - 0.5;

    let cxd = mx-(r1.x+r1.width/2);
    let cyd = my-(r1.y+r1.height/2);
    let cx = cxd/r1.width;
    let cy = cyd/r1.height;
    
    // console.log(rat);
    // console.log(offX+rat);
    // panX -= a1*(offX+rat);
    panX -= a1*cx;
    panY -= b1*cy;

    // let b1 = r2.height-r1.height;
    // panX -= a1*offX;
    // panY -= b1*offY;


    // let amt = (offX*2 * (r2.x-r1.x));
    // console.log(dif2,amt);
    // panX += amt;
    // panY += (offY*2 * (r2.y-r1.y));
    // console.log(offX,offY);

    updatePan();
}

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