import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [noteId, setNoteId] = useState(null);
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const fetchNotes = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://localhost:8000/api/notes/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else if (response.status === 401) {
       navigate("/login");
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (audioBlob) {
        formData.append('audio', audioBlob, 'recording.webm');
      }

      const url = noteId 
        ? `http://localhost:8000/api/notes/${noteId}/`
        : 'http://localhost:8000/api/notes/';

      const method = noteId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const savedNote = await response.json();
        if (noteId) {
          setNotes(notes.map(note => note.id === noteId ? savedNote : note));
          setNoteId(null);
        } else {
          setNotes([...notes, savedNote]);
        }
        setTitle('');
        setDescription('');
        setAudioBlob(null);
      } else if (response.status === 401) {
        navigate("login/");
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleEdit = (note) => {
    setNoteId(note.id);
    setTitle(note.title);
    setDescription(note.description);
  };

  const handleCancel = () => {
    setNoteId(null);
    setTitle('');
    setDescription('');
  };

  const deleteNote = async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:8000/api/notes/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id));
      } else if (response.status === 401) {
        navigate("login/")
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div>
        <h1>Notes</h1>
        <form onSubmit={handleSubmit}>
            <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            />
            <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            required
            />
            <div>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          {audioBlob && (
            <audio controls>
              <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
            </audio>
          )}
        </div>
            <div>
            <button 
                type="submit"
            >
                {noteId ? 'Update Note' : 'Add Note'}
            </button>
            {noteId && (
                <button 
                type="button"
                onClick={handleCancel}
                >
                Cancel
                </button>
            )}
            </div>
      </form>

      <div>
        {notes.map(note => (
          <div key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.description}</p>
            {note.audio && (
              <div>
                <audio controls>
                  <source src={note.audio} type="audio/webm" />
                </audio>
              </div>
            )}
            <div>
              <button 
                onClick={() => handleEdit(note)}
              >
                Edit
              </button>
              <button 
                onClick={() => deleteNote(note.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
