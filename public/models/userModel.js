const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const { UserStatus, UserRole } = require('@prisma/client');

const createUser = async (req) => {
  const { email, password } = req;
  encryptedPassword = await bcrypt.hash(password, 10);

  await prisma.User.create({
    data: {
      email,
      password: encryptedPassword
    }
  });
};

const getUsers = async () => {
  const users = await prisma.User.findMany({});
  return users;
};

const findUserById = async (req) => {
  const { id } = req;
  const user = await prisma.User.findUnique({
    where: {
      id
    }
  });
  return user;
};

const findUserByEmail = async (req) => {
  const { email } = req;
  const user = await prisma.User.findUnique({
    where: {
      email: email
    }
  });
  return user;
};

const getUserDetails = async (req) => {
  const { id } = req;
  const user = await prisma.User.findUnique({
    where: {
      id: Number(id)
    }
  });
  return user;
};

const editUser = async (req) => {
  const { updatedUser } = req;
  const id = updatedUser.id;
  const currUser = await findUserById({ id });
  user = await prisma.User.update({
    where: { id: Number(id) },
    data: {
      email: updatedUser.email,
      password:
        updatedUser.password !== undefined
          ? await bcrypt.hash(updatedUser.password, 10)
          : currUser.password,
      role: updatedUser.role,
      status: updatedUser.status
    }
  });
  return user;
};

const deleteUserById = async (req) => {
  const { id } = req;
  const user = await prisma.User.delete({
    where: {
      id: Number(id)
    }
  });
  return id;
};

const enableUser = async (req) => {
  const { id } = req;
  const user = await prisma.User.update({
    where: { id: Number(id) },
    data: {
      status: UserStatus.ACTIVE
    }
  });
  return user;
};

const disableUser = async (req) => {
  const { id } = req;
  const user = await prisma.User.update({
    where: { id: Number(id) },
    data: {
      status: UserStatus.DISABLED
    }
  });
  return user;
};

const changeUserRole = async (req) => {
  const { id, action } = req;
  if (action == 'intern') {
    newRole = UserRole.INTERN;
  } else if (action === 'pt') {
    newRole = UserRole.PARTTIME;
  } else if (action === 'ft') {
    newRole = UserRole.FULLTIME;
  } else if (action === 'customer') {
    newRole = UserRole.CUSTOMER;
  } else if (action === 'admin') {
    newRole = UserRole.ADMIN;
  }
  const user = await prisma.User.update({
    where: { id: Number(id) },
    data: {
      role: newRole
    }
  });
  return user;
};

exports.createUser = createUser;
exports.getUsers = getUsers;
exports.findUserById = findUserById;
exports.findUserByEmail = findUserByEmail;
exports.getUserDetails = getUserDetails;
exports.editUser = editUser;
exports.deleteUserById = deleteUserById;
exports.enableUser = enableUser;
exports.disableUser = disableUser;
exports.changeUserRole = changeUserRole;