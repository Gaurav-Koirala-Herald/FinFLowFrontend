import { api } from "./api"


export const emailService = {
  async SendEmail(email:string){
    const response = await api.post("/Email/send-otp", { email })
    return response.data
  }
}
