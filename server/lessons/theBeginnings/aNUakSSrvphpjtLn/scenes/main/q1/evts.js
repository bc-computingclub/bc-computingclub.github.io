import * as a from "../../../../../../../src/lesson";
return [
    new LE_Bubble([],[
        new AddQuizQuestion({
            question:"What is the purpose of the `<title>` element in an HTML document?",
            options:[
                { l:"To define the main heading of the page" },
                { l:"To specify the title of the document shown in the browser's title bar or tab", correct:true },
                { l:"To link a CSS file to the HTML document" },
                { l:"To create a button element with a specific title" },
            ]
        }),
        new ValidateCode([
            new VP_QuizAns("q0")
        ])
    ])
]