import express from "express";
import projectData from '../schema/projectschema.js'
import todolistData from "../schema/todolist.js";
import * as projectService from "../service/service.js";
import login from "../schema/login.schema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import verifyToken from '../middleware/authMiddleware.js'
import Mongoose from "mongoose";


var router = express.Router();

router.get("/", function (req, res, next) {
    res.json({ title: "Server is running..." });
});

//User routes

router.post("/signup", async function (req, res, next) {
    try {

        if (req.body.username.length && req.body.password.length) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            login.create({ username: req.body.username, password: hashedPassword }).then((data) => {
                res.json(data)
            }).catch(() => {
                res.json({ error: "something went wrong" })
            })
        } else {
            res.json({ error: "something went wrong" })
        }
    }
    catch {
        (e) => {
            res.json({ error: "something went wrong" })
        }

    }
})

router.post("/login", async function (req, res, next) {
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

// Todo routes
router.post("/insert", verifyToken, function (req, res, next) {
    try {
        const todo = req.body.todo
        if (todo.length) {
            todolistData.create(todo).then((todoListData) => {
                let todoId = todoListData.map((data) => data._id);
                let createProjectData = {
                    title: req.body.title,
                    description: req.body.description,
                    userID: req.userId,
                    todo: todoId,
                };
                projectData.create(createProjectData).then((projectData) => {
                    projectData.todo = todoListData
                    res.json(projectData)
                }).catch((err) => {
                    res.json({ error: "error while adding project" })
                })
            }).catch((err) => {
                res.json({ error: "error while adding todoList" })
            })
        }
        else {
            res.json({ error: "atlease one todo list required" })
        }
    }
    catch {
        res.json({ error: "something went wrong" })
    }
})

router.post("/allprojects", verifyToken, async function (req, res, next) {
    try {
        projectData
            .find({ userID: req.userId })
            .then(async (d) => {
                const todolist = d.map((d) => d.todo).flat();
                const todos = await todolistData.find({ _id: { $in: todolist } });

                res.json({
                    projects: d, todos
                });
            })
            .catch((e) => res.json({ error: "something went wrong" }));
    } catch {
        res.json({ error: "something went wrong" })
    }
})

router.post("/update", verifyToken, async function (req, res, next) {
    try {

        let todoData = req.body.todo;
        let todowithoutId = todoData.filter(todo => (!todo._id))

        if (todowithoutId.length) {
            const Newtodolist = await projectService.AddnewTodoList(todowithoutId)
            let newtodoLisId = []
            if (Newtodolist) {
                newtodoLisId = Newtodolist.map(data => data._id)

                let todoListExisistingData = todoData.filter(todoData => (todoData._id))
                for (let index = 0; index < todoListExisistingData.length; index++) {
                    const element = todoListExisistingData[index];
                    const todo = await projectService.UpdateTodoList(element)
                    if (!todo) {
                        return res.json({ error: "something went wrong" })
                    }

                }
                let todoExistingId = todoListExisistingData.map(todoData => todoData._id)
                let updateProjectData = {
                    title: req.body.title,
                    description: req.body.description,
                    todo: [...todoExistingId, ...newtodoLisId],
                    updated_at: new Date(),
                    _id: req.body._id
                };
                let updateProject = await projectService.UpdateProject(updateProjectData)
                if (updateProject) {
                    updateProjectData.todo = [...Newtodolist, ...todoListExisistingData]
                    return res.json(updateProjectData)
                } else {
                    return res.json({ error: "somethinng went erong" })
                }
            }
            else {
                return res.json({ error: "something ernt wrong" })
            }
        } else {
            let todoListExisistingData = todoData.filter(todoData => (todoData._id))
            for (let index = 0; index < todoListExisistingData.length; index++) {
                const element = todoListExisistingData[index];
                if (!await projectService.UpdateTodoList(element)) {
                    return res.json({ error: "something went wrong" })
                }

            }
            let todoExistingId = todoData.map(todoData => todoData._id)

            let updateProjectData = {
                title: req.body.title,
                description: req.body.description,
                todo: [...todoExistingId],
                updated_at: Date.now(),
                _id: req.body._id
            };
            let updateProject = await projectService.UpdateProject(updateProjectData)
            if (updateProject) {
                updateProjectData.todo = todoData
                return res.json(updateProjectData)
            } else {
                return res.json({ error: "somethinng went erong" })
            }
        }
    }
    catch {
        res.json({ error: "something went wrong" })
    }
})

router.post("/delete", verifyToken, async function (req, res, next) {
    try {
        if (req.body.todolistId) {
            try {
                let deleteTodo = await todolistData.findByIdAndDelete(req.body.todolistId);
                if (deleteTodo) {
                    await projectData.findByIdAndUpdate(req.body.projectId,
                        { $pull: { todo: new Mongoose.Types.ObjectId("6628a39e89207d99e601829d") }, })
                    return res.json({ data: 'sucess' })
                }
                return res.json({ status: "failed", msg: "Couldn't find the todo" })
            } catch (e) {
                res.json({ error: "something went wrong" })
            }
        }
    } catch {
        res.json({ error: "something went wrong" })
    }

})

export default router;
