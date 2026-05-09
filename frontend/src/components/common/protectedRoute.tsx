
import useAuthStore from '@/src/store/authStore';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const protectedRoute: React.FC=()=>{
    const {isAuthenticated, isLoading}=useAuthStore();
    if(isLoading){
        return(
            <div 
            style={{
                    display:'flex',
                    justifyContent:'center',
                    alignItems:'center',
                    height:'100vh',
                    background:'var(--bg-primary)',
                }}
            >
                <div 
                style={{
                    width:40,
                    height:40,
                    border:'3px solid var(--border-color)',
                    borderTopColor:'var(--accent-primary)',
                    borderRadius:'50%',
                    animation:'spin 1s linear infinite',
                }}
                />
                <style>
                    {`@keyframes spin { to { transform: rotate(360deg); } }`}
                </style>
            </div>    
        )
    }
    if(isAuthenticated){
        return <Outlet />;
    }
    return<Navigate to="/login" replace />;
}

export default protectedRoute;