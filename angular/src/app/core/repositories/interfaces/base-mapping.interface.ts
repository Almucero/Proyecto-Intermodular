export interface IBaseMapping<T> {
  getAll(data: any): T[];
  getOne(data: any): T;
  getAdded(data: any): T;
  getUpdated(data: any): T;
  getDeleted(data: any): T;
  setAdd(data: T): any;
  setUpdate(data: any): any;
}
