import { NextRequest,NextResponse } from "next/server"
import dbConnect from "../../../../lib/dbConnect"
import LocationModel from "../../../../model/Location.model"    

export async function GET(
request:NextRequest
){

await dbConnect()
const searchParams=
request.nextUrl.searchParams

const lat=
Number(searchParams.get("lat"))

const lng=
Number(searchParams.get("lng"))

const rooms=
await LocationModel.find({

location:{

$near:{

$geometry:{
type:"Point",
coordinates:[lng,lat]
},

$maxDistance:5000

}

}

})

return NextResponse.json({
rooms
})

}