import * as React from "react";
import { Button, Panel, ButtonToolbar, Checkbox } from "react-bootstrap";
import Answer from "../model/Answer";
import Question from "../model/Question";
import Certification from "../model/Certification";
import IAssociativeArray from "../domain/IAssociativeArray";
import { checkIfAnsweredCorrectly } from "../domain/AssessmentLogic";
import AssessmentSession from "../model/AssessmentSession";
import QuestionView from "./QuestionView";

export interface SessionRecapProps {
    session: AssessmentSession;
}

interface SessionRecapState {
  showCorrectQuestions: boolean;
  showIncorrectQuestions: boolean;
}

// 'HelloProps' describes the shape of props.
// State is never set so we use the 'undefined' type.
export default class SessionRecap extends React.PureComponent<SessionRecapProps, SessionRecapState> {
  constructor(props: SessionRecapProps) {
      super(props);

      this.state = {
        showCorrectQuestions: false,
        showIncorrectQuestions: false
      };

      this.toggleShowCorrectQuestions = this.toggleShowCorrectQuestions.bind(this);
      this.toggleShowIncorrectQuestions = this.toggleShowIncorrectQuestions.bind(this);
  }

  toggleShowCorrectQuestions() {
    this.setState({showCorrectQuestions: !this.state.showCorrectQuestions});
  }

  toggleShowIncorrectQuestions() {
    this.setState({showIncorrectQuestions: !this.state.showIncorrectQuestions});
  }

  render(){
    let questions = this.props.session.certification.questions;
    let questionCount = questions.length;
    let correctAnswers = new Array<string>();

    let correctAnswerCount = questions.reduce((acc: number, val: Question) => {
      let answeredCorrectly = checkIfAnsweredCorrectly(val.answers, this.props.session.answers[val.id].reduce((acc: IAssociativeArray<boolean>, val: string) => {
        acc[val] = true;
        return acc;
      }, { }));

      if (answeredCorrectly){
        correctAnswers.push(val.id);
        return ++acc;
      }
      return acc;
    }, 0);

    let resultPercentage = (correctAnswerCount / questionCount) * 100;
    let text = null;

    text = (
      <div>
        <h2>{new Date(this.props.session.created_on).toTimeString()}</h2>
        <p>Certification version: {this.props.session.certification.version}</p>
        <p>Questions: {this.props.session.certification.questions.length}</p>
        <p>Correct Questions: {correctAnswerCount}</p>
        <p>Incorrect Questions: {this.props.session.certification.questions.length - correctAnswerCount}</p>
        <p>Score: {resultPercentage}%</p>
        <p>Passed: {resultPercentage >= 70 ? "Yes" : "No"}</p>
      </div>
    );

    return (
      <div>
        {text}
        <Button onClick={this.toggleShowCorrectQuestions}>
          Correctly answered questions
        </Button>
        <Panel collapsible expanded={this.state.showCorrectQuestions}>
          {
            this.props.session.certification.questions.filter(q => correctAnswers.indexOf(q.id) !== -1).map(activeQuestion => {
              return <QuestionView checkedAnswers={this.props.session.answers[activeQuestion.id].reduce((acc, val) => {acc[val] = true; return acc;}, {} as IAssociativeArray<boolean>)} question={activeQuestion} key={activeQuestion.id} highlightCorrectAnswers={true} highlightIncorrectAnswers={true} answersDisabled={true} />;
            })
          }
        </Panel>

        <Button onClick={this.toggleShowIncorrectQuestions}>
          Incorrectly answered questions
        </Button>
        <Panel collapsible expanded={this.state.showIncorrectQuestions}>
        {
          this.props.session.certification.questions.filter(q => correctAnswers.indexOf(q.id) === -1).map(activeQuestion => {
            return <QuestionView checkedAnswers={this.props.session.answers[activeQuestion.id].reduce((acc, val) => {acc[val] = true; return acc;}, {} as IAssociativeArray<boolean>)} question={activeQuestion} key={activeQuestion.id} highlightCorrectAnswers={true} highlightIncorrectAnswers={true} answersDisabled={true} />;
          })
        }
        </Panel>
      </div>
    );
  }
}