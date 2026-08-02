import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"


const ProtectedRoute = ({ children }) => {
    const {user} = useAuth()

    if ( user === undefined) return (
        <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
        </div>
    )
  return  user ? children : <Navigate to="/login" />
}

export default ProtectedRoute