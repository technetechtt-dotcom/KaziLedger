# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListInventoryItems*](#listinventoryitems)
- [**Mutations**](#mutations)
  - [*CreateInventoryItem*](#createinventoryitem)
  - [*UpdateUnitPrice*](#updateunitprice)
  - [*DeleteInventoryItem*](#deleteinventoryitem)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListInventoryItems
You can execute the `ListInventoryItems` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listInventoryItems(): QueryPromise<ListInventoryItemsData, undefined>;

interface ListInventoryItemsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListInventoryItemsData, undefined>;
}
export const listInventoryItemsRef: ListInventoryItemsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listInventoryItems(dc: DataConnect): QueryPromise<ListInventoryItemsData, undefined>;

interface ListInventoryItemsRef {
  ...
  (dc: DataConnect): QueryRef<ListInventoryItemsData, undefined>;
}
export const listInventoryItemsRef: ListInventoryItemsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listInventoryItemsRef:
```typescript
const name = listInventoryItemsRef.operationName;
console.log(name);
```

### Variables
The `ListInventoryItems` query has no variables.
### Return Type
Recall that executing the `ListInventoryItems` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListInventoryItemsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListInventoryItemsData {
  inventoryItems: ({
    id: UUIDString;
    name: string;
    stockQuantity: number;
    unitPrice: number;
  } & InventoryItem_Key)[];
}
```
### Using `ListInventoryItems`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listInventoryItems } from '@dataconnect/generated';


// Call the `listInventoryItems()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listInventoryItems();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listInventoryItems(dataConnect);

console.log(data.inventoryItems);

// Or, you can use the `Promise` API.
listInventoryItems().then((response) => {
  const data = response.data;
  console.log(data.inventoryItems);
});
```

### Using `ListInventoryItems`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listInventoryItemsRef } from '@dataconnect/generated';


// Call the `listInventoryItemsRef()` function to get a reference to the query.
const ref = listInventoryItemsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listInventoryItemsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.inventoryItems);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.inventoryItems);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateInventoryItem
You can execute the `CreateInventoryItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createInventoryItem(): MutationPromise<CreateInventoryItemData, undefined>;

interface CreateInventoryItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateInventoryItemData, undefined>;
}
export const createInventoryItemRef: CreateInventoryItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createInventoryItem(dc: DataConnect): MutationPromise<CreateInventoryItemData, undefined>;

interface CreateInventoryItemRef {
  ...
  (dc: DataConnect): MutationRef<CreateInventoryItemData, undefined>;
}
export const createInventoryItemRef: CreateInventoryItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createInventoryItemRef:
```typescript
const name = createInventoryItemRef.operationName;
console.log(name);
```

### Variables
The `CreateInventoryItem` mutation has no variables.
### Return Type
Recall that executing the `CreateInventoryItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateInventoryItemData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateInventoryItemData {
  inventoryItem_insert: InventoryItem_Key;
}
```
### Using `CreateInventoryItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createInventoryItem } from '@dataconnect/generated';


// Call the `createInventoryItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createInventoryItem();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createInventoryItem(dataConnect);

console.log(data.inventoryItem_insert);

// Or, you can use the `Promise` API.
createInventoryItem().then((response) => {
  const data = response.data;
  console.log(data.inventoryItem_insert);
});
```

### Using `CreateInventoryItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createInventoryItemRef } from '@dataconnect/generated';


// Call the `createInventoryItemRef()` function to get a reference to the mutation.
const ref = createInventoryItemRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createInventoryItemRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.inventoryItem_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.inventoryItem_insert);
});
```

## UpdateUnitPrice
You can execute the `UpdateUnitPrice` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUnitPrice(vars: UpdateUnitPriceVariables): MutationPromise<UpdateUnitPriceData, UpdateUnitPriceVariables>;

interface UpdateUnitPriceRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUnitPriceVariables): MutationRef<UpdateUnitPriceData, UpdateUnitPriceVariables>;
}
export const updateUnitPriceRef: UpdateUnitPriceRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUnitPrice(dc: DataConnect, vars: UpdateUnitPriceVariables): MutationPromise<UpdateUnitPriceData, UpdateUnitPriceVariables>;

interface UpdateUnitPriceRef {
  ...
  (dc: DataConnect, vars: UpdateUnitPriceVariables): MutationRef<UpdateUnitPriceData, UpdateUnitPriceVariables>;
}
export const updateUnitPriceRef: UpdateUnitPriceRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUnitPriceRef:
```typescript
const name = updateUnitPriceRef.operationName;
console.log(name);
```

### Variables
The `UpdateUnitPrice` mutation requires an argument of type `UpdateUnitPriceVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUnitPriceVariables {
  id: UUIDString;
  unitPrice: number;
}
```
### Return Type
Recall that executing the `UpdateUnitPrice` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUnitPriceData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUnitPriceData {
  inventoryItem_update?: InventoryItem_Key | null;
}
```
### Using `UpdateUnitPrice`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUnitPrice, UpdateUnitPriceVariables } from '@dataconnect/generated';

