import * as a from "../../../../../../../src/lesson";
return [
    new LE_Bubble([
        "Problem 2"
    ],[
        new BubbleTask("Task #1"),
        new BubbleTask("Task #2"),
        new AddFileTask("main.css"),
        new AddCode([
            new CP_CSS("body",{
                "background-color":"#333"
            })
        ],null),
        new BubbleTask("Problem 2 Finished!")
    ])
]