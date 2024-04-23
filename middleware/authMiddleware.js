import jwt from 'jsonwebtoken'
import express from "express";
import * as projectService from '../service/service.js'


function verifyToken(req, res, next) {
const token = req.header('Authorization');
if (!token) return res.status(401).json({ error: 'Access denied' });
try {
 const decoded = jwt.verify(token, process.env.JWTKEY);
 
 if(projectService.loginCred({_id:decoded.userId  })){
    console.log("check this broo sucess")
 }
 else{
   return res.status(401).json({ error: 'Invalid token' });
 }

 req.userId = decoded.userId;
 next();
 
 } catch (error) {
 res.status(401).json({ error: 'Invalid token' });
 }
 };

export default  verifyToken;