export const Resp = {
  success: {
    errorCode: 0,
    errorMessage: '',
  },
  // Api Fail
  paramInputEmpty: {
    errorCode: 1000,
    errorMessage: 'param Input Empty',
  },
  roomIDisNotExist: {
    errorCode: 1001,
    errorMessage: 'roomID is not Exist ',
  },
  // User Fail
  unReady: {
    errorCode: 2000,
    errorMessage: 'Not all players are ready',
  },
};
