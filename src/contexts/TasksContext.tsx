import { createContext, ReactNode, useEffect, useState } from "react";
import { Task } from "../entities/Task";
import { taskService } from "../services/api";
import { z } from 'zod'


const UpdateTaskSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["todo", "doing", "done"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional()
  })



export interface TasksContextData {

    tasks: Task[],
    createTask: (attributes: Omit<Task, "id">) => Promise<void>
    updateTask: (id: string, attributes: Partial<Omit<Task, "id">> ) => Promise<void>
    deleteTask: (id: string) => Promise<void>
}

export const TasksContext = createContext({} as TasksContextData) 


interface TasksContextProviderProps{
    children: ReactNode
}
export const TaskContextProvider: React.FC <TasksContextProviderProps> = ({children}) =>{
        const [tasks, setTasks] = useState<Task[]>()

useEffect(() => {
            taskService.fetchTasks().then((data) => setTasks(data))
        },[])

const createTask =  async (attributes: Omit<Task, "id">) => {
    const newTask = await taskService.createTask(attributes)

setTasks((current) => {
    const updatedTasks = [...current || [], newTask]
    return updatedTasks
})


}

const updateTask = async (id: string, attributes: Partial<Omit<Task, "id">>) => {
    try {
      const parsedAttributes = UpdateTaskSchema.parse(attributes)
      await taskService.updateTask(id, parsedAttributes)
  
      setTasks((current = []) => {
        const updatedTasks = [...current]
        const index = updatedTasks.findIndex((task) => task.id === id)
        if (index !== -1) {
          Object.assign(updatedTasks[index], parsedAttributes)
        }
        return updatedTasks
      })
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
    }
  }

  const deleteTask = async (id: string) => {
    await taskService.deleteTask(id)
    setTasks((current) =>  (current ?? []).filter((task) => task.id !== id))
  }

    return(
        <TasksContext.Provider value={{ tasks: tasks || [], createTask, updateTask, deleteTask }}>
            {children}
        </TasksContext.Provider>
    )


}