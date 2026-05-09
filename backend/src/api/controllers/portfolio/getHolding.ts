import { Response } from "express";
import { AuthRequest } from "../../types";
import { PortfolioModel } from "../../models";


export const getHolding= async(req:AuthRequest, res:Response)=>{
    try{
        const userId= req.user?.userId;
        if(!userId){
            return res.status(401).json({message:"Unauthorized"});
        }
        const{symbol}= req.params as {symbol:string};

        const holdings= await PortfolioModel.getUserPortfolio(userId);
        const holding= holdings.find(
            (h)=>h.symbol.toUpperCase()=== symbol.toUpperCase(),
        );
        if(!holding){
            res.json({
                success:true,
                data:null,
                message:`You don't own any ${symbol.toUpperCase()} shares`,
            });
            return;
        }
        res.json({
            success:true,
            data:holding,
        });
    }catch (error) {
        console.error('Get holding error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}