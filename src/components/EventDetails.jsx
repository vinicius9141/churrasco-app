import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState({ guests: [] }); // Inicialização segura
  const [guestName, setGuestName] = useState('');
  const [amountPaid, setAmountPaid] = useState('0');
  const [hasPaid, setHasPaid] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Estado de erro adicionado

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const eventDoc = doc(db, "events", eventId);
        const eventData = await getDoc(eventDoc);
        if (eventData.exists()) {
          const data = eventData.data();
          setEvent({ ...data, guests: data.guests || [] });
          setIsOwner(data.userId === auth.currentUser.uid);
          setTotalCost(parseFloat(data.totalCost) || 0);
        } else {
          console.log("No such document!");
          setEvent({ guests: [] });
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvent();
  }, [eventId]);

  // Assegure-se que totalPaid é calculado dentro do componente e antes de ser usado
  const totalPaid = event.guests.reduce((acc, guest) => acc + parseFloat(guest.amountPaid), 0);

  const handleTotalCostChange = (e) => {
    const cost = parseFloat(e.target.value) || 0;
    setTotalCost(cost);
    const eventDoc = doc(db, "events", eventId);
    updateDoc(eventDoc, { totalCost: cost });
  };


  const addGuest = async () => {
    if (isOwner && guestName && amountPaid) {
      const newGuest = {
        id: Date.now().toString(),
        name: guestName,
        amountPaid: parseFloat(amountPaid),
        hasPaid
      };
      const eventDoc = doc(db, "events", eventId);
      await updateDoc(eventDoc, {
        guests: [...event.guests, newGuest]
      });
      setEvent(prev => ({ ...prev, guests: [...prev.guests, newGuest] }));
      setGuestName('');
      setAmountPaid('0');
      setHasPaid(false);
    }
  };

  const updateGuest = async (guest, newAmountPaid, newHasPaid) => {
    if (isOwner) {
      const newGuestList = event.guests.map(g => {
        if (g.id === guest.id) {
          return { ...g, amountPaid: parseFloat(newAmountPaid), hasPaid: newHasPaid };
        }
        return g;
      });
  
      const eventDoc = doc(db, "events", eventId);
      await updateDoc(eventDoc, { guests: newGuestList });
      setEvent(prev => ({ ...prev, guests: newGuestList }));
    }
  };

  const removeGuest = async (guestToRemove) => {
    if (isOwner) {
      const eventDoc = doc(db, "events", eventId);
      await updateDoc(eventDoc, { guests: event.guests.filter(guest => guest.id !== guestToRemove.id) });
      setEvent(prev => ({ ...prev, guests: prev.guests.filter(guest => guest.id !== guestToRemove.id) }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      {loading ? (
        <p>Carregando detalhes do evento...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Detalhes do Evento: {event.name}</h1>
          {isOwner && (
            <>
              <div className="mb-4">
                <input
                  className="border border-gray-300 p-2 rounded mr-2"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Nome do Convidado"
                />
                <input
                  className="border border-gray-300 p-2 rounded mr-2"
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Valor Pago"
                />
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={hasPaid}
                    onChange={(e) => setHasPaid(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  /><span className="ml-2 text-gray-700">Pago</span>
                </label>
                <button
                  className="ml-2 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
                  onClick={addGuest}
                >
                  Adicionar Convidado
                </button>
              </div>
              <div>
                {event.guests.map((guest, index) => (
                  <div key={index} className="bg-white shadow rounded p-3 my-2 flex justify-between items-center">
                    <span className="font-semibold">{guest.name}</span>
                    {isOwner && (
                      <>
                        <input
                          type="number"
                          className="border border-gray-300 p-1 rounded mx-2 w-24"
                          value={guest.amountPaid}
                          onChange={(e) => updateGuest(guest, e.target.value, guest.hasPaid)}
                          onBlur={(e) => updateGuest(guest, e.target.value, guest.hasPaid)}
                          aria-label="Edit Paid Amount"
                        />
                        <button
                          className={`${guest.hasPaid ? 'bg-green-500' : 'bg-red-500'} text-white rounded p-1 mx-2`}
                          onClick={() => updateGuest(guest, guest.amountPaid, !guest.hasPaid)}
                        >
                          {guest.hasPaid ? 'Sim' : 'Não'}
                        </button>
                        <button
                          className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700 transition duration-300"
                          onClick={() => removeGuest(guest)}
                        >
                          Remover
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="mt-4 p-4 bg-gray-200 rounded">
            <h2 className="text-lg font-semibold">Resumo Financeiro:</h2>
            <p>Total Pago pelos Convidados: ${totalPaid.toFixed(2)}</p>
            <p>Custo Total do Evento: ${totalCost.toFixed(2)}</p>
            <p className="font-semibold" style={{ color: profitOrLoss >= 0 ? 'green' : 'red' }}>
              Lucro/Prejuízo: ${profitOrLoss.toFixed(2)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default EventDetails;
