//most of the time type define hota hai tab interface hi hota hai wha par
import {Message} from "../model/User.model"


export interface ApiResponse{
success:boolean;
message:string;
isAcceptingMessage?:boolean,
Message ?:Array<Message>
}


