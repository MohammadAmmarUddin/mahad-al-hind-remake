import { Navigate, useLocation } from 'react-router-dom';
import useAuthContext from '../hooks/useAuthContext';

const PrivateRoute = ({ children }) => {
    const location = useLocation()
    const { user } = useAuthContext()


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#047857]"></div>
            </div>
        );
    }
    if (user) {
        return children
    }
    return <Navigate to="/login" state={location.pathname} replace></Navigate>
};

export default PrivateRoute;