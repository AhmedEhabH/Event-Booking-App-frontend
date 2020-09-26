import React, { useEffect, useState, useContext } from 'react';

import AuthContext from '../context/auth-context';

import Spinner from '../components/Spinner/Spinner';

const BookingsPage = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [bookings, setBookings] = useState([]);

    const context = useContext(AuthContext);

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

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <>
            {
                isLoading ? (
                    <Spinner />
                ) : (
                        <ul>
                            {
                                bookings.map(booking => {
                                    return (
                                        <li key={booking._id} >{booking.event.title} - {new Date(booking.createdAt).toLocaleDateString()}</li>
                                    )
                                })
                            }
                        </ul>
                    )
            }
        </>
    );
}

export default BookingsPage;