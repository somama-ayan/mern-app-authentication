import { response } from "express";
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail =  async (email, verificationToken) => {
    
    const recipent = [{email}]

    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipent,
            subject: "Verify Your Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })
    }
    catch(error){
        console.log('Error sending an Email ',error)
        throw new Error(`Error sending an Email ${error}`)
    }

}

export const sendWelcomeEmail = async (email , name) => {
    const recipent = [{email}]

    try{
       const response = mailtrapClient.send({
            from: sender,
            to: recipent,
            template_uuid: "8c45d679-e78b-4968-b6de-5160538c7233",
    template_variables: {
      "company_info_name": "Auth company ",
      "name": name
    }
})
console.log('Email send successfully..')
    }catch(error){
        console.log(`Error sending an Email ${error}`)
        throw new Error(`Error sending an Email ${error}`)
    }
}