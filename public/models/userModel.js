const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const { UserStatus, UserRole } = require('@prisma/client');

const createUser = async (req) => {
  const { firstName, lastName, email, password, role, isVerified } = req;
  encryptedPassword = await bcrypt.hash(password, 10);

  await prisma.User.create({
    data: {
      firstName,
      lastName,
      email,
      password: encryptedPassword,
      role,
      isVerified
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
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      password:
        updatedUser.password !== undefined
          ? await bcrypt.hash(updatedUser.password, 10)
          : currUser.password,
      role: updatedUser.role,
      status: updatedUser.status,
      isVerified: updatedUser.isVerified
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

const generatePassword = async (req) => {
  var result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const verifyPassword = async (req) => {
  const { userEmail, currentPassword, newPassword } = req;
  let user = await findUserByEmail({ email: userEmail });
  const is_equal = await bcrypt.compare(currentPassword, user.password);
  if (is_equal) {
    user = await prisma.User.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(newPassword, 10),
        isVerified: true
      }
    });
  }
  return is_equal;
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
exports.generatePassword = generatePassword;
exports.verifyPassword = verifyPassword;
