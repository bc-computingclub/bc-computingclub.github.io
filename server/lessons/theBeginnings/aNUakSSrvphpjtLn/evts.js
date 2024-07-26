import * as a from "../../../../src/lesson";
return [
    new LE_Tasks([
        new T_UseAccent(AccentType.practice)
    ]),
    new LE_Bubble([
        "Hello!"
    ],[
        new T_UseAccent(AccentType.practice),
        new BubbleTask("Review START"),
        new T_StartReview(),
        new BubbleTask("Review END")
    ])
]