import React, { useEffect, useState, useContext } from 'react';

import AuthContext from '../context/auth-context';

import BookingList from '../components/Bookings/BookingList/BookingList';
import Spinner from '../components/Spinner/Spinner';

const BookingsPage = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [bookings, setBookings] = useState([]);

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
                        }
                    }
                }
            `
        }

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
                return res.json();
            })
            .then(resData => {
                console.log(resData);
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
                mutation {
                    cancelBooking(bookingId: "${bookingId}") {
                        _id
                        title
                    }
                }
            `
        }

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
                return res.json();
            })
            .then(resData => {
                console.log(resData);
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

    return (
        <>
            {
                isLoading ? (
                    <Spinner />
                ) : (
                        <BookingList
                            bookings={bookings}
                            onDelete={deleteBookingHandler}
                        />
                    )
            }
        </>
    );
}

export default BookingsPage;