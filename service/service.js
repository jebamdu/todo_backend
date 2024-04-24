import todolistData from "../schema/todolist.js";
import projectData from "../schema/projectschema.js";
import login from "../schema/login.schema.js";

// Example service methods
export const AddnewTodoList = async (toDoList) => {
    try {
        return await todolistData.create(toDoList)
    }
    catch {
        throw new Error("something wrong")
    }

};

export const UpdateTodoList = async (toDoList) => {
    try {
        return await todolistData.findByIdAndUpdate(toDoList._id, toDoList)
    }
    catch {
        throw new Error("something wrong")
    }

};

export const UpdateProject = async (project) => {
    try {
        return await projectData.findByIdAndUpdate(project._id, project)
    }
    catch (e) {
        console.log(e)
        throw new Error("something wrong")
    }
}


export const checkUser = async (cred) => {
    try {
        const user = await login.findOne(cred)
        if (user?.username) {
            return true
        } else {
            return false
        }
    }
    catch (e) {
        console.log(e)
        return false
    }
}
