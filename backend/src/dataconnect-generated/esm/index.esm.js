import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'business',
  location: 'us-central1'
};

export const createInventoryItemRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateInventoryItem');
}
createInventoryItemRef.operationName = 'CreateInventoryItem';

export function createInventoryItem(dc) {
  return executeMutation(createInventoryItemRef(dc));
}

export const listInventoryItemsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListInventoryItems');
}
listInventoryItemsRef.operationName = 'ListInventoryItems';

export function listInventoryItems(dc) {
  return executeQuery(listInventoryItemsRef(dc));
}

export const updateUnitPriceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUnitPrice', inputVars);
}
updateUnitPriceRef.operationName = 'UpdateUnitPrice';

export function updateUnitPrice(dcOrVars, vars) {
  return executeMutation(updateUnitPriceRef(dcOrVars, vars));
}

export const deleteInventoryItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteInventoryItem', inputVars);
}
deleteInventoryItemRef.operationName = 'DeleteInventoryItem';

export function deleteInventoryItem(dcOrVars, vars) {
  return executeMutation(deleteInventoryItemRef(dcOrVars, vars));
}

