"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import {
Users,
MapPin,
Plus,
LoaderCircle
} from "lucide-react"

import { Room } from "@/types/room"

export default function PublicRoom(){

const [rooms,setRooms]=useState<Room[]>([])
const [loading,setLoading]=useState(true)
const [error,setError]=useState("")

useEffect(()=>{

async function getNearbyRooms(){

try{

if(!navigator.geolocation){

setError("Geolocation not supported")
setLoading(false)

return
}

navigator.geolocation.getCurrentPosition(

async(position)=>{

try{

const lat=position.coords.latitude
const lng=position.coords.longitude
const response=await axios.get(`/api/public-room/nearby-rooms?lat=${lat}&lng=${lng}`)   

const data=await response.data 

setRooms(data.rooms)

}
catch(error){

console.log(error)

setError(
"Failed to fetch rooms"
)

}

finally{

setLoading(false)

}

},

(error)=>{

console.log(error)

setError(
"Location permission denied"
)

setLoading(false)

}

)

}
catch(error){

console.log(error)

setLoading(false)

}

}

getNearbyRooms()

},[])

return(

<div
className="
min-h-screen
bg-[#07071A]
text-white
px-6
py-10
"
>

<div className="max-w-5xl mx-auto">

<h1
className="
text-center
font-bold
text-4xl
mb-10
bg-gradient-to-r
from-purple-400
to-pink-500
bg-clip-text
text-transparent
"
>

Join Public Room

</h1>

{
loading ?

<div
className="
flex
flex-col
items-center
justify-center
h-[70vh]
"
>

<div className="relative">

<motion.div

animate={{
rotate:360
}}

transition={{
duration:4,
repeat:Infinity,
ease:"linear"
}}

className="
w-[260px]
h-[260px]
rounded-full
border
border-purple-500
"
/>

<motion.div

animate={{
scale:[1,1.2,1]
}}

transition={{
duration:2,
repeat:Infinity
}}

className="
absolute
top-1/2
left-1/2
w-[80px]
h-[80px]
rounded-full
bg-purple-600
blur-3xl
-translate-x-1/2
-translate-y-1/2
"
/>

<MapPin
size={30}
className="
absolute
top-1/2
left-1/2
-translate-x-1/2
-translate-y-1/2
"
/>

</div>

<p
className="
mt-8
text-xl
"
>

Scanning within

<span className="text-purple-400">
{" "}5km{" "}
</span>

radius...

</p>

<LoaderCircle
className="
animate-spin
mt-5
text-purple-400
"
/>

</div>

:

error ?

<div
className="
text-center
text-red-400
"
>

{error}

</div>

:

<div>

{
rooms.length===0 ?

<div
className="
text-center
py-20
"
>

<h2
className="
text-2xl
font-semibold
"
>

No nearby rooms found

</h2>

<p
className="
text-gray-400
mt-2
"
>

Create your own room

</p>

</div>

:

<div
className="
space-y-5
"
>

{
rooms.map((room)=>(

<motion.div

key={room._id}

whileHover={{
scale:1.02
}}

className="
bg-white/5
backdrop-blur-xl
border
border-purple-500/20
rounded-3xl
p-6
flex
justify-between
items-center
"
>

<div>

<h2
className="
font-semibold
text-xl
"
>

{room.roomName}

</h2>

<div
className="
flex
gap-4
mt-3
text-sm
text-gray-400
"
>

<div
className="
flex
items-center
gap-1
"
>

<Users size={16}/>


</div>

<div
className="
flex
items-center
gap-1
"
>

<MapPin size={16}/>

{room.radius.toFixed(1)}
m

</div>

</div>

</div>

<button
className="
bg-gradient-to-r
from-purple-600
to-pink-500
px-6
py-2
rounded-full
hover:scale-105
transition
"
>

Join

</button>

</motion.div>

))
}

</div>

}

{
rooms.length<10 && (

<button

className="
w-full
mt-8
border-2
border-dashed
border-purple-500
rounded-3xl
p-5
bg-purple-500/10
flex
items-center
justify-center
gap-3
"

>

<Plus/>

Create New Room

</button>

)

}

</div>

}

</div>

</div>

)

}