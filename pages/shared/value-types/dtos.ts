export interface ValueTypeDto {
  _id: string;
  name: string;
}

export interface ValueSubtypeDto {
  _id: string;
  name: string;
  valueTypeId: string;
}
