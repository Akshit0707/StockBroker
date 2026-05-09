import { JwtPayload, verifyToken } from "../utils/jwt";
import { Request, Response, NextFunction } from "express";

declare global{
    namespace Express{
        interface Request{
            user?: JwtPayload
        }
    }
}

export const authenticate= (req:Request, res:Response, next:NextFunction)=>{
    const authHeader= req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
         res.status(401).json({ 
            success: false,
            message: 'Access denied, No token provided' 
        });
        return;
    }

    const token= authHeader.split(' ')[1];
    try{
        const decoded = verifyToken(token);
        req.user= decoded;
        next();
    }catch(error){
        res.status(401).json({ 
            success: false,
            message: 'Invalid token or token expired. Login again.' 
        });
    }
}