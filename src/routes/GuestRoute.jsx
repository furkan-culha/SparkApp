import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const GuestRoute = ({children}) => {
    const {user} = useAuth()
    if ( user === undefined) return null
  return !user ? children : <Navigate to="/" />
}

export default GuestRoute