// The `UpdateUnitPrice` mutation requires an argument of type `UpdateUnitPriceVariables`:
const updateUnitPriceVars: UpdateUnitPriceVariables = {
  id: ..., 
  unitPrice: ..., 
};

// Call the `updateUnitPrice()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUnitPrice(updateUnitPriceVars);
// Variables can be defined inline as well.
const { data } = await updateUnitPrice({ id: ..., unitPrice: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUnitPrice(dataConnect, updateUnitPriceVars);

console.log(data.inventoryItem_update);

// Or, you can use the `Promise` API.
updateUnitPrice(updateUnitPriceVars).then((response) => {
  const data = response.data;
  console.log(data.inventoryItem_update);
});
```

### Using `UpdateUnitPrice`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUnitPriceRef, UpdateUnitPriceVariables } from '@dataconnect/generated';

// The `UpdateUnitPrice` mutation requires an argument of type `UpdateUnitPriceVariables`:
const updateUnitPriceVars: UpdateUnitPriceVariables = {
  id: ..., 
  unitPrice: ..., 
};

// Call the `updateUnitPriceRef()` function to get a reference to the mutation.
const ref = updateUnitPriceRef(updateUnitPriceVars);
// Variables can be defined inline as well.
const ref = updateUnitPriceRef({ id: ..., unitPrice: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUnitPriceRef(dataConnect, updateUnitPriceVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.inventoryItem_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.inventoryItem_update);
});
```

## DeleteInventoryItem
You can execute the `DeleteInventoryItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteInventoryItem(vars: DeleteInventoryItemVariables): MutationPromise<DeleteInventoryItemData, DeleteInventoryItemVariables>;

interface DeleteInventoryItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteInventoryItemVariables): MutationRef<DeleteInventoryItemData, DeleteInventoryItemVariables>;
}
export const deleteInventoryItemRef: DeleteInventoryItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteInventoryItem(dc: DataConnect, vars: DeleteInventoryItemVariables): MutationPromise<DeleteInventoryItemData, DeleteInventoryItemVariables>;

interface DeleteInventoryItemRef {
  ...
  (dc: DataConnect, vars: DeleteInventoryItemVariables): MutationRef<DeleteInventoryItemData, DeleteInventoryItemVariables>;
}
export const deleteInventoryItemRef: DeleteInventoryItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteInventoryItemRef:
```typescript
const name = deleteInventoryItemRef.operationName;
console.log(name);
```

### Variables
The `DeleteInventoryItem` mutation requires an argument of type `DeleteInventoryItemVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteInventoryItemVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteInventoryItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteInventoryItemData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteInventoryItemData {
  inventoryItem_delete?: InventoryItem_Key | null;
}
```
### Using `DeleteInventoryItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteInventoryItem, DeleteInventoryItemVariables } from '@dataconnect/generated';

// The `DeleteInventoryItem` mutation requires an argument of type `DeleteInventoryItemVariables`:
const deleteInventoryItemVars: DeleteInventoryItemVariables = {
  id: ..., 
};

// Call the `deleteInventoryItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteInventoryItem(deleteInventoryItemVars);
// Variables can be defined inline as well.
const { data } = await deleteInventoryItem({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteInventoryItem(dataConnect, deleteInventoryItemVars);

console.log(data.inventoryItem_delete);

// Or, you can use the `Promise` API.
deleteInventoryItem(deleteInventoryItemVars).then((response) => {
  const data = response.data;
  console.log(data.inventoryItem_delete);
});
```

### Using `DeleteInventoryItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteInventoryItemRef, DeleteInventoryItemVariables } from '@dataconnect/generated';

// The `DeleteInventoryItem` mutation requires an argument of type `DeleteInventoryItemVariables`:
const deleteInventoryItemVars: DeleteInventoryItemVariables = {
  id: ..., 
};

// Call the `deleteInventoryItemRef()` function to get a reference to the mutation.
const ref = deleteInventoryItemRef(deleteInventoryItemVars);
// Variables can be defined inline as well.
const ref = deleteInventoryItemRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteInventoryItemRef(dataConnect, deleteInventoryItemVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.inventoryItem_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.inventoryItem_delete);
});
```

