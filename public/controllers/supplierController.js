const supplierModel = require('../models/supplierModel');
const productModel = require('../models/productModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createSupplier = async (req, res) => {
  const { email, name, address, supplierProduct } = req.body;
  const supplier = await supplierModel.findSupplierByEmail({ email });
  if (supplier) {
    log.error('ERR_PRODUCT_CREATE-SUPPLIER');
    res.status(400).json({ message: 'Supplier already exists' });
  } else {
    const { data, error } = await common.awaitWrap(
      supplierModel.createSupplier({
        email,
        name,
        address
      })
    );
    if (error) {
      log.error('ERR_SUPPLIER_CREATE-SUPPLIER', error.message);
      res.json(Error.http(error));
    } else {
      if (supplierProduct !== []) {
        supplierProduct.map(async p => {
          await supplierModel.connectOrCreateSupplierProduct({ supplierId: data.id, productId: p.product.id, rate: p.rate })
        })
      }
      log.out('OK_SUPPLIER_CREATE-SUPPLIER');
      res.json({ message: 'supplier created' });
    }
  }
};

const getAllSuppliers = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    supplierModel.getAllSuppliers({})
  );
  if (error) {
    log.error('ERR_SUPPLIER_GET-ALL-SUPPLIERS', error.message);
    res.json(Error.http(error));
  } else {
    let finalRes = [];
    for (let d of data) {
      const supplierProduct = d.supplierProduct;
      let supplierProducts = [];
      for (let sp of supplierProduct) {
        const pdt = await productModel.findProductById({ id: sp.productId });
        const newEntity = {
          ...sp,
          product: pdt
        };
        supplierProducts.push(newEntity);
      }
      const result = {
        id: d.id,
        email: d.email,
        name: d.name,
        address: d.address,
        supplierProduct: supplierProducts
      };
      finalRes.push(result);
      supplierProducts = [];
    }
    log.out('OK_SUPPLIER_GET-ALL-SUPPLIERS');
    res.json(finalRes);
  }
};

const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await supplierModel.findSupplierById({ id });
    let result = {};
    if (supplier !== null) {
      let data = [];
      const supplierProduct = supplier.supplierProduct;
      for (let sp of supplierProduct) {
        const pdt = await productModel.findProductById({ id: sp.productId });
        const newEntity = {
          ...sp,
          product: pdt
        };
        data.push(newEntity);
      }
      result = {
        ...supplier,
        supplierProduct: data
      }
      log.out('OK_SUPPLIER_GET-SUPPLIER-BY-ID');
      res.json(result);
    } else {
      res.json(null);
    }
  } catch (error) {
    log.error('ERR_SUPPLIER_GET-SUPPLIER', error.message);
    res.status(500).send('Server Error');
  }
};

const getSupplierByName = async (req, res) => {
  try {
    const { name } = req.body;
    const supplier = await supplierModel.findSupplierByName({ name });
    log.out('OK_SUPPLIER_GET-SUPPLIER-BY-ID');
    res.json(supplier);
  } catch (error) {
    log.error('ERR_SUPPLIER_GET-SUPPLIER', error.message);
    res.status(500).send('Server Error');
  }
};

const updateSupplier = async (req, res) => {
  const { id, email, name, address, supplierProduct } = req.body;
  const { data, error } = await common.awaitWrap(
    supplierModel.updateSupplier({
      id,
      email,
      name,
      address,
      supplierProduct
    })
  );
  if (error) {
    log.error('ERR_SUPPLIER_UPDATE-SUPPLIER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SUPPLIER_UPDATE-SUPPLIER');
    res.json(data);
  }
};

const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  const { data, getAllProductsFromSupplierError } = await common.awaitWrap(
    supplierModel.findProductsFromSupplier({ id })
  );
  if (getAllProductsFromSupplierError) {
    log.error('ERR_SUPPLIER_GET-ALL-PRODUCTS-FROM-SUPPLIER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SUPPLIER_GET-ALL-PRODUCTS-FROM-SUPPLIER');
  }
  const { error: deleteProductsError } = await common.awaitWrap(
    Promise.allSettled(
      data.map(async (p) => {
        await supplierModel.deleteProductBySupplier({ supplierId: id, productId: p.productId });
      })
    )
  );
  if (deleteProductsError) {
    log.error('ERR_SUPPLIER_DELETE-ALL-PRODUCTS-FROM-SUPPLIER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  }
  const { error } = await common.awaitWrap(supplierModel.deleteSupplier({ id }));
  if (error) {
    log.error('ERR_SUPPLIER_DELETE-SUPPLIER', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SUPPLIER_DELETE-SUPPLIER');
    res.json({ message: `Deleted supplier with id:${id}` });
  }
};

const addProductToSupplier = async (req, res) => {
  const { supplierId, productId, rate } = req.body;
  const supplier = supplierModel.findSupplierById({ id: supplierId });
  const product = productModel.findProductById({ id: productId });
  if (!supplier || !product) {
    log.error('ERR_SUPPLIER_ADD-PRODUCT-TO-SUPPLIER', error.message);
    res.json({ "message" : "Supplier or product does not exist." });
  }
  const { data, error } = await common.awaitWrap(
    supplierModel.connectOrCreateSupplierProduct({ supplierId, productId, rate })
  );
  if (error) {
    log.error('ERR_SUPPLIER_ADD-PRODUCT-TO-SUPPLIER', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_SUPPLIER_ADD-PRODUCT-TO-SUPPLIER');
    res.json(data);
  }
};

const getAllSupplierProducts = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    supplierModel.getAllSupplierProducts({})
  );
  if (error) {
    log.error('ERR_SUPPLIER_GET-ALL-SUPPLIER-PRODUCTS', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_SUPPLIER_GET-ALL-SUPPLIER=PRODUCTS');
    res.json(data);
  }
};

const getAllProductsBySupplier = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await common.awaitWrap(
    supplierModel.findProductsFromSupplier({ id })
  );
  if (error) {
    log.error('ERR_SUPPLIER_GET-ALL-PRODUCTS-BY-SUPPLIER', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_SUPPLIER_GET-ALL-PRODUCTS-BY-SUPPLIER');
    res.json(data);
  }
};

const deleteProductBySupplier = async (req, res) => {
  const { supplierId, productId } = req.params;
  const { error } = await common.awaitWrap(
    supplierModel.deleteProductBySupplier({ supplierId, productId })
  );
  if (error) {
    log.error('ERR_SUPPLIER_DELETE-PRODUCT-BY-SUPPLIER', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_SUPPLIER_DELETE-PRODUCT-BY-SUPPLIER');
    res.json({ message: `Deleted product id: ${productId} from supplier id: ${supplierId}` });
  }
};

exports.createSupplier = createSupplier;
exports.getAllSuppliers = getAllSuppliers;
exports.updateSupplier = updateSupplier;
exports.deleteSupplier = deleteSupplier;
exports.getSupplier = getSupplier;
exports.getSupplierByName = getSupplierByName;
exports.addProductToSupplier = addProductToSupplier;
exports.getAllSupplierProducts = getAllSupplierProducts;
exports.getAllProductsBySupplier = getAllProductsBySupplier;
exports.deleteProductBySupplier = deleteProductBySupplier;
