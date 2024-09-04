import * as a from "../../../../../../../src/lesson";
return [
    new LE_Bubble([],[
        new AddQuizQuestion({
            question:"Ignoring any CSS, which of the following elements would appear larger than an `<h3>` element?",
            options:[
                { l:"<p>" },
                { l:"<h5>" },
                { l:"<h2>", correct:true },
                { l:"<u>" },
            ]
        }),
        new ValidateCode([
            new VP_QuizAns("q0")
        ])
    ])
]