import mongoose,{Schema} from "mongoose";

const playlistSchema = new Schema(
    {
        descroption:{
            type:String,
            require:true
        },
        videos:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
        }
    ],
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        name:{
            type:String,
            require:true
        }
    }
    ,{timestamps:true})


export const Playlist = mongoose.model("Playlist",playlistSchema)