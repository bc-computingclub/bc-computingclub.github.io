import * as a from "../../../../src/lesson";
return [
    new LE_Tasks([
        new T_UseAccent(AccentType.experiment)
    ]),
    new LE_Bubble([
        "Hello!"
    ],[
        new T_UseAccent(AccentType.practice)
    ])
]