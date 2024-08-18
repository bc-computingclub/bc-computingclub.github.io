import * as a from "../../../../../../../src/lesson";
return [
    new LE_Bubble([
        "Loaded Main_0"
    ],[
        new BubbleTask("This is bubble #2"),
        new BubbleTask("This is bubble #3"),
        new AddCode([
            new CP_HTML("head",true,true)
        ]),
        new BubbleTask("bob"),
    ])
]