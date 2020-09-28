import React, { useEffect, useState, useContext } from 'react';

import AuthContext from '../context/auth-context';

import BookingsControls from '../components/Bookings/BookingsControls/BookingsControls';
import BookingsChart from '../components/Bookings/BookingsChart/BookingsChart';
import BookingList from '../components/Bookings/BookingList/BookingList';
import Spinner from '../components/Spinner/Spinner';

const BookingsPage = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [outputType, setOutputType] = useState('list');

    const context = useContext(AuthContext);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = () => {
        setIsLoading(true);
        const requestBody = {
            query: `
                query {
                    bookings {
                        _id
                        createdAt
                        event {
                            _id
                            title
                            date
                            price
                        }
                    }
                }
            `
        }

        fetch(
            '/graphql',
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
                setIsLoading(false);
                setBookings(resData.data.bookings);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(true);
            })
    }



    const deleteBookingHandler = bookingId => {
        setIsLoading(true);
        const requestBody = {
            query: `
                mutation CancelBooking($id: ID!) {
                    cancelBooking(bookingId: $id) {
                        _id
                        title
                    }
                }
            `,
            variables: {
                id: bookingId
            }
        }

        fetch(
            '/graphql',
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
                setIsLoading(false);
                const updatedBookings = bookings.filter(booking => {
                    return booking._id !== bookingId;
                })

                setBookings(updatedBookings);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(true);
            })
    }

    const changeOutputTypeHandler = outputType => {
        if (outputType === 'list') {
            setOutputType('list');
        } else {
            setOutputType('chart');
        }
    }

    let content = <Spinner />;
    if (!isLoading) {
        content = (
            <>
                <BookingsControls
                    activeOutputType={outputType}
                    onChange={changeOutputTypeHandler}
                    bookings={bookings}
                />
                <div>
                    {
                        outputType === 'list' ? (
                            <BookingList
                                bookings={bookings}
                                onDelete={deleteBookingHandler}
                            />
                        ) : (
                                <BookingsChart bookings={bookings} />
                            )
                    }
                </div>
            </>
        );
    }

    return (
        <>
            {
                content
            }
        </>
    );
}

export default BookingsPage;