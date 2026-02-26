import { api } from "./api"


export const emailService = {
  async SendEmail(email:string,userName:string){
    const response = await api.post("/Email/send-otp", { email, userName })
    return response.data
  }
}
