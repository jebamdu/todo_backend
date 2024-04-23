import express from "express";
import projectData from '../schema/projectschema.js'
import  todolistData  from "../schema/todolist.js";
import * as projectService from "../service/service.js";
import login from "../schema/login.schema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import verifyToken  from '../middleware/authMiddleware.js'


 var router = express.Router();

 router.get("/", function (req, res, next) {
  res.json({ title: "Express" });
});

router.post("/insert", function (req, res, next) {

    try{
        const todo = req.body.todo
if(todo.length){
    todolistData.create(todo).then((todoListData)=>{
        let todoId = todoListData.map((data) => data._id);
        let createProjectData = {
         title: req.body.title,
         description: req.body.description,
         todo: todoId,
       };
       projectData.create(createProjectData).then((projectData)=>{
         projectData.todo = todoListData
         res.json(projectData)
       }).catch((err)=>{
         res.json({error:"error while adding project"})
       })
     }).catch((err)=>{
         res.json({error:"error while adding todoList"})
     })
}
else{
    res.json({error:"atlease one todo list required"})
}
    }
    catch{
        res.json({error:"something went wrong"})
    }


})


router.post("/update", async function(req, res, next) {
    try{

        let todoData = req.body.todo;
        let todowithoutId = todoData.filter(todo=>(!todo._id))
        let NewUpdatedtodoList = []
        let newupdatedProject ={}
    
        if(todowithoutId.length){
            const Newtodolist = await projectService.AddnewTodoList(todowithoutId)
            let newtodoLisId=[]
            if(Newtodolist){
                newtodoLisId=Newtodolist.map(data=>data._id)
    
                let todoListExisistingData= todoData.filter(todoData=>(todoData._id))
                for (let index = 0; index < todoListExisistingData.length; index++) {
                    const element = todoListExisistingData[index];
                    if(await projectService.UpdateTodoList(element)){
                    }
                    else{
                       return  res.json({error :"something went wrong"})
                    }
                    
                }
               let todoExistingId = todoData.map(todoData=>todoData._id)
    
               let updateProjectData = {
                title: req.body.title,
                description: req.body.description,
                todo: [...todoExistingId,...newtodoLisId],
                updated_at: Date.now(),
                _id:req.body._id
              };
              let updateProject =await projectService.UpdateProject(updateProjectData)
              if(updateProject){
                updateProjectData.todo = [...Newtodolist,...todoListExisistingData]
                return res.json(updateProjectData)
              }else{
                 return res.json({error:"somethinng went erong"})
              }
            }
            else{
               return  res.json({error:"something ernt wrong"})
            }
        }else{
            let todoListExisistingData= todoData.filter(todoData=>(todoData._id))
            for (let index = 0; index < todoListExisistingData.length; index++) {
                const element = todoListExisistingData[index];
                if(await projectService.UpdateTodoList(element)){
                }
                else{
                   return  res.json({error :"something went wrong"})
                }
                
            }
            let todoExistingId = todoData.map(todoData=>todoData._id)
    
            let updateProjectData = {
             title: req.body.title,
             description: req.body.description,
             todo: [...todoExistingId],
             updated_at: Date.now(),
             _id:req.body._id
           };
           let updateProject =await projectService.UpdateProject(updateProjectData)
           if(updateProject){
             updateProjectData.todo = todoData
             return res.json(updateProjectData)
           }else{
              return res.json({error:"somethinng went erong"})
           }
        }
    

    }
    catch{

        res.json({error:"something went wrong"})
    }

   
   })


   router.post("/allprojects", verifyToken, async function(req, res, next) {

    
    // const test=await projectData.aggregate([{
    //     $lookup: {
    //         from: "todolistData",
    //         localField: "_id",
    //         foreignField: "todo",
    //         as: "todo"
    //     }
    // }])

    try{
        projectData
        .find({})
        .then(async (d) => {
          const todolist = d.map((d) => d.todo).flat();
          const todos = await todolistData.find({ _id: { $in: todolist } });
    
          res.json({
            projects:d,todos
          });
        })
        .catch((e) => res.json({ error: "something went wrong" }));
    }catch{
        res.json({error:"something went wrong"})
    }
   })


   router.post("/delete", async function(req, res, next) {
     try{
        if(req.body.todolistId.length){
            let deleteTodo 
            try{
                deleteTodo= await todolistData.deleteOne({ _id: { $in: req.body.todolistId } });
                
                    

                    let projectdata=await projectData.find({ _id: { $in: req.body.projectId } })
                    console.log(projectdata,"projectdata")
                    if(projectdata.length){
                        let newtodo=[...projectdata[0].todo]
                        let index = newtodo.findIndex((inddata)=>(inddata==new ObjectId(req.body.projectId)))
                        console.log(index,"index")
                        newtodo.splice(index,1)
                        let updatedData = {...projectData,todo : newtodo}
                        console.log(updatedData,"updatedData")
                       let test= await projectData.updateOne({_id:req.body.projectId},updatedData)
                       console.log(test,"test")
                        return res.json({data:'sucess'})
                    }
                    
                   
                
               

            }catch{(e)=>{
                console.log(e)
                res.json({error:"something went wrong"})
            }
               
            }
            
            if(deleteTodo){
                res.json({data:"sucess"})
            }
        }else if(req.body.projectId.length){
            let deleteTodo 
            try{
                deleteTodo= await projectData.deleteOne({ _id: { $in: req.body.projectId } });
            }
            catch{
                res.json({error:"something went wrong"})
            }
            await projectData.deleteOne({ _id: { $in: req.body.projectId } });
            if(deleteTodo){
                res.json({data:"sucess"})
            }
        }else{
            res.json({error:"something went wrong"})
        }
    }catch{
        res.json({error:"something went wrong"})
    }
    
   })

   router.post("/signup", async function(req, res, next) {
    try{
        console.log(req.body.username.length ,"test.", req.body.password.length)

        if(req.body.username.length && req.body.password.length){
            const hashedPassword = await bcrypt.hash( req.body.password, 10);
            console.log(hashedPassword,"hashedPassword..")
            login.create({username:req.body.username,password:hashedPassword}).then((data)=>{
                res.json(data)
            }).catch(()=>{
                res.json({error:"something went wrong"})
            })
        }else{
            res.json({error:"something went wrong"})
        }
        
    }
   catch{(e)=>{
    console.log(e,"e")
    res.json({error:"something went wrong"})
   }

   }
   })

   router.post("/login", async function(req, res, next) {
    try {
        const { username, password } = req.body;
        const user = await login.findOne({ username });
        if (!user) {
        return res.status(401).json({ error: 'Authentication failed' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
        return res.status(401).json({ error: 'Authentication failed' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWTKEY, {
        expiresIn: '1h',
        });
        res.status(200).json({ token });
        } catch (error) {
        res.status(500).json({ error: 'Login failed' });
        }
   })

   
export default router;
