import React, { useState } from "react";
import "./NotesArea.css";
import * as XLSX from "xlsx";

const NotesArea = () => {
  const [notes, setNotes] = useState([]);

  const handleDoubleClick = (event) => {
    const notesArea = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - notesArea.left;
    const relativeY = event.clientY - notesArea.top;

    // const isNoteAtPosition = notes.some(
    //   (note) =>
    //     relativeX >= note.left &&
    //     relativeX <= note.left + 100 &&
    //     relativeY >= note.top &&
    //     relativeY <= note.top + 200
    // );

    const isInsideNote = Array.from(event.target.classList).includes("note");

    if (isInsideNote) {
      return;
    }

    // if (!isNoteAtPosition) {
    const newNote = {
      id: Date.now(),
      text: "",
      left: relativeX,
      top: relativeY,
      distanceFromWindowTop: event.clientY,
      distanceFromWindowLeft: event.clientX,
      distanceFromTopLeftCorner: Math.sqrt(
        Math.pow(event.clientX, 2) + Math.pow(event.clientY, 2)
      ),
    };
    setNotes([...notes, newNote]);
    // }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    const targetNoteId = event.target.getAttribute("data-noteid");
    const noteId = event.dataTransfer.getData("text/plain");
    const draggedText = event.dataTransfer.getData("text");
    const isNote = event.target.classList.contains("note");

    if (!isNote && targetNoteId === null) {
      const notesArea = event.currentTarget.getBoundingClientRect();
      const relativeX = event.clientX - notesArea.left;
      const relativeY = event.clientY - notesArea.top;

      const newNote = {
        id: Date.now(),
        text: draggedText,
        left: relativeX,
        top: relativeY,
        distanceFromWindowTop: event.clientY,
        distanceFromWindowLeft: event.clientX,
        distanceFromTopLeftCorner: Math.sqrt(
          Math.pow(event.clientX, 2) + Math.pow(event.clientY, 2)
        ),
      };
      setNotes([...notes, newNote]);
    }
  };

  const handleDropOnTask = (event) => {
    const text = event.dataTransfer.getData("text");
    const noteId = event.target.getAttribute("data-noteid");

    const droppedText = document.createTextNode(text);
    event.target.appendChild(droppedText);

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === parseInt(noteId)
          ? { ...note, text: note.text + " " + text }
          : note
      )
    );

    event.preventDefault();
  };

  const handleNoteTextChange = (event, noteId) => {
    const newText = event.target.value; // Get the value of the textarea
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId ? { ...note, text: newText } : note
      )
    );
  };

  const exportNotes = () => {
    console.log(notes.length);
    notes.map((note) => console.log(note.text));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      notes.map((note) => ({
        Notes: note.text.replace(/[\r\n]+/g, " "),
        "Distance from top": note.distanceFromWindowTop,
        "Distance from left": note.distanceFromWindowLeft,
        "Distance from top-left corner": note.distanceFromTopLeftCorner,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notes");
    XLSX.writeFile(workbook, "notes.xlsx");
  };

  return (
    <>
      <div
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          className="notes-area"
          style={{
            position: "relative",
            margin: "auto",
            marginTop: "12.5vh",
            width: "75vw",
            height: "75vh",
          }}
          onDoubleClick={handleDoubleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {notes.map((note) => (
            <textarea
              key={note.id}
              className="note"
              style={{ left: note.left, top: note.top, resize: "none" }}
              onDrop={handleDropOnTask}
              onDragOver={handleDragOver}
              value={note.text}
              onChange={(event) => handleNoteTextChange(event, note.id)}
              data-noteid={note.id}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            // top: "calc(50% + 37.5vh)",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <button className="export_button" onClick={exportNotes}>
            Export Notes
          </button>
        </div>
      </div>
    </>
  );
};

export default NotesArea;
