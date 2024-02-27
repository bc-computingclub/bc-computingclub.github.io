let markAllDone = document.querySelector(".mark-all-done");
let addNewTask = document.querySelector(".add-task");
let taskContainer = document.querySelector(".task-container");
let numTasks = 0;

let taskArray = [
    { taskDescription: `Click the checkboxes to mark a task as completed` },
    { taskDescription: `Click the "+" to add a new task` },
    { taskDescription: `Click "Mark all done" to mark all tasks as completed` }
]

window.onload = () => {
    taskArray.forEach((task) => {
        taskContainer.append(getTaskObject(task.taskDescription));
        numTasks++;
    });
}

addNewTask.addEventListener("click", () => {
    let newTaskDesc = prompt("Enter a name for your new task: ");
    if(numTasks == 0) taskContainer.removeChild(taskContainer.firstChild);
    taskContainer.append(getTaskObject(newTaskDesc));
    numTasks++;
})

function getTaskObject(taskDesc) {
    let temp = document.createElement("div");
    temp.className = "task"
    temp.innerHTML = `            
        <span>${taskDesc}</span>
        <input type="checkbox">
    `;
    return temp;
}

taskContainer.addEventListener("click",  (event) => {
    let checkedbox = document.querySelector('.task input[type="checkbox"]:checked');
    if(checkedbox) {
        checkedbox.parentElement.remove();
        numTasks--;
    }
    if(numTasks == 0) {
        let temp = document.createElement("i");
        temp.innerHTML = `<i>There are currently no tasks. Click the "+" to add a new one!</i>`;
        taskContainer.append(temp);
    }
});

markAllDone.addEventListener("click", () => {
    let boxes = taskContainer.querySelectorAll('input[type="checkbox"]');
    boxes.forEach((box) => {
       box.parentElement.remove(); 
    });
    numTasks = 0;
    if(taskContainer.firstChild) taskContainer.removeChild(taskContainer.firstChild);
    let temp = document.createElement("i");
    temp.innerHTML = `<i>There are currently no tasks. Click the "+" to add a new one!</i>`;
    taskContainer.append(temp);
});