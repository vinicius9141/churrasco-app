// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { collection, getDocs, query, where, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [newEventName, setNewEventName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const q = query(collection(db, "events"), where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      setEvents(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchEvents();
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/login'))
                 .catch((error) => console.error('Error signing out: ', error));
  };

  const addEvent = async () => {
    if (newEventName.trim() !== '') {
      const newEvent = {
        name: newEventName,
        userId: auth.currentUser.uid
      };
      const docRef = await addDoc(collection(db, "events"), newEvent);
      setEvents([...events, { ...newEvent, id: docRef.id }]);
      setNewEventName('');
    }
  };

  const removeEvent = async (eventId) => {
    await deleteDoc(doc(db, "events", eventId));
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h1>
      <button className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
              onClick={handleLogout}>Logout</button>
      <div className="my-4">
        <input className="border border-gray-300 p-2 rounded mr-2"
               type="text"
               value={newEventName}
               onChange={(e) => setNewEventName(e.target.value)}
               placeholder="Enter new event name" />
        <button className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-700 transition duration-300"
                onClick={addEvent}>Create New Event</button>
      </div>
      <div>
        {events.map((event) => (
          <div key={event.id} className="bg-white shadow rounded p-3 my-2 flex justify-between items-center">
            <Link to={`/event/${event.id}`} className="text-blue-500 hover:text-blue-700 transition duration-300">
              <h3 className="font-semibold">{event.name}</h3>
            </Link>
            <button className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700 transition duration-300"
                    onClick={() => removeEvent(event.id)}>Remove Event</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
