import { io, server } from "./connection";

console.log("load");

io.on("connection",e=>{

});

server.listen(3000,()=>{
    console.log('listening on *:3000');
});