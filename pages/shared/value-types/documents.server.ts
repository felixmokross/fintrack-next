import { ObjectId } from "mongodb";

export interface ValueType {
  _id: ObjectId;
  name: string;
}

export interface ValueSubtype {
  _id: ObjectId;
  name: string;
  valueTypeId: ObjectId;
}
