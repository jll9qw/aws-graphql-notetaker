import React, { useState, useEffect } from "react";
import Amplify, {
  API,
  graphqlOperation
} from "aws-amplify";
import awsconfig from "./aws-exports";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";
import {
  onCreateNote,
  onDeleteNote,
  onUpdateNote
} from "./graphql/subscriptions";
import { withAuthenticator } from "aws-amplify-react"; // or 'aws-amplify-react-native';

Amplify.configure(awsconfig);

const App = () => {
  // Hooks
  const [id, setId] = useState("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    getNotes();
    const createNoteListener = API.graphql(
      graphqlOperation(onCreateNote)
    ).subscribe({
      next: noteData => {
        const newNote = noteData.value.data.onCreateNote;
        setNotes(prevNotes => {
          const oldNotes = prevNotes.filter(note => note.id !== newNote.id);
          const updatedNotes = [...oldNotes, newNote];
          return updatedNotes;
        });
        setNote("");
      }
    });
    const deleteNoteListener = API.graphql(
      graphqlOperation(onDeleteNote)
    ).subscribe({
      next: noteData => {
        const deletedNote = noteData.value.data.onDeleteNote;
        setNotes(prevNotes => {
          const updatedNotes = prevNotes.filter(
            note => note.id !== deletedNote.id
          );
          return updatedNotes;
        });
      }
    });
    const updateNoteListener = API.graphql(
      graphqlOperation(onUpdateNote)
    ).subscribe({
      next: noteData => {
        const updatedNote = noteData.value.data.onUpdateNote;
        setNotes(prevNotes => {
          const index = prevNotes.findIndex(note => note.id === updatedNote.id);
          const updatedNotes = [
            ...prevNotes.slice(0, index),
            updatedNote,
            ...prevNotes.slice(index + 1)
          ];
          return updatedNotes;
        });
        setNote("");
        setId("");
      }
    });
    return () => {
      createNoteListener.unsubscribe();
      deleteNoteListener.unsubscribe();
      updateNoteListener.unsubscribe();
    };
  }, []);

  // Functions
  const getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listNotes));
    setNotes(result.data.listNotes.items);
  };

  const handleChangeNote = event => setNote(event.target.value);

  const hasExistingNote = () => {
    if (id) {
      const isNote = notes.findIndex(note => note.id === id) > -1;
      return isNote;
    }
    return false;
  };

  const handleAddNote = async event => {
    event.preventDefault();
    if (hasExistingNote()) {
      handleUpdateNote();
    } else {
      const input = { note };
      await API.graphql(graphqlOperation(createNote, { input }));
    }
  };

  const handleUpdateNote = async () => {
    const input = { id, note };
    await API.graphql(graphqlOperation(updateNote, { input }));
  };

  const handleSetNote = ({ note, id }) => {
    setNote(note);
    setId(id);
  };

  const handleDeleteNote = async noteId => {
    const input = { id: noteId };
    await API.graphql(graphqlOperation(deleteNote, { input }));
  };

  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washed-green">
      <h1 className="code f2-1">Amplify NoteTaker</h1>
      <form className="mb3" onSubmit={handleAddNote}>
        <input
          className="pa2 f4"
          type="text"
          placeholder="Write a note"
          onChange={handleChangeNote}
          value={note}
        ></input>
        <button className="pa2 f4" type="submit">
          {id ? "Update Note" : "Add Note"}
        </button>
      </form>
      <div>
        {notes.map(item => (
          <div key={item.id} className="flex items-center">
            <li className="list pa1 f3" onClick={() => handleSetNote(item)}>
              {item.note}
            </li>
            <button
              className="bg-transparent bn f4  "
              onClick={() => handleDeleteNote(item.id)}
            >
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default withAuthenticator(App, { includeGreetings: true });
