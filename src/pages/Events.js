import React, { useState, useContext, useEffect } from 'react';

import AuthContext from '../context/auth-context';

import Backdrop from '../components/Backdrop/Backdrop';
import Modal from '../components/Modal/Modal';
import EventList from '../components/Events/EventList/EventList';
import Spinner from '../components/Spinner/Spinner';

import './Events.css';

const EventsPage = (props) => {
    const [creating, setCreating] = useState(false);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isActive, setIsActive] = useState(true);

    const context = useContext(AuthContext);

    useEffect(() => {
        fetchEvents();
        return () => {
            setIsActive(false);
        }
    }, []);


    const titleElRef = React.createRef();
    const priceElRef = React.createRef();
    const dateElRef = React.createRef();
    const descriptionElRef = React.createRef();



    const startCreateEventHandler = () => {
        setCreating(true);
    }

    const modalCancelHandler = () => {
        setCreating(false);
        setSelectedEvent(null);
    };

    const modalConfirmHandler = () => {
        setCreating(false);

        const title = titleElRef.current.value;
        const price = +priceElRef.current.value;
        const date = dateElRef.current.value;
        const description = descriptionElRef.current.value;

        if (title.trim().length === 0 || price < 0 || date.trim().length === 0 || description.trim().length === 0) {
            return;
        }

        const requestBody = {
            query: `
                mutation {
                    createEvent(eventInput: {
                        title: "${title}",
                        price: ${price},
                        description: "${description}",
                        date: "${date}"
                    }){
                        _id
                        title
                        description
                        date
                        price
                    }
                }
            `
        }

        fetch(
            'http://localhost:8000/graphql',
            {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${context.token}`
                }
            }
        )
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error("Failed");
                }
                return res.json();
            })
            .then(resData => {
                setEvents([...events, {
                    _id: resData.data.createEvent._id,
                    title: resData.data.createEvent.title,
                    description: resData.data.createEvent.description,
                    date: resData.data.createEvent.date,
                    price: resData.data.createEvent.price,
                    creator: {
                        _id: context.userId
                    }
                }])
                fetchEvents();
            })
            .catch(err => {
                console.log(err);
            })
    };

    const fetchEvents = () => {
        setIsLoading(true);
        const requestBody = {
            query: `
                query {
                    events {
                        _id
                        title
                        description
                        date
                        price
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        };

        fetch(
            'http://127.0.0.1:8000/graphql',
            {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error("Failed");
                }
                return res.json()
            })
            .then(resData => {
                if (isActive) {
                    setEvents(resData.data.events);
                    setIsLoading(false);
                }
            })
            .catch(err => {
                console.error(err);
                setIsLoading(true);
            })
    }

    const showDetailHandler = eventId => {
        const targetEvent = events.find(e => e._id === eventId);
        setSelectedEvent(targetEvent);
    }

    const bookEventHandler = () => {
        if (!context.token) {
            setSelectedEvent(null);
            return;
        }
        const requestBody = {
            query: `
                mutation {
                    bookEvent(eventId: "${selectedEvent._id}") {
                        _id
                        createdAt
                        updatedAt
                    }
                }
            `
        };

        fetch(
            'http://127.0.0.1:8000/graphql',
            {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${context.token}`
                }
            }
        )
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error("Failed");
                }
                return res.json()
            })
            .then(resData => {
                console.log(resData);
                setSelectedEvent(null);
            })
            .catch(err => {
                console.error(err);
            })
    }

    return (
        <>
            {(creating || selectedEvent) && <Backdrop />}
            {creating && (
                <Modal
                    title="Add Event"
                    canCancel
                    canConfirm
                    onCancel={modalCancelHandler}
                    onConfirm={modalConfirmHandler}
                    confirmText="Confirm"
                >
                    <form>
                        <div className="form-control">
                            <label htmlFor="title">Title</label>
                            <input type="text" id="title" ref={titleElRef} />
                        </div>

                        <div className="form-control">
                            <label htmlFor="price">Price</label>
                            <input type="number" id="price" min="0" ref={priceElRef} />
                        </div>

                        <div className="form-control">
                            <label htmlFor="date">Date</label>
                            <input type="datetime-local" id="date" ref={dateElRef} />
                        </div>

                        <div className="form-control">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" rows="4" ref={descriptionElRef} />
                        </div>
                    </form>
                </Modal>
            )}

            {
                selectedEvent && (
                    <Modal
                        title={selectedEvent.title}
                        canCancel
                        canConfirm
                        onCancel={modalCancelHandler}
                        onConfirm={bookEventHandler}
                        confirmText={context.token ? "Book" : "Confirm"}
                    >
                        <h1>{selectedEvent.title}</h1>
                        <h2>
                            ${selectedEvent.price} - {new Date(selectedEvent.date).toLocaleDateString()}
                        </h2>
                        <p>{selectedEvent.description}</p>
                    </Modal>
                )
            }

            {context.token && (
                <div className="events-control">
                    <p>Share your own Events!</p>
                    <button className="btn" onClick={startCreateEventHandler}>
                        Create Event
                </button>
                </div>
            )}

            {
                isLoading ? (
                    <Spinner />
                ) : (
                        <EventList
                            events={events}
                            authUserId={context.userId}
                            onViewDetail={showDetailHandler}
                        />
                    )
            }
        </>
    );
}

export default EventsPage;