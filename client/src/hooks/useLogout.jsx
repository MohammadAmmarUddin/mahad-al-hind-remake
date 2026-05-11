import { useNavigate } from "react-router-dom";
import useAuthContext from "./useAuthContext";
import { startTransition } from "react";

export const useLogout=()=>{
    const navigate =useNavigate();
    const {dispatch}=useAuthContext();
    const logout=()=>{
        localStorage.removeItem('user');
        localStorage.removeItem('access-token');
        dispatch({type:'LOGOUT'});
        startTransition(() => {
            navigate('/')
        })
    }
    return {logout};
}
