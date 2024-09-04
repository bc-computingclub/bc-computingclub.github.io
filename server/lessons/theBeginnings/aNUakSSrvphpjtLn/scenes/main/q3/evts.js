import * as a from "../../../../../../../src/lesson";
return [
    new LE_Bubble([],[
        new AddQuizQuestion({
            question:"Which of the following is the correct way to change the background color of the document in CSS?",
            options:[
                { l:"```css\nbody {\n\tbackground-color: red;\n}```", correct:true },
                { l:"```css\n.body {\n\tbg-color: \"red\";\n}```" },
                { l:"```css\npage {\n\tbackground color: red;\n}```" },
                { l:"```css\ndocument {\n\tBackground-Color = red;\n}```" }
            ]
        }),
        new ValidateCode([
            new VP_QuizAns("q0")
        ])
    ])
]