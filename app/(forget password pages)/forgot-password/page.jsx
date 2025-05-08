import { Toaster } from "react-hot-toast";
import ForgotPasswordForm from "@forget-password/forgot-password/componets/ForgotPasswordForm";
import SideThing from "@components/General Components/SideThing";



export const generateMetadata = () =>{
    return {
        title: "Link Tree | Forgot password",
        description: "Use this form to get a reset password url"
    }
}

export default function ForgotPasswordPage() {

    return (
        <div className="flex h-screen w-screen">
            <Toaster />
            <ForgotPasswordForm />
            <SideThing />
        </div>
    )
}