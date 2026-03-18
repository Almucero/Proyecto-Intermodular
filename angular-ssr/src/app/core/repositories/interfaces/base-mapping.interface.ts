/**
 * Interfaz base para el mapeo de datos de la API a modelos y viceversa.
 * @template T El tipo de modelo que se está mapeando.
 */
export interface IBaseMapping<T> {
  /** Transforma una lista de objetos de la API a una lista de modelos. */
  getAll(data: any): T[];
  /** Transforma un único objeto de la API al modelo. */
  getOne(data: any): T;
  /** Transforma la respuesta de creación al modelo. */
  getAdded(data: any): T;
  /** Transforma la respuesta de actualización al modelo. */
  getUpdated(data: any): T;
  /** Transforma la respuesta de eliminación al modelo. */
  getDeleted(data: any): T;
  /** Prepara el modelo para ser enviado en una creación. */
  setAdd(data: T): any;
  /** Prepara los datos para ser enviados en una actualización. */
  setUpdate(data: any): any;
}
