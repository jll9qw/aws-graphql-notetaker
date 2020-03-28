import React from "react";
import Amplify, {
  Analytics,
  Storage,
  API,
  graphqlOperation
} from "aws-amplify";
import awsconfig from "./aws-exports";
import { withAuthenticator } from "aws-amplify-react"; // or 'aws-amplify-react-native';

const listNote = `query listNote {
  listNote{
    items{
      id
      note
    }
  }
}`;

const addNote = `mutation createNote$name:String! $note: String!) {
  createNoteinput:{
    id:$id
    note:$note
  }){
    id
   note
  }
}`;

Amplify.configure(awsconfig);
class App extends React.Component {
  state = {
    notes: [
      {
        id: 1,
        note: "Hello World"
      }
    ]
  };

  noteMutation = async () => {
    const noteDetails = {
      id: "Party tonight!",
      note: "Amplify CLI rocks!"
    };

    const newNote = await API.graphql(graphqlOperation(addNote, noteDetails));
    alert(JSON.stringify(newNote));
  };

  listQuery = async () => {
    console.log("listing todos");
    const allTodos = await API.graphql(graphqlOperation(listNote));
    alert(JSON.stringify(allTodos));
  };

  render() {
    const { notes } = this.state;
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-green">
        <h1 className="code f2-1">Amplify NoteTaker</h1>
        <form className="mb3">
          <input
            className="pa2 f4"
            type="text"
            placeholder="Write a note"
          ></input>
          <button className="pa2 f4">Add Note</button>
        </form>
        <div>
          {notes.map(item => (
            <div key={item.id} className="flex items-center">
              <li className="list pa1 f3">{item.note}</li>
              <button className="bg-transparent bn f4  ">
                <span>&times;</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
