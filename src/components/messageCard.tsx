"use client"


import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"
import { Message } from "@/model/User.model"
import { X } from "lucide-react"
import { string } from "zod"
  


type MessagCardProps = {
message:Message,
onMessageDelete :(messageId:string)  =>void
}





const MessageCard = ({message,onMessageDelete}:MessagCardProps) => {

const handleMessagedelete = ()=>{
  onMessageDelete(String(message._id))
}




  return (
    <Card>
  <CardHeader>
  <div className="flex justify-between items-center">

    <CardTitle>Card Title</CardTitle>
    <CardDescription>{message.content}</CardDescription>
    <AlertDialog>
    <AlertDialogTrigger asChild>
        <Button variant="destructive"><X className="w-5 h-5"/></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleMessagedelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
</AlertDialog>
</div>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
  
  </CardFooter>
</Card>

  )
}

export default MessageCard

