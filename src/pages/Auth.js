import React, { useContext, useState } from 'react';

import AuthContext from '../context/auth-context';

import './Auth.css'

const AuthPage = () => {
    const context = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);

    const emailEl = React.createRef();
    const passwordEl = React.createRef();

    const switchModeHandler = () => {
        setIsLogin(!isLogin);
    };

    const submitHandler = event => {
        event.preventDefault();
        const email = emailEl.current.value;
        const password = passwordEl.current.value;

        if (email.trim().length === 0 || password.trim().length === 0) {
            return;
        }

        let requestBody = {
            query: `
            query Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    userId
                    token
                    tokenExpiration
                }
            }
            `,
            variables:{
                email: email,
                password: password
            }
        };

        if (!isLogin) {
            requestBody = {
                query: `
                mutation createUser($email: String!, $password: String!) {
                    createUser(userInput: {email: $email, password: $password}) {
                        _id
                        email
                    }
                }
                `,
                variables: {
                    email: email,
                    password: password
                }
            };
        }

        fetch('/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed!');
                }
                return res.json();
            })
            .then(resData => {
                if (isLogin && resData.data.login.token) {
                    context.login(
                        resData.data.login.token,
                        resData.data.login.userId,
                        resData.data.login.tokenExpiration
                    );
                }
                if (!isLogin){
                    setIsLogin(true);
                }
            })
            .catch(err => {
                console.log(err);
            });
    };

    return (
        <form className="auth-form" onSubmit={submitHandler}>
            <div className="form-control">
                <label htmlFor="email">E-Mail</label>
                <input type="email" id="email" ref={emailEl} />
            </div>
            <div className="form-control">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" ref={passwordEl} />
            </div>
            <div className="form-actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={switchModeHandler}>
                    Switch to {isLogin ? 'Signup' : 'Login'}
                </button>
            </div>
        </form>
    );
}

export default AuthPage;