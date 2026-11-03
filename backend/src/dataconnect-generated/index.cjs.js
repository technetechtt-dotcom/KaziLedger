const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'business',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createInventoryItemRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateInventoryItem');
}
createInventoryItemRef.operationName = 'CreateInventoryItem';
exports.createInventoryItemRef = createInventoryItemRef;

exports.createInventoryItem = function createInventoryItem(dc) {
  return executeMutation(createInventoryItemRef(dc));
};

const listInventoryItemsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListInventoryItems');
}
listInventoryItemsRef.operationName = 'ListInventoryItems';
exports.listInventoryItemsRef = listInventoryItemsRef;

exports.listInventoryItems = function listInventoryItems(dc) {
  return executeQuery(listInventoryItemsRef(dc));
};

const updateUnitPriceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUnitPrice', inputVars);
}
updateUnitPriceRef.operationName = 'UpdateUnitPrice';
exports.updateUnitPriceRef = updateUnitPriceRef;

exports.updateUnitPrice = function updateUnitPrice(dcOrVars, vars) {
  return executeMutation(updateUnitPriceRef(dcOrVars, vars));
};

const deleteInventoryItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteInventoryItem', inputVars);
}
deleteInventoryItemRef.operationName = 'DeleteInventoryItem';
exports.deleteInventoryItemRef = deleteInventoryItemRef;

exports.deleteInventoryItem = function deleteInventoryItem(dcOrVars, vars) {
  return executeMutation(deleteInventoryItemRef(dcOrVars, vars));
};
