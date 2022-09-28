const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSupplier = async (req) => {
  const { email, name, address } = req;

  await prisma.supplier.create({
    data: {
      email,
      name,
      address
    }
  });
};

const getAllSuppliers = async () => {
  const suppliers = await prisma.supplier.findMany({});
  return suppliers;
};

const findSupplierById = async (req) => {
  const { id } = req;

  const supplier = await prisma.supplier.findUnique({
    where: {
      id: Number(id)
    }
  });
  return supplier;
};

const findSupplierByName = async (req) => {
  const { name } = req;
  const supplier = await prisma.supplier.findUnique({
    where: {
      name
    }
  });
  return supplier;
};

const updateSupplier = async (req) => {
  const { id, email, name, address } = req;
  supplier = await prisma.supplier.update({
    where: { id },
    data: {
      email,
      name,
      address
    }
  });
  return supplier;
};

const deleteSupplier = async (req) => {
  const { id } = req;
  await prisma.supplier.delete({
    where: {
      id: Number(id)
    }
  });
};

const connectOrCreateSupplierProduct = async (req) => {
  const {
    supplierId,
    productId,
    rate
  } = req;
  const supplierProduct = await prisma.SupplierProduct.upsert({
    where: {
      supplierId_productId: {
        supplierId,
        productId
      }
    },
    update: {
      rate
    },
    create: {
      supplierId,
      productId,
      rate
    }
  });
  return supplierProduct;
};

const getAllSupplierProducts = async () => {
  const supplierProducts = await prisma.SupplierProduct.findMany({});
  return supplierProducts;
};

exports.createSupplier = createSupplier;
exports.getAllSuppliers = getAllSuppliers;
exports.updateSupplier = updateSupplier;
exports.deleteSupplier = deleteSupplier;
exports.findSupplierById = findSupplierById;
exports.findSupplierByName = findSupplierByName;
exports.connectOrCreateSupplierProduct = connectOrCreateSupplierProduct;
exports.getAllSupplierProducts = getAllSupplierProducts;