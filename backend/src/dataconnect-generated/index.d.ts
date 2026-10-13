import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateInventoryItemData {
  inventoryItem_insert: InventoryItem_Key;
}

export interface DeleteInventoryItemData {
  inventoryItem_delete?: InventoryItem_Key | null;
}

export interface DeleteInventoryItemVariables {
  id: UUIDString;
}

export interface InventoryItem_Key {
  id: UUIDString;
  __typename?: 'InventoryItem_Key';
}

export interface InvoiceItem_Key {
  id: UUIDString;
  __typename?: 'InvoiceItem_Key';
}

export interface Invoice_Key {
  id: UUIDString;
  __typename?: 'Invoice_Key';
}

export interface ListInventoryItemsData {
  inventoryItems: ({
    id: UUIDString;
    name: string;
    stockQuantity: number;
    unitPrice: number;
  } & InventoryItem_Key)[];
}

export interface QuoteItem_Key {
  id: UUIDString;
  __typename?: 'QuoteItem_Key';
}

export interface Quote_Key {
  id: UUIDString;
  __typename?: 'Quote_Key';
}

export interface Transaction_Key {
  id: UUIDString;
  __typename?: 'Transaction_Key';
}

export interface UpdateUnitPriceData {
  inventoryItem_update?: InventoryItem_Key | null;
}

export interface UpdateUnitPriceVariables {
  id: UUIDString;
  unitPrice: number;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateInventoryItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateInventoryItemData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateInventoryItemData, undefined>;
  operationName: string;
}
export const createInventoryItemRef: CreateInventoryItemRef;

export function createInventoryItem(): MutationPromise<CreateInventoryItemData, undefined>;
export function createInventoryItem(dc: DataConnect): MutationPromise<CreateInventoryItemData, undefined>;

interface ListInventoryItemsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListInventoryItemsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListInventoryItemsData, undefined>;
  operationName: string;
}
export const listInventoryItemsRef: ListInventoryItemsRef;

export function listInventoryItems(): QueryPromise<ListInventoryItemsData, undefined>;
export function listInventoryItems(dc: DataConnect): QueryPromise<ListInventoryItemsData, undefined>;

interface UpdateUnitPriceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUnitPriceVariables): MutationRef<UpdateUnitPriceData, UpdateUnitPriceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUnitPriceVariables): MutationRef<UpdateUnitPriceData, UpdateUnitPriceVariables>;
  operationName: string;
}
export const updateUnitPriceRef: UpdateUnitPriceRef;

export function updateUnitPrice(vars: UpdateUnitPriceVariables): MutationPromise<UpdateUnitPriceData, UpdateUnitPriceVariables>;
export function updateUnitPrice(dc: DataConnect, vars: UpdateUnitPriceVariables): MutationPromise<UpdateUnitPriceData, UpdateUnitPriceVariables>;

interface DeleteInventoryItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteInventoryItemVariables): MutationRef<DeleteInventoryItemData, DeleteInventoryItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteInventoryItemVariables): MutationRef<DeleteInventoryItemData, DeleteInventoryItemVariables>;
  operationName: string;
}
export const deleteInventoryItemRef: DeleteInventoryItemRef;

export function deleteInventoryItem(vars: DeleteInventoryItemVariables): MutationPromise<DeleteInventoryItemData, DeleteInventoryItemVariables>;
export function deleteInventoryItem(dc: DataConnect, vars: DeleteInventoryItemVariables): MutationPromise<DeleteInventoryItemData, DeleteInventoryItemVariables>;

