import  todolistData  from "../schema/todolist.js";
import  projectData  from "../schema/projectschema.js";
import  login  from "../schema/login.schema.js";

// Example service methods
export const AddnewTodoList = async (toDoList) => {
    try{
        return await todolistData.create(toDoList)
    }
    catch{
        throw new Error("something wrong")
    }
   
};

export const UpdateTodoList = async (toDoList) => {
    try{
        return await todolistData.updateOne(toDoList,toDoList._id)
    }
    catch{
        throw new Error("something wrong")
    }
   
};

export const UpdateProject = async (project) => {
    try{
        return await projectData.updateOne(project,project._id)
    }
    catch{
        (e)=>{
            console.log(e)
            throw new Error("something wrong")
        }
    }
}


export const loginCred= async (cred) => {
    try{
        console.log(cred,"cred")
        if( await login.findOne(cred).length >0){
            console.log(await login.find(cred))
            return true
        }else{
            return false
        }
    }
    catch{
        (e)=>{
            console.log(e)
            return false
            
        }
    }
}
