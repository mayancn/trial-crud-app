import mongoose, { Document, Schema } from "mongoose";

export interface IAuthour {
    name: string;
}

export interface IAuthourModel extends IAuthour, Document {}

const AuthorSchema: Schema = new Schema({
        name: {type: String, require: true}

    },{
        versionKey: false
    }
);  

export default mongoose.model<IAuthourModel>('Author', AuthorSchema);
